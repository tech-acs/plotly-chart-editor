function f(a) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(a) : a;
}
function h(a) {
  return JSON.parse(JSON.stringify(f(a)));
}
let b = null;
const L = {
  area: "scatter"
}, D = {
  area: { mode: "none", fill: "tozeroy", fillcolor: "#1f77b4" }
};
let y = null, z = null, M = null, x = !1, N = !1, S = "Delete this trace? This cannot be undone.", O = "Column ':field' has :colLen values but trace expects :expectedLen. Showing first :shown.", P = "Failed to load profile for :type. Please try again.", I = null, C = null, v = null, j = null;
function F(a, w) {
  for (const [p, g] of Object.entries(w))
    a[p] === void 0 || a[p] === null ? a[p] = structuredClone(g) : typeof g == "object" && !Array.isArray(g) && typeof a[p] == "object" && !Array.isArray(a[p]) && F(a[p], g);
  return a;
}
const B = {
  // Nested sub-objects that primitives bind into must always exist.
  // We provide structural defaults only — values that match Plotly's own
  // defaults so the controls reflect the actual chart state on first render.
  //
  // plot_bgcolor / paper_bgcolor are intentionally NOT defaulted here:
  // Plotly's default is transparent, which browsers render as white. Injecting
  // '#ffffff' would make the controls show white while the chart uses transparent
  // — causing a visible mismatch. Let the consumer provide these explicitly.
  title: { text: "", font: { family: "Arial", size: 16, color: "#000000" }, x: 0.5, automargin: !1 },
  xaxis: {
    title: { text: "", font: { family: "Arial", size: 14, color: "#000000" } },
    showgrid: !0,
    tickangle: "auto",
    tickfont: { family: "Arial", size: 12, color: "#000000" },
    type: "-",
    autorange: !0,
    showline: !1,
    linecolor: "#444444",
    linewidth: 1,
    mirror: !1,
    showticklabels: !0,
    tickprefix: "",
    ticksuffix: "",
    automargin: !1,
    side: "bottom",
    tickcolor: "#444444",
    tickwidth: 1,
    ticklen: 5,
    ticks: "outside"
  },
  yaxis: {
    title: { text: "", font: { family: "Arial", size: 14, color: "#000000" } },
    showgrid: !0,
    tickangle: "auto",
    tickformat: "",
    tickfont: { family: "Arial", size: 12, color: "#000000" },
    type: "-",
    autorange: !0,
    showline: !1,
    linecolor: "#444444",
    linewidth: 1,
    mirror: !1,
    showticklabels: !0,
    tickprefix: "",
    ticksuffix: "",
    automargin: !1,
    side: "left",
    tickcolor: "#444444",
    tickwidth: 1,
    ticklen: 5,
    ticks: "outside"
  },
  margin: { t: 50, b: 50, l: 60, r: 30, pad: 0 },
  showlegend: !0,
  legend: {
    orientation: "v",
    xanchor: "auto",
    yanchor: "auto",
    x: 1,
    y: 1,
    bgcolor: "",
    bordercolor: "#444444",
    borderwidth: 0,
    font: { family: "Arial", size: 12, color: "#000000" },
    title: { text: "", font: { family: "Arial", size: 12, color: "#000000" } }
  },
  _annotations: [],
  font: { family: "Arial", size: 12, color: "#444444" },
  uniformtext: { mode: !1, minsize: 0 },
  separators: ".,",
  colorway: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
  dragmode: "zoom",
  hovermode: "x",
  hoverlabel: {
    bgcolor: "#ffffff",
    bordercolor: "#444444",
    font: { family: "Arial", size: 12, color: "#000000" },
    align: "auto"
  }
}, J = {
  text: {
    _plotlyType: "text",
    text: "new text",
    font: { family: "Arial", size: 14, color: "#000000" },
    textangle: 0,
    align: "center",
    valign: "middle",
    showarrow: !0,
    arrowcolor: "#444444",
    arrowhead: 1,
    arrowwidth: 1,
    arrowsize: 1,
    ax: -50,
    ay: -50,
    x: 0.5,
    y: 0.5,
    xref: "paper",
    yref: "paper",
    xanchor: "auto",
    yanchor: "auto",
    bgcolor: "",
    bordercolor: "#444444",
    borderwidth: 1,
    borderpad: 1,
    opacity: 1
  },
  shape: {
    _plotlyType: "shape",
    type: "rect",
    x0: 0.1,
    y0: 0.1,
    x1: 0.5,
    y1: 0.5,
    xref: "paper",
    yref: "paper",
    line: { color: "#444444", width: 2, dash: "solid" },
    fillcolor: "#1f77b4",
    layer: "above",
    opacity: 0.7
  },
  image: {
    _plotlyType: "image",
    source: "",
    x: 0.5,
    y: 0.5,
    sizex: 0.2,
    sizey: 0.2,
    xref: "paper",
    yref: "paper",
    xanchor: "left",
    yanchor: "top",
    sizing: "contain",
    layer: "above",
    opacity: 1
  }
};
function R(a, w, p, g, d, A) {
  S = p ?? S, O = d ?? O, P = A ?? P;
  const T = a.layout ?? {}, k = F(
    Array.isArray(T) ? {} : T,
    B
  );
  !!Alpine.store("chartBuilder") || Alpine.store("chartBuilder", {
    // ── Loaded from Livewire on mount ─────────────────────────────
    dataSources: a.dataSources ?? {},
    schemaProfiles: a.schemaProfiles ?? {},
    // ── Managed by Alpine ─────────────────────────────────────────
    traces: a.traces ?? [],
    layout: k,
    config: a.config ?? { responsive: !0 },
    // ── Sync / UI config ──────────────────────────────────────────
    syncMode: a.syncMode ?? "manual",
    traceTypes: a.traceTypes ?? ["bar", "scatter", "pie", "histogram", "line", "area"],
    showExport: a.showExport ?? !0,
    // ── Derived ───────────────────────────────────────────────────
    activeTraceIndex: 0,
    activeAxis: "x",
    // ── Validation & sync state ───────────────────────────────────
    warnings: [],
    dirty: !1,
    syncing: !1,
    lastSyncAt: null,
    savedAt: null,
    // timestamp of last successful sync (drives "Saved ✓")
    copiedAt: null,
    // timestamp of last clipboard copy (drives "Copied ✓")
    // ── Internal flags ────────────────────────────────────────────
    _plotlyMissingMessage: w,
    _plotlyMissing: !1,
    _tooSmall: !1,
    // ── Conditional visibility helpers (PRD §8) ───────────────────
    /**
     * Alias: the active trace object.
     * Used in xshow expressions: `trace.mode && trace.mode.includes('lines')`
     */
    get trace() {
      return this.traces[this.activeTraceIndex] ?? {};
    },
    /**
     * Alias: the active trace type string.
     * Used in xshow expressions: `traceType !== 'pie'`
     */
    get traceType() {
      var e;
      return ((e = this.traces[this.activeTraceIndex]) == null ? void 0 : e.type) ?? "";
    },
    /**
     * Read a dot-separated path from an object.
     * e.g. getPath(trace, 'marker.color') === trace.marker.color
     *
     * @param {object} obj
     * @param {string} path  dot-separated key string
     * @returns {*}
     */
    getPath(e, t) {
      return t.split(".").reduce((i, o) => i == null ? void 0 : i[o], e);
    },
    /**
     * Write a value at a dot-separated path on an object,
     * creating intermediate objects as needed.
     *
     * @param {object} obj
     * @param {string} path  dot-separated key string
     * @param {*}      value
     */
    setPath(e, t, i) {
      const o = t.split(".");
      let r = e;
      for (let s = 0; s < o.length - 1; s++)
        (r[o[s]] == null || typeof r[o[s]] != "object") && (r[o[s]] = {}), r = r[o[s]];
      r[o[o.length - 1]] = i;
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
    setColumnName(e, t, i) {
      const o = this.traces[e];
      o.meta || (o.meta = { columnNames: {} }), o.meta.columnNames || (o.meta.columnNames = {}), o.meta.columnNames[t] = i;
    },
    /**
     * Whether the given trace type supports marker config.
     * @param {string} type
     * @returns {boolean}
     */
    hasMarkerSupport(e) {
      return ["scatter", "bar", "histogram", "pie", "sunburst"].includes(e);
    },
    /**
     * Whether the given trace type supports fill config.
     * @param {string} type
     * @returns {boolean}
     */
    hasFillSupport(e) {
      return ["scatter"].includes(e);
    },
    /**
     * Evaluate an xshow expression from a schema profile.
     *
     * @param {string|null|undefined} expr
     * @returns {boolean}
     */
    evaluateXshow(e) {
      return e ? new Function("store", "trace", "traceType", "hasMarkerSupport", "hasFillSupport", "return " + e)(
        this,
        this.trace,
        this.traceType,
        this.hasMarkerSupport.bind(this),
        this.hasFillSupport.bind(this)
      ) : !0;
    },
    // ── Effects ───────────────────────────────────────────────────
    _startEffects() {
      const e = this;
      Alpine.effect(() => {
        JSON.stringify(e.traces), e._scheduleRender();
      }), Alpine.effect(() => {
        JSON.stringify(e.layout), e._scheduleRender();
      });
    },
    // ── Render pipeline ───────────────────────────────────────────
    _scheduleRender() {
      clearTimeout(z), z = setTimeout(() => {
        this.validate(), this._render(), N ? N = !1 : this.markDirty();
      }, 50);
    },
    _render() {
      if (this._plotlyMissing || !y) return;
      const e = f(this.traces).map((s) => this.compileTrace(s)), t = h(this.layout);
      this._compileAnnotations(t);
      const i = JSON.stringify(
        f(this.traces).map((s) => {
          var l;
          return {
            type: s.type,
            mode: s.mode,
            columnNames: (l = s.meta) == null ? void 0 : l.columnNames
          };
        })
      ), o = i !== j;
      j = i, t.uirevision = i, (o ? (window.Plotly.purge(y), window.Plotly.newPlot) : window.Plotly.react)(
        y,
        e,
        t,
        h(this.config)
      ).catch((s) => {
        console.error("[plotly-chart-editor] Plotly render failed:", s);
      });
    },
    // ── Validation (PRD §11) ──────────────────────────────────────
    /**
     * Run all validations against current traces and dataSources.
     * Mutates this.warnings in place — replaces the entire array so
     * Alpine tracks the change.
     */
    validate() {
      const e = [];
      f(this.traces).forEach((t, i) => {
        var c;
        const o = ((c = t.meta) == null ? void 0 : c.columnNames) ?? {}, r = {};
        for (const [u, _] of Object.entries(o))
          _ && this.dataSources[_] && (r[u] = f(this.dataSources[_]).length);
        const s = Object.values(r);
        if (s.length < 2) return;
        const l = Math.min(...s), n = Math.max(...s);
        if (l !== n)
          for (const [u, _] of Object.entries(r))
            _ !== l && e.push({
              traceIndex: i,
              field: u,
              code: "LENGTH_MISMATCH",
              message: O.replace(":field", u).replace(":colLen", String(_)).replace(":expectedLen", String(l)).replace(":shown", String(l))
            });
      }), this.warnings.splice(0, this.warnings.length, ...e);
    },
    /**
     * Return the warning (if any) for a specific trace+field combination.
     * Used by the inline warning in the column selector.
     */
    warningFor(e, t) {
      return f(this.warnings).find(
        (i) => i.traceIndex === e && i.field === t
      ) ?? null;
    },
    compileTrace(e) {
      var o, r;
      const t = h(e), i = ((o = t.meta) == null ? void 0 : o.columnNames) ?? {};
      for (const [s, l] of Object.entries(i)) {
        if (!l || this.dataSources[l] === void 0 || s === "marker.size" && ((r = t.marker) == null ? void 0 : r.size_from_column) === !1) continue;
        const n = s.split(".");
        let c = t;
        for (let u = 0; u < n.length - 1; u++)
          (c[n[u]] == null || typeof c[n[u]] != "object") && (c[n[u]] = {}), c = c[n[u]];
        c[n[n.length - 1]] = f(this.dataSources[l]);
      }
      return t.type = L[t.type] ?? t.type, delete t.meta, t;
    },
    // ── Trace operations (PRD §6) ─────────────────────────────────
    /**
     * Append a new empty trace with the given type (defaults to first
     * enabled type). Sets it as active.
     *
     * @param {string} [type]
     */
    addTrace(e) {
      const t = e ?? f(this.traceTypes)[0] ?? "bar", i = {
        type: t,
        name: `Trace ${this.traces.length + 1}`,
        meta: { columnNames: {} }
      }, o = this.schemaProfiles[t];
      if (o)
        for (const r of Object.values(o.groups))
          for (const s of r.fields)
            s.dflt !== void 0 && this.setPath(i, s.key, s.dflt);
      this.traces.push(i), this.activeTraceIndex = this.traces.length - 1;
    },
    /**
     * Deep-copy the active trace and append it. Sets the copy active.
     *
     * @param {number} [index]
     */
    duplicateTrace(e) {
      const t = e ?? this.activeTraceIndex, i = h(f(this.traces)[t]);
      i.name = (i.name ?? `Trace ${t + 1}`) + " (copy)", this.traces.push(i), this.activeTraceIndex = this.traces.length - 1;
    },
    /**
     * Remove a trace after native confirm(). Adjusts activeTraceIndex
     * so it never goes out of bounds.
     *
     * @param {number} [index]
     */
    removeTrace(e) {
      const t = e ?? this.activeTraceIndex;
      window.confirm(S) && (this.traces.splice(t, 1), this.traces.length === 0 ? this.activeTraceIndex = 0 : this.activeTraceIndex >= this.traces.length && (this.activeTraceIndex = this.traces.length - 1));
    },
    /**
     * Swap trace at `from` with trace at `to`.
     *
     * @param {number} from
     * @param {number} to
     */
    moveTrace(e, t) {
      const i = this.traces.length;
      if (t < 0 || t >= i) return;
      const o = h(f(this.traces[e]));
      this.traces.splice(e, 1), this.traces.splice(t, 0, o), this.activeTraceIndex = t;
    },
    /**
     * Move the active trace one step up (lower index = rendered first).
     */
    moveTraceUp(e) {
      const t = e ?? this.activeTraceIndex;
      this.moveTrace(t, t - 1);
    },
    /**
     * Move the active trace one step down.
     */
    moveTraceDown(e) {
      const t = e ?? this.activeTraceIndex;
      this.moveTrace(t, t + 1);
    },
    // ── Annotation operations ─────────────────────────────────────
    /**
     * Push a new annotation of the given type onto layout._annotations.
     * @param {'text'|'shape'|'image'} type
     */
    addAnnotation(e) {
      const t = J[e];
      t && (this.layout._annotations || (this.layout._annotations = []), this.layout._annotations.push(h(t)), this._scheduleRender());
    },
    /**
     * Remove an annotation at the given index after confirm.
     * @param {number} idx
     */
    removeAnnotation(e) {
      const t = this.layout._annotations;
      !t || e < 0 || e >= t.length || (t.splice(e, 1), this._scheduleRender());
    },
    /**
     * Move an annotation from one index to another.
     * @param {number} from
     * @param {number} to
     */
    moveAnnotation(e, t) {
      const i = this.layout._annotations;
      if (!i || e < 0 || e >= i.length || t < 0 || t >= i.length || e === t) return;
      const o = h(f(i[e]));
      i.splice(e, 1), i.splice(t, 0, o);
    },
    /**
     * Move annotation at idx one position up.
     * @param {number} idx
     */
    moveAnnotationUp(e) {
      this.moveAnnotation(e, e - 1);
    },
    /**
     * Move annotation at idx one position down.
     * @param {number} idx
     */
    moveAnnotationDown(e) {
      this.moveAnnotation(e, e + 1);
    },
    /**
     * Given a deep-cloned layout, compile _annotations into Plotly-native
     * layout.annotations / layout.shapes / layout.images and strip _plotlyType.
     * Called by _render() and syncToBackend().
     * @param {object} layout
     */
    _compileAnnotations(e) {
      const t = e._annotations;
      if (!t || !Array.isArray(t) || t.length === 0) {
        e.annotations = [], e.shapes = [], e.images = [], delete e._annotations;
        return;
      }
      const i = [], o = [], r = [];
      for (const s of t) {
        const l = f(s), n = h(l);
        delete n._plotlyType, l._plotlyType === "text" ? i.push(n) : l._plotlyType === "shape" ? o.push(n) : l._plotlyType === "image" && r.push(n);
      }
      e.annotations = i, e.shapes = o, e.images = r, delete e._annotations;
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
    async setTraceType(e, t) {
      var o;
      if (((o = f(this.traces)[e]) == null ? void 0 : o.type) !== t) {
        if (this.schemaProfiles[t]) {
          this._applyTraceType(e, t);
          return;
        }
        if (b)
          try {
            const r = await b.getSchemaProfile(t);
            if (!r || typeof r != "object" || !r.groups)
              throw new Error(`Invalid profile returned for type "${t}"`);
            this.schemaProfiles[t] = r, this._applyTraceType(e, t);
          } catch (r) {
            console.error(`[plotly-chart-editor] Failed to load profile for "${t}":`, r), this._dispatchToast(t);
          }
      }
    },
    _applyTraceType(e, t) {
      const i = this.schemaProfiles[t], o = h(f(this.traces)[e] ?? {}), r = this._profileFieldKeys(i), s = { type: t };
      for (const n of ["name", "meta"])
        o[n] !== void 0 && (s[n] = o[n]);
      for (const n of Object.keys(o))
        ["type", "name", "meta"].includes(n) || r.has(n) && (s[n] = o[n]);
      const l = D[t] ?? {};
      for (const [n, c] of Object.entries(l))
        s[n] = c;
      if (i)
        for (const n of Object.values(i.groups))
          for (const c of n.fields)
            c.dflt !== void 0 && this.getPath(s, c.key) === void 0 && this.setPath(s, c.key, c.dflt);
      this.traces[e] = s;
    },
    _profileFieldKeys(e) {
      const t = /* @__PURE__ */ new Set();
      for (const i of Object.values((e == null ? void 0 : e.groups) ?? {}))
        for (const o of (i == null ? void 0 : i.fields) ?? [])
          t.add(o.key.split(".")[0]);
      return t;
    },
    _dispatchToast(e) {
      window.dispatchEvent(new CustomEvent("plotly-editor:toast", {
        detail: {
          key: "errors.profile_load_failed",
          message: P.replace(":type", e),
          type: e
        }
      }));
    },
    // ── Export (PRD §10) ──────────────────────────────────────────
    _buildExportPayload() {
      const e = f(this.traces).map((t) => this.compileTrace(t));
      return JSON.stringify(
        { data: e, layout: h(this.layout), config: h(this.config) },
        null,
        2
      );
    },
    /**
     * Download the full chart config as chart.json.
     * meta is stripped — the file is ready for direct use with Plotly.newPlot().
     */
    exportJSON() {
      this._download("chart.json", "application/json", this._buildExportPayload());
    },
    /**
     * Export the current chart canvas as an image.
     *
     * @param {'png'|'jpeg'|'svg'|'webp'} format
     */
    async exportImage(e = "png") {
      if (!(this._plotlyMissing || !y))
        try {
          const t = await window.Plotly.toImage(y, {
            format: e,
            width: y.offsetWidth || 1200,
            height: y.offsetHeight || 600
          });
          this._download(`chart.${e}`, `image/${e}`, t, !0);
        } catch (t) {
          console.error("[plotly-chart-editor] exportImage failed:", t);
        }
    },
    /**
     * Copy the chart config JSON to the clipboard.
     * Shows a transient "Copied ✓" indicator via copiedAt.
     */
    async copyConfig() {
      try {
        await navigator.clipboard.writeText(this._buildExportPayload()), this.copiedAt = Date.now(), clearTimeout(C), C = setTimeout(() => {
          this.copiedAt = null;
        }, 2e3);
      } catch (e) {
        console.error("[plotly-chart-editor] copyConfig failed:", e);
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
    _download(e, t, i, o = !1) {
      const r = document.createElement("a");
      r.href = o ? i : `data:${t};charset=utf-8,${encodeURIComponent(i)}`, r.download = e, r.style.display = "none", document.body.appendChild(r), r.click(), document.body.removeChild(r);
    },
    // ── Sync state ────────────────────────────────────────────────
    markDirty() {
      this.dirty = !0, this._maybeAutoSync();
    },
    _maybeAutoSync() {
      (this.syncMode === "auto" || this.syncMode === "hybrid") && (clearTimeout(M), M = setTimeout(() => this.syncToBackend(), 500));
    },
    syncToBackend() {
      if (this.syncing || !b) return;
      this.syncing = !0;
      const e = h(this.layout);
      this._compileAnnotations(e);
      const t = {
        traces: f(this.traces).map((i) => this.compileTrace(i)),
        layout: e
      };
      b.syncFromAlpine(JSON.stringify(t)).then(() => {
        this.savedAt = Date.now(), clearTimeout(I), I = setTimeout(() => {
          this.savedAt = null;
        }, 2e3);
      }).catch((i) => {
        console.error("[plotly-chart-editor] syncToBackend failed:", i), this.dirty = !0;
      }).finally(() => {
        this.syncing = !1, this.lastSyncAt = Date.now();
      });
    },
    setWire(e) {
      b = e;
    }
  });
}
function $(a, w, p, g, d, A, T, k) {
  R(a, w, p, g, T, k);
  const m = Alpine.store("chartBuilder");
  if (y = d, b = A, typeof window.Plotly > "u") {
    m._plotlyMissing = !0, d && (d.textContent = w);
    return;
  }
  x && m._render(), v && v.disconnect();
  const e = d == null ? void 0 : d.closest(".chart-builder");
  e && typeof ResizeObserver < "u" && (v = new ResizeObserver((t) => {
    var r, s;
    const o = (((s = (r = t[0]) == null ? void 0 : r.contentRect) == null ? void 0 : s.width) ?? window.innerWidth) < 1024;
    m._tooSmall = o, o && y && typeof window.Plotly < "u" && (window.Plotly.purge(y), x = !1);
  }), v.observe(e)), d && typeof ResizeObserver < "u" && new ResizeObserver(() => {
    if (m._plotlyMissing || typeof window.Plotly > "u" || m._tooSmall) return;
    const i = d.getBoundingClientRect();
    i.width === 0 || i.height === 0 || (x ? window.Plotly.Plots.resize(d) : (N = !0, m._startEffects(), x = !0, m._render()));
  }).observe(d);
}
typeof window < "u" && (window.initChartBuilder = R, window.bootChartBuilder = $);
export {
  $ as bootChartBuilder,
  R as initChartBuilder
};
