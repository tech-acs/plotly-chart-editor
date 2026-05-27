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
    // JSON round-trip safely strips all nested Alpine reactive proxies.
    // structuredClone(toRaw(value)) fails because Alpine.raw() only unwraps
    // the top level — nested objects remain proxied and unclonable.
    return JSON.parse(JSON.stringify(toRaw(value)))
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
    area: { mode: 'none', fill: 'tozeroy', fillcolor: '#1f77b4' },
}
let _canvasEl = null
let _renderTimer = null
let _autoSyncTimer = null
let _booted = false
let _suppressNextDirty = false   // blocks the first markDirty() after initial render
let _deleteConfirmMsg  = 'Delete this trace? This cannot be undone.'
let _deleteAnnotationConfirmMsg = 'Delete this annotation? This cannot be undone.'
let _lengthMismatchMsg      = "Column ':field' has :colLen values but trace expects :expectedLen. Showing first :shown."
let _profileLoadFailedMsg   = 'Failed to load profile for :type. Please try again.'
let _savedTimer        = null    // clears the "Saved ✓" transient message
let _copiedTimer       = null    // clears the "Copied ✓" transient message
let _resizeObserver    = null    // ResizeObserver for viewport gate
let _lastStructuralSig = null    // last structural signature used to detect layer changes

/**
 * Deep-merge `defaults` into `target` without overwriting existing values.
 * Only plain objects are recursed; arrays and primitives are left as-is.
 */
