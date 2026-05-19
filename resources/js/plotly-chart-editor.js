/**
 * plotly-chart-editor.js
 *
 * Registers Alpine.store('chartBuilder', ...) with the shape defined in PRD §4.
 * Livewire 4 bundles Alpine internally — do NOT load a second Alpine instance.
 *
 * Plotly.js is a peer dependency — this file expects window.Plotly to exist.
 */

/**
 * Unwrap an Alpine reactive proxy to a plain object so structuredClone() works.
 * Alpine.raw() is the official API for this (Alpine 3.x).
 */
function toRaw(value) {
    if (typeof Alpine !== 'undefined' && typeof Alpine.raw === 'function') {
        return Alpine.raw(value)
    }
    return value
}

/**
 * Deep-clone any value, safely handling Alpine reactive proxies.
 */
function deepClone(value) {
    return structuredClone(toRaw(value))
}

// Module-level closure state — outside the Alpine store so Alpine never
// wraps them in reactive proxies.
let _wire = null

/**
 * Map of display trace type → actual Plotly trace type.
 * Used in compileTrace() so non-native types like "area" render correctly.
 */
const _plotlyTypeMap = {
    area: 'scatter',
}

/**
 * Defaults applied when switching to a display type (in _applyTraceType).
 * Keys/values are merged into the new trace.
 */
const _typeDefaults = {
    area: { mode: 'none', fill: 'tozeroy' },
}
let _canvasEl = null
let _renderTimer = null
let _autoSyncTimer = null
let _booted = false
let _suppressNextDirty = false   // blocks the first markDirty() after initial render
let _deleteConfirmMsg  = 'Delete this trace? This cannot be undone.'
let _savedTimer        = null    // clears the "Saved ✓" transient message
let _copiedTimer       = null    // clears the "Copied ✓" transient message
let _resizeObserver    = null    // ResizeObserver for viewport gate

/**
 * Bootstrap the chart builder Alpine store.
 * Safe to call multiple times (idempotent after first call).
 *
 * @param {object} payload
 * @param {string} plotlyMissingMessage
 * @param {string} deleteConfirmMessage
 */
/**
 * Deep-merge `defaults` into `target` without overwriting existing values.
 * Only plain objects are recursed; arrays and primitives are left as-is.
 */
function mergeDefaults(target, defaults) {
    for (const [key, val] of Object.entries(defaults)) {
        if (target[key] === undefined || target[key] === null) {
            target[key] = structuredClone(val)
        } else if (
            typeof val === 'object' && !Array.isArray(val) &&
            typeof target[key] === 'object' && !Array.isArray(target[key])
        ) {
            mergeDefaults(target[key], val)
        }
    }
    return target
}

/**
 * Ensure the layout object always contains the nested sub-objects that the
 * Fold 2 / Fold 3 primitives bind into. Without these, Alpine throws
 * "Cannot read properties of undefined" on first render.
 */
const LAYOUT_DEFAULTS = {
    // Nested sub-objects that primitives bind into must always exist.
    // We provide structural defaults only — values that match Plotly's own
    // defaults so the controls reflect the actual chart state on first render.
    //
    // plot_bgcolor / paper_bgcolor are intentionally NOT defaulted here:
    // Plotly's default is transparent, which browsers render as white. Injecting
    // '#ffffff' would make the controls show white while the chart uses transparent
    // — causing a visible mismatch. Let the consumer provide these explicitly.
    title:  { text: '', font: { family: 'Arial', size: 16, color: '#000000' } },
    xaxis:  {
        title: { text: '' },
        showgrid: true,
        zeroline: true,
        tickangle: 0,
        tickfont: { family: 'Arial', size: 12, color: '#000000' },
    },
    yaxis:  {
        title: { text: '' },
        showgrid: true,
        zeroline: true,
        tickformat: '',
    },
    margin:     { t: 50, b: 50, l: 60, r: 30 },
    showlegend: false,
    legend:     { orientation: 'v' },
}

