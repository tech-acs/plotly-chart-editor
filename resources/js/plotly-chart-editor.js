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
 * Alpine.raw() is the official way to do this (Alpine 3.x).
 *
 * @param {*} value
 * @returns {*}
 */
function toRaw(value) {
    // Alpine.raw() strips the Proxy wrapper; fall back to value if unavailable
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

/**
 * Bootstrap the chart builder Alpine store.
 *
 * @param {object} payload              — serialized from the Livewire mount payload
 * @param {string} plotlyMissingMessage — translatable error string from PHP
 */
function initChartBuilder(payload, plotlyMissingMessage) {
    Alpine.store('chartBuilder', {
        // ── Loaded from Livewire on mount ─────────────────────────────────
        dataSources: payload.dataSources ?? {},
        schemaProfiles: payload.schemaProfiles ?? {},

        // ── Managed by Alpine ─────────────────────────────────────────────
        traces: payload.traces ?? [],
        layout: payload.layout ?? {},
        config: payload.config ?? { responsive: true },

        // ── Sync / UI config ──────────────────────────────────────────────
        syncMode: payload.syncMode ?? 'manual',
        traceTypes: payload.traceTypes ?? ['bar'],
        showExport: payload.showExport ?? true,

        // ── Derived ───────────────────────────────────────────────────────
        activeTraceIndex: 0,

        // ── Validation & sync state ───────────────────────────────────────
        warnings: [],
        dirty: false,
        syncing: false,
        lastSyncAt: null,

        // ── Internal ──────────────────────────────────────────────────────
        _renderTimer: null,
        _autoSyncTimer: null,
        _canvasEl: null,
        _plotlyMissingMessage: plotlyMissingMessage,
        _plotlyMissing: false,
        _wire: undefined,

        /**
         * Call once after the store is registered, passing the canvas DOM element.
         * Wires up the effect-based debounce pipeline and performs the initial render.
         *
         * @param {HTMLElement} canvasEl
         */
        boot(canvasEl) {
            this._canvasEl = canvasEl

            // Peer-dep guard — PRD §2 rule 7
            if (typeof window.Plotly === 'undefined') {
                this._plotlyMissing = true
                if (canvasEl) {
                    canvasEl.textContent = this._plotlyMissingMessage
                }
                return
            }

            // Watch traces (deep) → debounced render
            Alpine.effect(() => {
                // JSON.stringify forces Alpine to track all nested reactive reads
                JSON.stringify(toRaw(this.traces))
                this._scheduleRender()
            })

            // Watch layout (deep) → debounced render
            Alpine.effect(() => {
                JSON.stringify(toRaw(this.layout))
                this._scheduleRender()
            })

            // Initial render (outside effect so it fires once immediately)
            this._render()
        },

        // ── Render pipeline ───────────────────────────────────────────────

        /**
         * Schedule a render with a 50ms debounce (PRD §2 rule 3).
         */
        _scheduleRender() {
            clearTimeout(this._renderTimer)
            this._renderTimer = setTimeout(() => {
                this._render()
                this.markDirty()
            }, 50)
        },

        /**
         * Resolve all trace meta and call Plotly.react().
         */
        _render() {
            if (this._plotlyMissing || !this._canvasEl) return

            const resolved = toRaw(this.traces).map(t => this.resolveMeta(t))
            window.Plotly.react(
                this._canvasEl,
                resolved,
                deepClone(this.layout),
                deepClone(this.config)
            )
        },

        // ── Meta resolution ───────────────────────────────────────────────

        /**
         * Given an internal trace (with meta.columnNames), return a NEW plain
         * object with actual data arrays attached — does NOT mutate the original.
         *
         * PRD §4 compilation pipeline.
         *
         * @param {object} trace
         * @returns {object}
         */
        resolveMeta(trace) {
            // deepClone via toRaw ensures we get a plain object, not an Alpine proxy
            const resolved = deepClone(trace)
            const columnNames = resolved.meta?.columnNames ?? {}

            for (const [axis, columnName] of Object.entries(columnNames)) {
                if (columnName && this.dataSources[columnName] !== undefined) {
                    // dataSources values are plain arrays from JSON — safe to assign directly
                    resolved[axis] = toRaw(this.dataSources[columnName])
                }
            }

            return resolved
        },

        /**
         * Strip meta from a trace for export / sync payloads (PRD §4 compileTrace).
         *
         * @param {object} trace
         * @returns {object}
         */
        compileTrace(trace) {
            const compiled = this.resolveMeta(trace)
            delete compiled.meta
            return compiled
        },

        // ── Sync state ────────────────────────────────────────────────────

        markDirty() {
            this.dirty = true
            this._maybeAutoSync()
        },

        _maybeAutoSync() {
            if (this.syncMode === 'auto' || this.syncMode === 'hybrid') {
                clearTimeout(this._autoSyncTimer)
                this._autoSyncTimer = setTimeout(() => this.syncToBackend(), 500)
            }
        },

        /**
         * Sync current state back to Livewire (PRD §10).
         * All sync calls route through this single method — never inline $wire calls.
         */
        syncToBackend() {
            if (this.syncing) return

            this.syncing = true

            const payload = {
                traces: toRaw(this.traces).map(t => this.compileTrace(t)),
                layout: deepClone(this.layout),
            }

            if (typeof this._wire !== 'undefined') {
                this._wire.syncFromAlpine(JSON.stringify(payload))
                    .finally(() => {
                        this.syncing = false
                        this.dirty = false
                        this.lastSyncAt = Date.now()
                    })
            } else {
                this.syncing = false
            }
        },

        /**
         * Register the $wire reference so syncToBackend() can reach Livewire.
         * Called from the Blade template once Alpine has initialised.
         *
         * @param {object} wire  — the Livewire $wire proxy
         */
        setWire(wire) {
            this._wire = wire
        },
    })
}

/**
 * Expose globally so the Blade x-data init() can call it before Alpine
 * has processed the component element. Consumers using ES module imports
 * can import { initChartBuilder } instead.
 */
if (typeof window !== 'undefined') {
    window.initChartBuilder = initChartBuilder
}

export { initChartBuilder }