function mergeDefaults(target, defaults) {
    for (const [key, val] of Object.entries(defaults)) {
        if (target[key] === undefined || target[key] === null || typeof target[key] !== typeof val) {
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
    title:  { text: '', font: { family: 'Arial', size: 16, color: '#000000' }, x: 0.5, automargin: false },
    xaxis:  {
        title: { text: '', font: { family: 'Arial', size: 14, color: '#000000' } },
        showgrid: true,
        tickangle: 'auto',
        tickfont: { family: 'Arial', size: 12, color: '#000000' },
        type: '-',
        autorange: true,
        showline: false,
        linecolor: '#444444',
        linewidth: 1,
        mirror: false,
        showticklabels: true,
        tickprefix: '',
        ticksuffix: '',
        automargin: false,
        side: 'bottom',
        tickcolor: '#444444',
        tickwidth: 1,
        ticklen: 5,
        ticks: 'outside',
    },
    yaxis:  {
        title: { text: '', font: { family: 'Arial', size: 14, color: '#000000' } },
        showgrid: true,
        tickangle: 'auto',
        tickformat: '',
        tickfont: { family: 'Arial', size: 12, color: '#000000' },
        type: '-',
        autorange: true,
        showline: false,
        linecolor: '#444444',
        linewidth: 1,
        mirror: false,
        showticklabels: true,
        tickprefix: '',
        ticksuffix: '',
        automargin: false,
        side: 'left',
        tickcolor: '#444444',
        tickwidth: 1,
        ticklen: 5,
        ticks: 'outside',
    },
    margin:     { t: 50, b: 50, l: 60, r: 30, pad: 0 },
    showlegend: true,
    legend: {
        orientation: 'v',
        xanchor: 'auto',
        yanchor: 'auto',
        x: 1,
        y: 1,
        bgcolor: '',
        bordercolor: '#444444',
        borderwidth: 0,
        font: { family: 'Arial', size: 12, color: '#000000' },
        title: { text: '', font: { family: 'Arial', size: 12, color: '#000000' } },
    },
    _annotations: [],
    font:       { family: 'Arial', size: 12, color: '#444444' },
    uniformtext: { mode: false, minsize: 0 },
    separators: '.,',
    colorway: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
    dragmode:   'zoom',
    hovermode:  'x',
    hoverlabel: {
        bgcolor: '#ffffff',
        bordercolor: '#444444',
        font: { family: 'Arial', size: 12, color: '#000000' },
        align: 'auto',
    },
}

/**
 * Scaffold defaults for annotation types. Matches Plotly's native defaults.
 */
const _ANNOTATION_SCAFFOLDS = {
    text: {
        _plotlyType: 'text',
        text: 'new text',
        font: { family: 'Arial', size: 14, color: '#000000' },
        textangle: 0,
        align: 'center',
        valign: 'middle',
        showarrow: true,
        arrowcolor: '#444444',
        arrowhead: 1,
        arrowwidth: 1,
        arrowsize: 1,
        ax: -50,
        ay: -50,
        x: 0.5,
        y: 0.5,
        xref: 'paper',
        yref: 'paper',
        xanchor: 'auto',
        yanchor: 'auto',
        bgcolor: '',
        bordercolor: '#444444',
        borderwidth: 1,
        borderpad: 1,
        opacity: 1,
    },
    shape: {
        _plotlyType: 'shape',
        type: 'rect',
        x0: 0.1, y0: 0.1, x1: 0.5, y1: 0.5,
        xref: 'paper', yref: 'paper',
        line: { color: '#444444', width: 2, dash: 'solid' },
        fillcolor: '#1f77b4',
        layer: 'above',
        opacity: 0.7,
    },
    image: {
        _plotlyType: 'image',
        source: '',
        x: 0.5, y: 0.5, sizex: 0.2, sizey: 0.2,
        xref: 'paper', yref: 'paper',
        xanchor: 'left', yanchor: 'top',
        sizing: 'contain',
        layer: 'above',
        opacity: 1,
    },
}

function initChartBuilder(payload, plotlyMissingMessage, deleteConfirmMessage, deleteAnnotationConfirmMessage, lengthMismatchMsg, profileLoadFailedMsg) {
    _deleteConfirmMsg = deleteConfirmMessage ?? _deleteConfirmMsg
    _deleteAnnotationConfirmMsg = deleteAnnotationConfirmMessage ?? _deleteAnnotationConfirmMsg
    _lengthMismatchMsg = lengthMismatchMsg ?? _lengthMismatchMsg
    _profileLoadFailedMsg = profileLoadFailedMsg ?? _profileLoadFailedMsg

    // Ensure layout sub-objects always exist before the store is registered.
    // PHP serialises [] as a JSON array; named properties added by mergeDefaults
    // are lost when deepClone() runs JSON.stringify on an array. Force a plain object.
    const rawLayout = payload.layout ?? {}
    const layout = mergeDefaults(
        Array.isArray(rawLayout) ? {} : rawLayout,
        LAYOUT_DEFAULTS
    )

    // Derive primary trace colors from the layout's colorway when not
    // explicitly set on the trace, so the sidebar swatch matches what
    // Plotly renders. Colorway is the user-configured palette (set via
    // the dashboard's color profile). Other color fields (borders,
    // hover labels, fonts) keep their schema defaults.
    const PRIMARY_COLOR_KEYS = ['marker.color', 'line.color', 'fillcolor']
    const colorway = payload.layout?.colorway ?? LAYOUT_DEFAULTS.colorway
    if (payload.traces && Array.isArray(payload.traces)) {
        payload.traces.forEach((trace, index) => {
            const paletteColor = colorway[index % colorway.length]
            for (const key of PRIMARY_COLOR_KEYS) {
                // Check if already explicitly set (via dot-path traversal)
                const keys = key.split('.')
                let cur = trace
                let exists = true
                for (const k of keys) {
                    if (cur === undefined || cur[k] === undefined) { exists = false; break }
                    cur = cur[k]
                }
                if (exists) continue
                // Set from colorway
                let target = trace
                for (let i = 0; i < keys.length - 1; i++) {
                    if (target[keys[i]] == null || typeof target[keys[i]] !== 'object') {
                        target[keys[i]] = {}
                    }
                    target = target[keys[i]]
                }
                target[keys[keys.length - 1]] = paletteColor
            }
        })
    }
    
    
    // Convert Plotly-native annotations/shapes/images to internal _annotations
    if (layout.annotations && Array.isArray(layout.annotations)) {
        layout._annotations = layout._annotations.concat(
            layout.annotations.map(a => ({ ...a, _plotlyType: 'text' }))
        )
        delete layout.annotations
    }
    if (layout.shapes && Array.isArray(layout.shapes)) {
        layout._annotations = layout._annotations.concat(
            layout.shapes.map(s => ({ ...s, _plotlyType: 'shape' }))
        )
        delete layout.shapes
    }
    if (layout.images && Array.isArray(layout.images)) {
        layout._annotations = layout._annotations.concat(
            layout.images.map(i => ({ ...i, _plotlyType: 'image' }))
        )
        delete layout.images
    }

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
            traceTypes: payload.traceTypes ?? ['bar', 'scatter', 'pie', 'histogram', 'line', 'area'],
            showExport:     payload.showExport     ?? true,
            showDataViewer: payload.showDataViewer ?? true,

            // ── Derived ───────────────────────────────────────────────────
            activeTraceIndex: 0,
            activeAxis: 'x',

            // ── Validation & sync state ───────────────────────────────────
            warnings:   [],
            dirty:      false,
            syncing:    false,
            lastSyncAt: null,
            savedAt:    null,   // timestamp of last successful sync (drives "Synced ✓")
            copiedAt:   null,   // timestamp of last clipboard copy (drives "Copied ✓")

            // ── Internal flags ────────────────────────────────────────────
            _plotlyMissingMessage: plotlyMissingMessage,
            _plotlyMissing:        false,
            _tooSmall:             false,


            // ── Conditional visibility helpers ──

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
             * Set a column binding on a trace's meta.columnNames.
             * Using a store method (rather than direct inline assignment) ensures
             * Alpine's reactive proxy intercepts the mutation and schedules a
             * re-render — regardless of whether the key previously existed.
             *
             * @param {number} traceIndex
             * @param {string} fieldKey    e.g. 'text', 'x', 'y'
             * @param {string} columnName  the selected data-source key
             */
            setColumnName(traceIndex, fieldKey, columnName) {
                const trace = this.traces[traceIndex]
                if (!trace.meta)             trace.meta = { columnNames: {} }
                if (!trace.meta.columnNames) trace.meta.columnNames = {}
                trace.meta.columnNames[fieldKey] = columnName
            },

            /**
             * Whether the given trace type supports marker config.
             * @param {string} type
             * @returns {boolean}
             */
            hasMarkerSupport(type) {
                return ['scatter', 'bar', 'histogram', 'pie', 'sunburst'].includes(type)
            },

            /**
             * Whether the given trace type supports fill config.
             * @param {string} type
             * @returns {boolean}
             */
            hasFillSupport(type) {
                return ['scatter'].includes(type)
            },

            /**
             * Evaluate an xshow expression from a schema profile.
             *
             * @param {string|null|undefined} expr
             * @returns {boolean}
             */
            evaluateXshow(expr) {
                if (!expr) return true
                return (new Function('store','trace','traceType','hasMarkerSupport','hasFillSupport','return ' + expr))(
                    this,
                    this.trace,
                    this.traceType,
                    this.hasMarkerSupport.bind(this),
                    this.hasFillSupport.bind(this),
                )
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

                const resolved = toRaw(this.traces).map(t => this.compileTrace(t))
                const layout = deepClone(this.layout)
                this._compileAnnotations(layout)

                // Compute a structural signature from type, mode, and column
                // bindings. When the signature changes (e.g. trace type or
                // column swap) we purge the canvas and use newPlot() so Plotly
                // builds all SVG layers from scratch. For styling-only changes
                // (color, font, title, etc.) the signature stays the same and
                // we use react() which is faster and preserves viewport/zoom.
                const structuralSig = JSON.stringify(
                    toRaw(this.traces).map(t => ({
                        type:        t.type,
                        mode:        t.mode,
                        columnNames: t.meta?.columnNames,
                    }))
                )

                const needsFullRedraw = structuralSig !== _lastStructuralSig
                _lastStructuralSig = structuralSig

                // uirevision preserves zoom/pan across react() calls.
                layout.uirevision = structuralSig

                const plotFn = needsFullRedraw
                    ? (window.Plotly.purge(_canvasEl), window.Plotly.newPlot)
                    : window.Plotly.react

                plotFn(
                    _canvasEl,
                    resolved,
                    layout,
                    deepClone(this.config)
                ).catch(err => {
                    console.error('[plotly-chart-editor] Plotly render failed:', err)
                })
            },

            // ── Validation ──

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
                                    message: _lengthMismatchMsg
                                        .replace(':field', field)
                                        .replace(':columnLen', String(colLen))
                                        .replace(':expectedLen', String(expectedLen))
                                        .replace(':shown', String(expectedLen)),
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

            compileTrace(storeTrace) {
                const trace = deepClone(storeTrace)
                const columnNames = trace.meta?.columnNames ?? {}
                for (const [axis, columnName] of Object.entries(columnNames)) {
                    if (!columnName || this.dataSources[columnName] === undefined) continue
                    // Skip column resolution when the corresponding *_from_column flag is false
                    if (axis === 'marker.size' && trace.marker?.size_from_column === false) continue
                    const keys = axis.split('.')
                    let cur = trace
                    for (let i = 0; i < keys.length - 1; i++) {
                        if (cur[keys[i]] == null || typeof cur[keys[i]] !== 'object') {
                            cur[keys[i]] = {}
                        }
                        cur = cur[keys[i]]
                    }
                    cur[keys[keys.length - 1]] = toRaw(this.dataSources[columnName])
                }
                trace.type = _plotlyTypeMap[trace.type] ?? trace.type
                return trace
            },

            // ── Trace operations ──

            /**
             * Append a new empty trace with the given type (defaults to first
             * enabled type). Sets it as active.
             *
             * @param {string} [type]
             */
            addTrace(type) {
                const traceType = type ?? toRaw(this.traceTypes)[0] ?? 'bar'
                const trace = {
                    type: traceType,
                    name: `Trace ${this.traces.length + 1}`,
                    meta: { columnNames: {} },
                }
                // Apply profile defaults so fields like mode, color etc. are preset
                const profile = this.schemaProfiles[traceType]
                if (profile) {
                    for (const group of Object.values(profile.groups)) {
                        for (const field of group.fields) {
                            if (field.dflt !== undefined) {
                                this.setPath(trace, field.key, field.dflt)
                            }
                        }
                    }
                }
                this.traces.push(trace)
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

            // ── Annotation operations ─────────────────────────────────────

            /**
             * Push a new annotation of the given type onto layout._annotations.
             * @param {'text'|'shape'|'image'} type
             */
            addAnnotation(type) {
                const scaffold = _ANNOTATION_SCAFFOLDS[type]
                if (!scaffold) return
                if (!this.layout._annotations) {
                    this.layout._annotations = []
                }
                this.layout._annotations.push(deepClone(scaffold))
                this._scheduleRender()
            },

            /**
             * Remove an annotation at the given index after confirm.
             * @param {number} idx
             */
            removeAnnotation(idx) {
                const ann = this.layout._annotations
                if (!ann || idx < 0 || idx >= ann.length) return
                ann.splice(idx, 1)
                this._scheduleRender()
            },

            /**
             * Move an annotation from one index to another.
             * @param {number} from
             * @param {number} to
             */
            moveAnnotation(from, to) {
                const ann = this.layout._annotations
                if (!ann || from < 0 || from >= ann.length) return
                if (to < 0 || to >= ann.length) return
                if (from === to) return
                const moved = deepClone(toRaw(ann[from]))
                ann.splice(from, 1)
                ann.splice(to, 0, moved)
                this._scheduleRender()
            },

            /**
             * Move annotation at idx one position up.
             * @param {number} idx
             */
            moveAnnotationUp(idx) {
                this.moveAnnotation(idx, idx - 1)
            },

            /**
             * Move annotation at idx one position down.
             * @param {number} idx
             */
            moveAnnotationDown(idx) {
                this.moveAnnotation(idx, idx + 1)
            },

            /**
             * Given a deep-cloned layout, compile _annotations into Plotly-native
             * layout.annotations / layout.shapes / layout.images and strip _plotlyType.
             * Called by _render() and syncToBackend().
             * @param {object} layout
             */
            _compileAnnotations(layout) {
                const ann = layout._annotations
                if (!ann || !Array.isArray(ann) || ann.length === 0) {
                    layout.annotations = []
                    layout.shapes = []
                    layout.images = []
                    delete layout._annotations
                    return
                }
                const texts = []
                const shapes = []
                const images = []
                for (const item of ann) {
                    const raw = toRaw(item)
                    const clone = deepClone(raw)
                    delete clone._plotlyType
                    if (raw._plotlyType === 'text') {
                        texts.push(clone)
                    } else if (raw._plotlyType === 'shape') {
                        shapes.push(clone)
                    } else if (raw._plotlyType === 'image') {
                        images.push(clone)
                    }
                }
                layout.annotations = texts
                layout.shapes = shapes
                layout.images = images
                delete layout._annotations
            },

            // ── Trace type switching ──

            /**
     * Change a trace's type. If the profile is not yet cached,
     * lazy-loads via $wire.getSchemaProfile(). On failure: revert +
     * dispatch toast.
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

                // Apply profile field defaults for keys still undefined
                if (profile) {
                    for (const group of Object.values(profile.groups)) {
                        for (const field of group.fields) {
                            if (field.dflt !== undefined && this.getPath(pruned, field.key) === undefined) {
                                this.setPath(pruned, field.key, field.dflt)
                            }
                        }
                    }
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
                        message: _profileLoadFailedMsg.replace(':type', type),
                        type,
                    },
                }))
            },



            // ── Export ──

            _buildExportPayload() {
                const data = toRaw(this.traces).map(t => this.compileTrace(t))
                return JSON.stringify(
                    { data, layout: deepClone(this.layout), config: deepClone(this.config) },
                    null,
                    2
                )
            },

            /**
             * Download the full chart config as chart.json.
             */
            exportJSON() {
                this._download('chart.json', 'application/json', this._buildExportPayload())
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
                try {
                    await navigator.clipboard.writeText(this._buildExportPayload())
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

            // ── Sync state ──

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

                const clonedLayout = deepClone(this.layout)
                this._compileAnnotations(clonedLayout)

                const wirePayload = {
                    traces: toRaw(this.traces).map(t => {
                        const clone = deepClone(t)
                        clone.type = _plotlyTypeMap[clone.type] ?? clone.type
                        // Strip data at column-bound paths so the payload only
                        // carries column references (via meta.columnNames), not
                        // the actual data arrays. The host app stores these
                        // references and hydrates them at render time.
                        const columnNames = clone.meta?.columnNames ?? {}
                        for (const axis of Object.keys(columnNames)) {
                            const keys = axis.split('.')
                            let cur = clone
                            for (let i = 0; i < keys.length - 1; i++) {
                                if (cur[keys[i]] == null || typeof cur[keys[i]] !== 'object') break
                                cur = cur[keys[i]]
                            }
                            delete cur[keys[keys.length - 1]]
                        }
                        return clone
                    }),
                    layout: clonedLayout,
                }

                _wire.syncFromAlpine(JSON.stringify(wirePayload))
                    .then(() => {
                        this.dirty = false
                        this.savedAt = Date.now()
                        clearTimeout(_savedTimer)
                        _savedTimer = setTimeout(() => { this.savedAt = null }, 2000)
                        window.dispatchEvent(new CustomEvent('plotly-chart-editor:synced', {
                            detail: { traces: wirePayload.traces, layout: clonedLayout }
                        }))
                    })
                    .catch(err => {
                        console.error('[plotly-chart-editor] syncToBackend failed:', err)
                        this.dirty = true
                        window.dispatchEvent(new CustomEvent('plotly-chart-editor:sync-failed', {
                            detail: { error: err.message ?? String(err) }
                        }))
                    })
                    .finally(() => {
                        this.syncing    = false
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
 * @param {string}      deleteAnnotationConfirmMessage
 * @param {HTMLElement} canvasEl
 * @param {object}      wire
 */
function bootChartBuilder(payload, plotlyMissingMessage, deleteConfirmMessage, deleteAnnotationConfirmMessage, canvasEl, wire, lengthMismatchMsg, profileLoadFailedMsg) {
    // Register the store (side effect) — do NOT use its return value,
    // Vite minification makes it unreliable (see initChartBuilder comment).
    initChartBuilder(payload, plotlyMissingMessage, deleteConfirmMessage, deleteAnnotationConfirmMessage, lengthMismatchMsg, profileLoadFailedMsg)

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

    // ── Viewport gate ──
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