function initChartBuilder(payload, plotlyMissingMessage, deleteConfirmMessage) {
    _deleteConfirmMsg = deleteConfirmMessage ?? _deleteConfirmMsg

    // Ensure layout sub-objects always exist before the store is registered.
    const layout = mergeDefaults(payload.layout ?? {}, LAYOUT_DEFAULTS)

    // Register the store only on first call.
    // IMPORTANT: Alpine.store(name, value) returns void, not the store.
    // We must call Alpine.store(name) separately after registration.
    // Do NOT combine registration + retrieval in one expression — Vite
    // minifies `if (!s) { Alpine.store(n, v) } return Alpine.store(n)`
    // into `Alpine.store(n) || Alpine.store(n, v)` which returns undefined
    // on the first call (because Alpine.store(n,v) returns void).
    let _storeAlreadyRegistered = !!Alpine.store('chartBuilder')
    if (!_storeAlreadyRegistered) {
        Alpine.store('chartBuilder', {
            // ── Loaded from Livewire on mount ─────────────────────────────
            dataSources:    payload.dataSources    ?? {},
            schemaProfiles: payload.schemaProfiles ?? {},

            // ── Managed by Alpine ─────────────────────────────────────────
            traces:     payload.traces     ?? [],
            layout,
            config:     payload.config     ?? { responsive: true },

            // ── Sync / UI config ──────────────────────────────────────────
            syncMode:   payload.syncMode   ?? 'manual',
            traceTypes: payload.traceTypes ?? ['bar'],
            showExport: payload.showExport ?? true,

            // ── Derived ───────────────────────────────────────────────────
            activeTraceIndex: 0,

            // ── Validation & sync state ───────────────────────────────────
            warnings:   [],
            dirty:      false,
            syncing:    false,
            lastSyncAt: null,
            savedAt:    null,   // timestamp of last successful sync (drives "Saved ✓")
            copiedAt:   null,   // timestamp of last clipboard copy (drives "Copied ✓")

            // ── Internal flags ────────────────────────────────────────────
            _plotlyMissingMessage: plotlyMissingMessage,
            _plotlyMissing:        false,
            _tooSmall:             false,

            // ── Conditional visibility helpers (PRD §8) ───────────────────

            /**
             * Alias: the active trace object.
             * Used in xshow expressions: `trace.mode && trace.mode.includes('lines')`
             */
            get trace() {
                return this.traces[this.activeTraceIndex] ?? {}
            },

            /**
             * Alias: the active trace type string.
             * Used in xshow expressions: `traceType !== 'pie'`
             */
            get traceType() {
                return this.traces[this.activeTraceIndex]?.type ?? ''
            },

            /**
             * Read a dot-separated path from an object.
             * e.g. getPath(trace, 'marker.color') === trace.marker.color
             *
             * @param {object} obj
             * @param {string} path  dot-separated key string
             * @returns {*}
             */
            getPath(obj, path) {
                return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)
            },

            /**
             * Write a value at a dot-separated path on an object,
             * creating intermediate objects as needed.
             *
             * @param {object} obj
             * @param {string} path  dot-separated key string
             * @param {*}      value
             */
            setPath(obj, path, value) {
                const keys = path.split('.')
                let cur = obj
                for (let i = 0; i < keys.length - 1; i++) {
                    if (cur[keys[i]] == null || typeof cur[keys[i]] !== 'object') {
                        cur[keys[i]] = {}
                    }
                    cur = cur[keys[i]]
                }
                cur[keys[keys.length - 1]] = value
            },

            /**
             * Whether the given trace type supports marker config.
             * @param {string} type
             * @returns {boolean}
             */
            hasMarkerSupport(type) {
                return ['scatter', 'bar', 'histogram', 'pie'].includes(type)
            },

            /**
             * Whether the given trace type supports fill config.
             * @param {string} type
             * @returns {boolean}
             */
            hasFillSupport(type) {
                return ['scatter'].includes(type)
            },

            // ── Effects ───────────────────────────────────────────────────

            _startEffects() {
                const self = this

                Alpine.effect(() => {
                    // Read through the reactive proxy — do NOT call toRaw() here.
                    // toRaw() strips the proxy, so Alpine can only track the
                    // top-level reference, not mutations inside the array
                    // (e.g. push, splice, or property changes on trace objects).
                    // JSON.stringify walks every property through the proxy,
                    // registering a dependency on each one.
                    JSON.stringify(self.traces)
                    self._scheduleRender()
                })

                Alpine.effect(() => {
                    JSON.stringify(self.layout)
                    self._scheduleRender()
                })
            },

            // ── Render pipeline ───────────────────────────────────────────

            _scheduleRender() {
                clearTimeout(_renderTimer)
                _renderTimer = setTimeout(() => {
                    this.validate()
                    this._render()
                    if (_suppressNextDirty) {
                        // Swallow the first auto-sync triggered by the initial
                        // render — it would cause Livewire to morph the DOM and
                        // destroy Alpine's event bindings before any user interaction.
                        _suppressNextDirty = false
                    } else {
                        this.markDirty()
                    }
                }, 50)
            },

            _render() {
                if (this._plotlyMissing || !_canvasEl) return

                const resolved = toRaw(this.traces).map(t => this.resolveMeta(t))
                window.Plotly.react(
                    _canvasEl,
                    resolved,
                    deepClone(this.layout),
                    deepClone(this.config)
                )
            },

            // ── Validation (PRD §11) ──────────────────────────────────────

            /**
             * Run all validations against current traces and dataSources.
             * Mutates this.warnings in place — replaces the entire array so
             * Alpine tracks the change.
             */
            validate() {
                const warnings = []

                toRaw(this.traces).forEach((trace, traceIndex) => {
                    const columnNames = trace.meta?.columnNames ?? {}

                    // Collect resolved column lengths for this trace
                    const lengths = {}
                    for (const [field, colName] of Object.entries(columnNames)) {
                        if (colName && this.dataSources[colName]) {
                            lengths[field] = toRaw(this.dataSources[colName]).length
                        }
                    }

                    const lengthValues = Object.values(lengths)
                    if (lengthValues.length < 2) return

                    const expectedLen = Math.min(...lengthValues)
                    const maxLen      = Math.max(...lengthValues)

                    if (expectedLen !== maxLen) {
                        for (const [field, colLen] of Object.entries(lengths)) {
                            if (colLen !== expectedLen) {
                                warnings.push({
                                    traceIndex,
                                    field,
                                    code:    'LENGTH_MISMATCH',
                                    message: `Column '${field}' has ${colLen} values but trace expects ${expectedLen}. Showing first ${expectedLen}.`,
                                })
                            }
                        }
                    }
                })

                // Replace array contents reactively
                this.warnings.splice(0, this.warnings.length, ...warnings)
            },

            /**
             * Return the warning (if any) for a specific trace+field combination.
             * Used by the inline warning in the column selector.
             */
            warningFor(traceIndex, field) {
                return toRaw(this.warnings).find(
                    w => w.traceIndex === traceIndex && w.field === field
                ) ?? null
            },

            // ── Meta resolution ───────────────────────────────────────────

            resolveMeta(trace) {
                const resolved = deepClone(trace)
                const columnNames = resolved.meta?.columnNames ?? {}

                for (const [axis, columnName] of Object.entries(columnNames)) {
                    if (columnName && this.dataSources[columnName] !== undefined) {
                        resolved[axis] = toRaw(this.dataSources[columnName])
                    }
                }

                return resolved
            },

            compileTrace(trace) {
                const compiled = this.resolveMeta(trace)
                compiled.type = _plotlyTypeMap[compiled.type] ?? compiled.type
                delete compiled.meta
                return compiled
            },

            // ── Trace operations (PRD §6) ─────────────────────────────────

            /**
             * Append a new empty trace with the given type (defaults to first
             * enabled type). Sets it as active.
             *
             * @param {string} [type]
             */
            addTrace(type) {
                const traceType = type ?? toRaw(this.traceTypes)[0] ?? 'bar'
                this.traces.push({
                    type: traceType,
                    name: `Trace ${this.traces.length + 1}`,
                    meta: { columnNames: {} },
                })
                this.activeTraceIndex = this.traces.length - 1
            },

            /**
             * Deep-copy the active trace and append it. Sets the copy active.
             *
             * @param {number} [index]
             */
            duplicateTrace(index) {
                const i = index ?? this.activeTraceIndex
                const copy = deepClone(toRaw(this.traces)[i])
                copy.name = (copy.name ?? `Trace ${i + 1}`) + ' (copy)'
                this.traces.push(copy)
                this.activeTraceIndex = this.traces.length - 1
            },

            /**
             * Remove a trace after native confirm(). Adjusts activeTraceIndex
             * so it never goes out of bounds.
             *
             * @param {number} [index]
             */
            removeTrace(index) {
                const i = index ?? this.activeTraceIndex

                if (!window.confirm(_deleteConfirmMsg)) return

                this.traces.splice(i, 1)

                // Clamp activeTraceIndex to valid range
                if (this.traces.length === 0) {
                    this.activeTraceIndex = 0
                } else if (this.activeTraceIndex >= this.traces.length) {
                    this.activeTraceIndex = this.traces.length - 1
                }
            },

            /**
             * Swap trace at `from` with trace at `to`.
             *
             * @param {number} from
             * @param {number} to
             */
            moveTrace(from, to) {
                const len = this.traces.length
                if (to < 0 || to >= len) return

                // Splice the reactive array directly — do NOT assign a new array,
                // as that would replace the reactive proxy with a plain value.
                const moved = deepClone(toRaw(this.traces[from]))
                this.traces.splice(from, 1)
                this.traces.splice(to, 0, moved)
                this.activeTraceIndex = to
            },

            /**
             * Move the active trace one step up (lower index = rendered first).
             */
            moveTraceUp(index) {
                const i = index ?? this.activeTraceIndex
                this.moveTrace(i, i - 1)
            },

            /**
             * Move the active trace one step down.
             */
            moveTraceDown(index) {
                const i = index ?? this.activeTraceIndex
                this.moveTrace(i, i + 1)
            },

            // ── Trace type switching (PRD §6) ─────────────────────────────

            /**
             * Change a trace's type. If the profile is not yet cached,
             * lazy-loads via $wire.getSchemaProfile(). On failure: revert +
             * dispatch toast (PRD §11.2).
             *
             * @param {number} index
             * @param {string} newType
             */
            async setTraceType(index, newType) {
                const previousType = toRaw(this.traces)[index]?.type

                if (previousType === newType) return

                if (this.schemaProfiles[newType]) {
                    this._applyTraceType(index, newType)
                    return
                }

                if (!_wire) return

                try {
                    const profile = await _wire.getSchemaProfile(newType)

                    if (!profile || typeof profile !== 'object' || !profile.groups) {
                        throw new Error(`Invalid profile returned for type "${newType}"`)
                    }

                    this.schemaProfiles[newType] = profile
                    this._applyTraceType(index, newType)
                } catch (err) {
                    console.error(`[plotly-chart-editor] Failed to load profile for "${newType}":`, err)
                    this._dispatchToast(newType)
                }
            },

            _applyTraceType(index, newType) {
                const profile  = this.schemaProfiles[newType]
                const oldTrace = deepClone(toRaw(this.traces)[index] ?? {})
                const keepKeys = this._profileFieldKeys(profile)

                const pruned = { type: newType }

                for (const k of ['name', 'meta']) {
                    if (oldTrace[k] !== undefined) pruned[k] = oldTrace[k]
                }

                for (const k of Object.keys(oldTrace)) {
                    if (['type', 'name', 'meta'].includes(k)) continue
                    if (keepKeys.has(k)) pruned[k] = oldTrace[k]
                }

                // Apply type-specific defaults (e.g. area → mode='none', fill='tozeroy')
                const defaults = _typeDefaults[newType] ?? {}
                for (const [k, v] of Object.entries(defaults)) {
                    pruned[k] = v
                }

                this.traces[index] = pruned
            },

            _profileFieldKeys(profile) {
                const keys = new Set()

                for (const group of Object.values(profile?.groups ?? {})) {
                    for (const field of group?.fields ?? []) {
                        keys.add(field.key.split('.')[0])
                    }
                }

                return keys
            },

            _dispatchToast(type) {
                window.dispatchEvent(new CustomEvent('plotly-editor:toast', {
                    detail: {
                        key:     'errors.profile_load_failed',
                        message: `Failed to load profile for ${type}. Please try again.`,
                        type,
                    },
                }))
            },

            // ── Export (PRD §10) ──────────────────────────────────────────

            /**
             * Download the full chart config as chart.json.
             * meta is stripped — the file is ready for direct use with Plotly.newPlot().
             */
            exportJSON() {
                const data = toRaw(this.traces).map(t => this.compileTrace(t))
                const payload = JSON.stringify(
                    { data, layout: deepClone(this.layout), config: deepClone(this.config) },
                    null,
                    2
                )
                this._download('chart.json', 'application/json', payload)
            },

            /**
             * Export the current chart canvas as an image.
             *
             * @param {'png'|'jpeg'|'svg'|'webp'} format
             */
            async exportImage(format = 'png') {
                if (this._plotlyMissing || !_canvasEl) return

                try {
                    const dataUrl = await window.Plotly.toImage(_canvasEl, {
                        format,
                        width:  _canvasEl.offsetWidth  || 1200,
                        height: _canvasEl.offsetHeight || 600,
                    })
                    this._download(`chart.${format}`, `image/${format}`, dataUrl, true)
                } catch (err) {
                    console.error('[plotly-chart-editor] exportImage failed:', err)
                }
            },

            /**
             * Copy the chart config JSON to the clipboard.
             * Shows a transient "Copied ✓" indicator via copiedAt.
             */
            async copyConfig() {
                const data = toRaw(this.traces).map(t => this.compileTrace(t))
                const text = JSON.stringify(
                    { data, layout: deepClone(this.layout), config: deepClone(this.config) },
                    null,
                    2
                )

                try {
                    await navigator.clipboard.writeText(text)
                    this.copiedAt = Date.now()
                    clearTimeout(_copiedTimer)
                    _copiedTimer = setTimeout(() => { this.copiedAt = null }, 2000)
                } catch (err) {
                    console.error('[plotly-chart-editor] copyConfig failed:', err)
                }
            },

            /**
             * Trigger a browser download of content as a file.
             *
             * @param {string}  filename
             * @param {string}  mimeType
             * @param {string}  content
             * @param {boolean} isDataUrl  When true, content is already a data URL.
             */
            _download(filename, mimeType, content, isDataUrl = false) {
                const a    = document.createElement('a')
                a.href     = isDataUrl ? content : `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`
                a.download = filename
                a.style.display = 'none'
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
            },

            // ── Sync state ────────────────────────────────────────────────

            markDirty() {
                this.dirty = true
                this._maybeAutoSync()
            },

            _maybeAutoSync() {
                if (this.syncMode === 'auto' || this.syncMode === 'hybrid') {
                    clearTimeout(_autoSyncTimer)
                    _autoSyncTimer = setTimeout(() => this.syncToBackend(), 500)
                }
            },

            syncToBackend() {
                if (this.syncing || !_wire) return

                this.syncing = true

                const wirePayload = {
                    traces: toRaw(this.traces).map(t => this.compileTrace(t)),
                    layout: deepClone(this.layout),
                }

                _wire.syncFromAlpine(JSON.stringify(wirePayload))
                    .then(() => {
                        this.savedAt = Date.now()
                        clearTimeout(_savedTimer)
                        _savedTimer = setTimeout(() => { this.savedAt = null }, 2000)
                    })
                    .finally(() => {
                        this.syncing    = false
                        this.dirty      = false
                        this.lastSyncAt = Date.now()
                    })
            },

            setWire(wire) {
                _wire = wire
            },
        })
    }

    // NOTE: do not return Alpine.store('chartBuilder') here.
    // Vite collapses the if-block + return into an || expression that
    // returns void on the first call. Callers must call
    // Alpine.store('chartBuilder') themselves after this function runs.
}


