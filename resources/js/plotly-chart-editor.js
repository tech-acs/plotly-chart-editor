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
let _canvasEl = null
let _renderTimer = null
let _autoSyncTimer = null
let _booted = false
let _deleteConfirmMsg = 'Delete this trace? This cannot be undone.'

/**
 * Bootstrap the chart builder Alpine store.
 * Safe to call multiple times (idempotent after first call).
 *
 * @param {object} payload
 * @param {string} plotlyMissingMessage
 * @param {string} deleteConfirmMessage
 */
function initChartBuilder(payload, plotlyMissingMessage, deleteConfirmMessage) {
    _deleteConfirmMsg = deleteConfirmMessage ?? _deleteConfirmMsg

    const alreadyExists = !!Alpine.store('chartBuilder')

    if (!alreadyExists) {
        Alpine.store('chartBuilder', {
            // ── Loaded from Livewire on mount ─────────────────────────────
            dataSources:    payload.dataSources    ?? {},
            schemaProfiles: payload.schemaProfiles ?? {},

            // ── Managed by Alpine ─────────────────────────────────────────
            traces:     payload.traces     ?? [],
            layout:     payload.layout     ?? {},
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

            // ── Internal flags ────────────────────────────────────────────
            _plotlyMissingMessage: plotlyMissingMessage,
            _plotlyMissing:        false,

            // ── Effects ───────────────────────────────────────────────────

            _startEffects() {
                Alpine.effect(() => {
                    JSON.stringify(toRaw(this.traces))
                    this._scheduleRender()
                })
                Alpine.effect(() => {
                    JSON.stringify(toRaw(this.layout))
                    this._scheduleRender()
                })
            },

            // ── Render pipeline ───────────────────────────────────────────

            _scheduleRender() {
                clearTimeout(_renderTimer)
                _renderTimer = setTimeout(() => {
                    this._render()
                    if (_booted) {
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

                const traces = toRaw(this.traces)
                const moved  = traces.splice(from, 1)[0]
                traces.splice(to, 0, moved)
                this.traces = traces
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
                    .finally(() => {
                        this.syncing      = false
                        this.dirty        = false
                        this.lastSyncAt   = Date.now()
                    })
            },

            setWire(wire) {
                _wire = wire
            },
        })
    }

    return Alpine.store('chartBuilder')
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
    const store = initChartBuilder(payload, plotlyMissingMessage, deleteConfirmMessage)

    _canvasEl = canvasEl
    _wire     = wire

    if (typeof window.Plotly === 'undefined') {
        store._plotlyMissing = true
        if (canvasEl) canvasEl.textContent = plotlyMissingMessage
        return
    }

    if (!_booted) {
        store._startEffects()
        _booted = true
        store._render()
    } else {
        store._render()
    }
}

if (typeof window !== 'undefined') {
    window.initChartBuilder = initChartBuilder
    window.bootChartBuilder = bootChartBuilder
}

export { initChartBuilder, bootChartBuilder }
