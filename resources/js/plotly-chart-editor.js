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
 *
 * @param {*} value
 * @returns {*}
 */
function toRaw(value) {
    if (typeof Alpine !== 'undefined' && typeof Alpine.raw === 'function') {
        return Alpine.raw(value)
    }
    return value
}

/**
 * Deep-clone any value, safely handling Alpine reactive proxies.
 *
 * @param {*} value
 * @returns {*}
 */
function deepClone(value) {
    return structuredClone(toRaw(value))
}

// Module-level closure state — lives outside the Alpine store so Alpine
// never wraps these in reactive proxies.
let _wire = null
let _canvasEl = null
let _renderTimer = null
let _autoSyncTimer = null
let _booted = false

/**
 * Bootstrap the chart builder Alpine store.
 * Safe to call multiple times (idempotent after first call).
 *
 * @param {object} payload              — serialized from the Livewire mount payload
 * @param {string} plotlyMissingMessage — translatable error string from PHP
 */
function initChartBuilder(payload, plotlyMissingMessage) {
    const alreadyExists = !!Alpine.store('chartBuilder')

    if (!alreadyExists) {
        Alpine.store('chartBuilder', {
            // ── Loaded from Livewire on mount ─────────────────────────────
            dataSources:    payload.dataSources    ?? {},
            schemaProfiles: payload.schemaProfiles ?? {},

            // ── Managed by Alpine ─────────────────────────────────────────
            traces: payload.traces ?? [],
            layout: payload.layout ?? {},
            config: payload.config ?? { responsive: true },

            // ── Sync / UI config ──────────────────────────────────────────
            syncMode:    payload.syncMode    ?? 'manual',
            traceTypes:  payload.traceTypes  ?? ['bar'],
            showExport:  payload.showExport  ?? true,

            // ── Derived ───────────────────────────────────────────────────
            activeTraceIndex: 0,

            // ── Validation & sync state ───────────────────────────────────
            warnings:   [],
            dirty:      false,
            syncing:    false,
            lastSyncAt: null,

            // ── Internal flags (reactive — safe) ──────────────────────────
            _plotlyMissingMessage: plotlyMissingMessage,
            _plotlyMissing:        false,

            // ── Effects setup ─────────────────────────────────────────────

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

            // ── Trace type switching (PRD §6) ─────────────────────────────

            /**
             * Change a trace's type. If the profile is not yet cached, lazy-loads
             * it via $wire.getSchemaProfile(). On failure: reverts type, emits toast.
             *
             * @param {number} index    — trace index in this.traces
             * @param {string} newType  — target trace type
             */
            async setTraceType(index, newType) {
                const previousType = toRaw(this.traces)[index]?.type

                if (previousType === newType) return

                // If profile already cached, proceed immediately (no network call)
                if (this.schemaProfiles[newType]) {
                    this._applyTraceType(index, newType)
                    return
                }

                // Lazy-load via Livewire
                if (!_wire) return

                try {
                    const profile = await _wire.getSchemaProfile(newType)

                    if (!profile || typeof profile !== 'object' || !profile.groups) {
                        throw new Error(`Invalid profile returned for type "${newType}"`)
                    }

                    // Cache and apply
                    this.schemaProfiles[newType] = profile
                    this._applyTraceType(index, newType)
                } catch (err) {
                    // PRD §11.2: revert type, do NOT cache failure, dispatch toast
                    // (type was not changed yet — nothing to revert in traces)
                    console.error(`[plotly-chart-editor] Failed to load profile for "${newType}":`, err)
                    this._dispatchToast(newType)
                }
            },

            /**
             * Apply a type change: update type, prune fields not in new profile,
             * preserve meta/name/type.
             *
             * @param {number} index
             * @param {string} newType
             */
            _applyTraceType(index, newType) {
                const profile    = this.schemaProfiles[newType]
                const oldTrace   = deepClone(toRaw(this.traces)[index] ?? {})
                const keepKeys   = this._profileFieldKeys(profile)

                const pruned = { type: newType }

                // Preserve identity and meta fields always
                for (const k of ['name', 'meta']) {
                    if (oldTrace[k] !== undefined) pruned[k] = oldTrace[k]
                }

                // Keep fields that exist in the new profile
                for (const k of Object.keys(oldTrace)) {
                    if (['type', 'name', 'meta'].includes(k)) continue
                    if (keepKeys.has(k)) pruned[k] = oldTrace[k]
                }

                this.traces[index] = pruned
            },

            /**
             * Collect the top-level key names declared in a profile's fields.
             *
             * @param {object} profile
             * @returns {Set<string>}
             */
            _profileFieldKeys(profile) {
                const keys = new Set()

                for (const group of Object.values(profile?.groups ?? {})) {
                    for (const field of group?.fields ?? []) {
                        // dot-separated key → only the top-level segment
                        keys.add(field.key.split('.')[0])
                    }
                }

                return keys
            },

            /**
             * Dispatch a toast event for a failed profile load (PRD §11.2).
             *
             * @param {string} type
             */
            _dispatchToast(type) {
                window.dispatchEvent(new CustomEvent('plotly-editor:toast', {
                    detail: {
                        key:     'errors.profile_load_failed',
                        message: this._plotlyMissingMessage
                            .replace
                            ? `Failed to load profile for ${type}. Please try again.`
                            : `Failed to load profile for ${type}. Please try again.`,
                        type:    type,
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
                        this.syncing = false
                        this.dirty      = false
                        this.lastSyncAt = Date.now()
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
 * Called from Blade x-init on every mount and every Livewire morph.
 *
 * @param {object}      payload
 * @param {string}      plotlyMissingMessage
 * @param {HTMLElement} canvasEl
 * @param {object}      wire
 */
function bootChartBuilder(payload, plotlyMissingMessage, canvasEl, wire) {
    const store = initChartBuilder(payload, plotlyMissingMessage)

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
    window.initChartBuilder  = initChartBuilder
    window.bootChartBuilder  = bootChartBuilder
}

export { initChartBuilder, bootChartBuilder }
