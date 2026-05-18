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

/**
 * Bootstrap the chart builder Alpine store.
 *
 * @param {object} payload              — serialized from the Livewire mount payload
 * @param {string} plotlyMissingMessage — translatable error string from PHP
 */
function initChartBuilder(payload, plotlyMissingMessage) {
    // Store the $wire reference OUTSIDE the Alpine store so Alpine never wraps
    // it in a reactive proxy — a proxied $wire proxy loses its method dispatch.
    let _wire = null
    let _canvasEl = null
    let _renderTimer = null
    let _autoSyncTimer = null

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

        // ── Internal flags (reactive — safe to make reactive) ─────────────
        _plotlyMissingMessage: plotlyMissingMessage,
        _plotlyMissing: false,

        /**
         * Call once after the store is registered, passing the canvas DOM element.
         *
         * @param {HTMLElement} canvasEl
         */
        boot(canvasEl) {
            _canvasEl = canvasEl

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
                JSON.stringify(toRaw(this.traces))
                this._scheduleRender()
            })

            // Watch layout (deep) → debounced render
            Alpine.effect(() => {
                JSON.stringify(toRaw(this.layout))
                this._scheduleRender()
            })

            // Initial render
            this._render()
        },

        // ── Render pipeline ───────────────────────────────────────────────

        _scheduleRender() {
            clearTimeout(_renderTimer)
            _renderTimer = setTimeout(() => {
                this._render()
                this.markDirty()
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

        // ── Meta resolution ───────────────────────────────────────────────

        /**
         * Resolve meta.columnNames → actual data arrays from dataSources.
         * Returns a new plain object — never mutates the original trace.
         *
         * @param {object} trace
         * @returns {object}
         */
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

        /**
         * Strip meta from a trace for export / sync payloads (PRD §4).
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
                clearTimeout(_autoSyncTimer)
                _autoSyncTimer = setTimeout(() => this.syncToBackend(), 500)
            }
        },

        /**
         * Sync current state back to Livewire (PRD §10).
         * All sync calls route through this single method.
         */
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

        /**
         * Register the $wire reference. Called from Blade x-init.
         * Stored in the closure (not in the store) so Alpine never proxies it.
         *
         * @param {object} wire  — the Livewire $wire proxy
         */
        setWire(wire) {
            _wire = wire
        },
    })
}

/**
 * Expose globally so Blade x-init can call window.initChartBuilder().
 */
if (typeof window !== 'undefined') {
    window.initChartBuilder = initChartBuilder
}

export { initChartBuilder }
