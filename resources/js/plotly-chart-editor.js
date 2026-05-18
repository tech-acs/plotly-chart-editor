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
let _booted = false   // prevents double-boot on Livewire morph re-renders

/**
 * Bootstrap the chart builder Alpine store.
 *
 * Safe to call multiple times (e.g. on Livewire morph re-renders):
 * - First call registers the store and boots it.
 * - Subsequent calls (after a Livewire update morphs the DOM) only re-boot
 *   with the new canvas element without re-registering the store.
 *
 * @param {object} payload              — serialized from the Livewire mount payload
 * @param {string} plotlyMissingMessage — translatable error string from PHP
 */
function initChartBuilder(payload, plotlyMissingMessage) {
    const alreadyExists = !!Alpine.store('chartBuilder')

    if (!alreadyExists) {
        Alpine.store('chartBuilder', {
            // ── Loaded from Livewire on mount ─────────────────────────────
            dataSources: payload.dataSources ?? {},
            schemaProfiles: payload.schemaProfiles ?? {},

            // ── Managed by Alpine ─────────────────────────────────────────
            traces: payload.traces ?? [],
            layout: payload.layout ?? {},
            config: payload.config ?? { responsive: true },

            // ── Sync / UI config ──────────────────────────────────────────
            syncMode: payload.syncMode ?? 'manual',
            traceTypes: payload.traceTypes ?? ['bar'],
            showExport: payload.showExport ?? true,

            // ── Derived ───────────────────────────────────────────────────
            activeTraceIndex: 0,

            // ── Validation & sync state ───────────────────────────────────
            warnings: [],
            dirty: false,
            syncing: false,
            lastSyncAt: null,

            // ── Internal flags ────────────────────────────────────────────
            _plotlyMissingMessage: plotlyMissingMessage,
            _plotlyMissing: false,

            /**
             * Wire up effects and perform the initial render.
             * Called by boot() below; separated so re-boot after a Livewire
             * morph can call _render() without re-registering effects.
             */
            _startEffects() {
                // Watch traces (deep) → debounced render + dirty
                Alpine.effect(() => {
                    JSON.stringify(toRaw(this.traces))
                    this._scheduleRender()
                })

                // Watch layout (deep) → debounced render + dirty
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
                    // Only mark dirty after the initial boot is complete —
                    // the very first render is not a user-driven mutation.
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
                        this.dirty = false
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
 * Boot (or re-boot) the store against a DOM canvas element.
 * Called from Blade x-init — safe to call on every Livewire morph.
 *
 * @param {object}      payload
 * @param {string}      plotlyMissingMessage
 * @param {HTMLElement} canvasEl
 * @param {object}      wire
 */
function bootChartBuilder(payload, plotlyMissingMessage, canvasEl, wire) {
    const store = initChartBuilder(payload, plotlyMissingMessage)

    // Always update the canvas reference in case Livewire morphed the DOM
    _canvasEl = canvasEl
    _wire = wire

    if (typeof window.Plotly === 'undefined') {
        store._plotlyMissing = true
        if (canvasEl) canvasEl.textContent = plotlyMissingMessage
        return
    }

    if (!_booted) {
        // First boot: register reactive effects and do initial render
        store._startEffects()
        _booted = true
        // Render immediately (before effects fire) so the chart appears at once
        store._render()
    } else {
        // Re-boot after Livewire morph: just re-render into the new canvas element
        store._render()
    }
}

/**
 * Expose globally so Blade x-init can call window.bootChartBuilder().
 * Also expose initChartBuilder for consumers using ES module imports.
 */
if (typeof window !== 'undefined') {
    window.initChartBuilder = initChartBuilder
    window.bootChartBuilder = bootChartBuilder
}

export { initChartBuilder, bootChartBuilder }