/**
 * Boot (or re-boot) the store against a canvas DOM element.
 *
 * @param {object}      payload
 * @param {string}      plotlyMissingMessage
 * @param {string}      deleteConfirmMessage
 * @param {HTMLElement} canvasEl
 * @param {object}      wire
 */
function bootChartBuilder(payload, plotlyMissingMessage, deleteConfirmMessage, canvasEl, wire) {
    // Register the store (side effect) — do NOT use its return value,
    // Vite minification makes it unreliable (see initChartBuilder comment).
    initChartBuilder(payload, plotlyMissingMessage, deleteConfirmMessage)

    // Retrieve the store directly — always returns the registered object.
    const store = Alpine.store('chartBuilder')

    _canvasEl = canvasEl
    _wire     = wire

    if (typeof window.Plotly === 'undefined') {
        store._plotlyMissing = true
        if (canvasEl) canvasEl.textContent = plotlyMissingMessage
        return
    }

    if (_booted) {
        store._render()
    }

    // ── Viewport gate (PRD §13.3) ─────────────────────────────────────────
    // Observe the root element's width. When it drops below 1024px, set the
    // _tooSmall flag (x-show hides the sidebar/canvas in Blade), purge Plotly
    // to release memory, and mark not-booted so it re-initialises on resize up.
    if (_resizeObserver) {
        _resizeObserver.disconnect()
    }

    const rootEl = canvasEl?.closest('.chart-builder')

    if (rootEl && typeof ResizeObserver !== 'undefined') {
        _resizeObserver = new ResizeObserver(entries => {
            const width     = entries[0]?.contentRect?.width ?? window.innerWidth
            const tooSmall  = width < 1024
            store._tooSmall = tooSmall

            if (tooSmall && _canvasEl && typeof window.Plotly !== 'undefined') {
                window.Plotly.purge(_canvasEl)
                _booted = false
            }
            // Re-mount is handled by the canvas observer below — no immediate
            // render here, so Plotly sees the canvas at its final size.
        })
        _resizeObserver.observe(rootEl)
    }

    // ── Canvas resize observer ──────────────────────────────────────────
    // Delay the initial render until the canvas element actually has its
    // final dimensions (the CSS Grid may not have settled yet). This avoids
    // the visible "jump" from a wrong-sized chart to the correct size.
    // On subsequent size changes, Plotly.Plots.resize() handles it silently.
    if (canvasEl && typeof ResizeObserver !== 'undefined') {
        const canvasObserver = new ResizeObserver(() => {
            if (store._plotlyMissing || typeof window.Plotly === 'undefined') return
            if (store._tooSmall) return
            const rect = canvasEl.getBoundingClientRect()
            if (rect.width === 0 || rect.height === 0) return

            if (!_booted) {
                _suppressNextDirty = true
                store._startEffects()
                _booted = true
                store._render()
            } else {
                window.Plotly.Plots.resize(canvasEl)
            }
        })
        canvasObserver.observe(canvasEl)
    }
}

if (typeof window !== 'undefined') {
    window.initChartBuilder = initChartBuilder
    window.bootChartBuilder = bootChartBuilder
}

export { initChartBuilder, bootChartBuilder }
