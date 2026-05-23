function h(a) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(a) : a;
}
function u(a) {
  return JSON.parse(JSON.stringify(h(a)));
}
let T = null;
const z = {
  area: "scatter"
}, D = {
  area: { mode: "none", fill: "tozeroy", fillcolor: "#1f77b4" }
};
let m = null, C = null, M = null, A = !1, P = !1, S = "Delete this trace? This cannot be undone.", O = "Column ':field' has :colLen values but trace expects :expectedLen. Showing first :shown.", N = "Failed to load profile for :type. Please try again.", I = null, j = null, v = null, F = null;
function R(a, _) {
  for (const [y, g] of Object.entries(_))
    a[y] === void 0 || a[y] === null || typeof a[y] != typeof g ? a[y] = structuredClone(g) : typeof g == "object" && !Array.isArray(g) && typeof a[y] == "object" && !Array.isArray(a[y]) && R(a[y], g);
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
}, E = {
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
function L(a, _, y, g, p, k) {
  S = y ?? S, O = p ?? O, N = k ?? N;
  const x = a.layout ?? {}, c = R(
    Array.isArray(x) ? {} : x,
    B
  );
  c.annotations && Array.isArray(c.annotations) && (c._annotations = c._annotations.concat(
    c.annotations.map((e) => ({ ...e, _plotlyType: "text" }))
  ), delete c.annotations), c.shapes && Array.isArray(c.shapes) && (c._annotations = c._annotations.concat(
    c.shapes.map((e) => ({ ...e, _plotlyType: "shape" }))
  ), delete c.shapes), c.images && Array.isArray(c.images) && (c._annotations = c._annotations.concat(
    c.images.map((e) => ({ ...e, _plotlyType: "image" }))
  ), delete c.images), !!Alpine.store("chartBuilder") || Alpine.store("chartBuilder", {
    // ── Loaded from Livewire on mount ─────────────────────────────
    dataSources: a.dataSources ?? {},
    schemaProfiles: a.schemaProfiles ?? {},
    // ── Managed by Alpine ─────────────────────────────────────────
    traces: a.traces ?? [],
    layout: c,
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
    // timestamp of last successful sync (drives "Synced ✓")
    copiedAt: null,
    // timestamp of last clipboard copy (drives "Copied ✓")
    // ── Internal flags ────────────────────────────────────────────
    _plotlyMissingMessage: _,
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
      return t.split(".").reduce((o, i) => o == null ? void 0 : o[i], e);
    },
    /**
     * Write a value at a dot-separated path on an object,
     * creating intermediate objects as needed.
     *
     * @param {object} obj
     * @param {string} path  dot-separated key string
     * @param {*}      value
     */
    setPath(e, t, o) {
      const i = t.split(".");
      let s = e;
      for (let n = 0; n < i.length - 1; n++)
        (s[i[n]] == null || typeof s[i[n]] != "object") && (s[i[n]] = {}), s = s[i[n]];
      s[i[i.length - 1]] = o;
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
    setColumnName(e, t, o) {
      const i = this.traces[e];
      i.meta || (i.meta = { columnNames: {} }), i.meta.columnNames || (i.meta.columnNames = {}), i.meta.columnNames[t] = o;
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
      clearTimeout(C), C = setTimeout(() => {
        this.validate(), this._render(), P ? P = !1 : this.markDirty();
      }, 50);
    },
    _render() {
      if (this._plotlyMissing || !m) return;
      const e = h(this.traces).map((n) => this.compileTrace(n)), t = u(this.layout);
      this._compileAnnotations(t);
      const o = JSON.stringify(
        h(this.traces).map((n) => {
          var f;
          return {
            type: n.type,
            mode: n.mode,
            columnNames: (f = n.meta) == null ? void 0 : f.columnNames
          };
        })
      ), i = o !== F;
      F = o, t.uirevision = o, (i ? (window.Plotly.purge(m), window.Plotly.newPlot) : window.Plotly.react)(
        m,
        e,
        t,
        u(this.config)
      ).catch((n) => {
        console.error("[plotly-chart-editor] Plotly render failed:", n);
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
      h(this.traces).forEach((t, o) => {
        var l;
        const i = ((l = t.meta) == null ? void 0 : l.columnNames) ?? {}, s = {};
        for (const [d, b] of Object.entries(i))
          b && this.dataSources[b] && (s[d] = h(this.dataSources[b]).length);
        const n = Object.values(s);
        if (n.length < 2) return;
        const f = Math.min(...n), r = Math.max(...n);
        if (f !== r)
          for (const [d, b] of Object.entries(s))
            b !== f && e.push({
              traceIndex: o,
              field: d,
              code: "LENGTH_MISMATCH",
              message: O.replace(":field", d).replace(":columnLen", String(b)).replace(":expectedLen", String(f)).replace(":shown", String(f))
            });
      }), this.warnings.splice(0, this.warnings.length, ...e);
    },
    /**
     * Return the warning (if any) for a specific trace+field combination.
     * Used by the inline warning in the column selector.
     */
    warningFor(e, t) {
      return h(this.warnings).find(
        (o) => o.traceIndex === e && o.field === t
      ) ?? null;
    },
    compileTrace(e) {
      var i, s;
      const t = u(e), o = ((i = t.meta) == null ? void 0 : i.columnNames) ?? {};
      for (const [n, f] of Object.entries(o)) {
        if (!f || this.dataSources[f] === void 0 || n === "marker.size" && ((s = t.marker) == null ? void 0 : s.size_from_column) === !1) continue;
        const r = n.split(".");
        let l = t;
        for (let d = 0; d < r.length - 1; d++)
          (l[r[d]] == null || typeof l[r[d]] != "object") && (l[r[d]] = {}), l = l[r[d]];
        l[r[r.length - 1]] = h(this.dataSources[f]);
      }
      return t.type = z[t.type] ?? t.type, t;
    },
    // ── Trace operations (PRD §6) ─────────────────────────────────
    /**
     * Append a new empty trace with the given type (defaults to first
     * enabled type). Sets it as active.
     *
     * @param {string} [type]
     */
    addTrace(e) {
      const t = e ?? h(this.traceTypes)[0] ?? "bar", o = {
        type: t,
        name: `Trace ${this.traces.length + 1}`,
        meta: { columnNames: {} }
      }, i = this.schemaProfiles[t];
      if (i)
        for (const s of Object.values(i.groups))
          for (const n of s.fields)
            n.dflt !== void 0 && this.setPath(o, n.key, n.dflt);
      this.traces.push(o), this.activeTraceIndex = this.traces.length - 1;
    },
    /**
     * Deep-copy the active trace and append it. Sets the copy active.
     *
     * @param {number} [index]
     */
    duplicateTrace(e) {
      const t = e ?? this.activeTraceIndex, o = u(h(this.traces)[t]);
      o.name = (o.name ?? `Trace ${t + 1}`) + " (copy)", this.traces.push(o), this.activeTraceIndex = this.traces.length - 1;
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
      const o = this.traces.length;
      if (t < 0 || t >= o) return;
      const i = u(h(this.traces[e]));
      this.traces.splice(e, 1), this.traces.splice(t, 0, i), this.activeTraceIndex = t;
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
      const t = E[e];
      t && (this.layout._annotations || (this.layout._annotations = []), this.layout._annotations.push(u(t)), this._scheduleRender());
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
      const o = this.layout._annotations;
      if (!o || e < 0 || e >= o.length || t < 0 || t >= o.length || e === t) return;
      const i = u(h(o[e]));
      o.splice(e, 1), o.splice(t, 0, i), this._scheduleRender();
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
      const o = [], i = [], s = [];
      for (const n of t) {
        const f = h(n), r = u(f);
        delete r._plotlyType, f._plotlyType === "text" ? o.push(r) : f._plotlyType === "shape" ? i.push(r) : f._plotlyType === "image" && s.push(r);
      }
      e.annotations = o, e.shapes = i, e.images = s, delete e._annotations;
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
      var i;
      if (((i = h(this.traces)[e]) == null ? void 0 : i.type) !== t) {
        if (this.schemaProfiles[t]) {
          this._applyTraceType(e, t);
          return;
        }
        if (T)
          try {
            const s = await T.getSchemaProfile(t);
            if (!s || typeof s != "object" || !s.groups)
              throw new Error(`Invalid profile returned for type "${t}"`);
            this.schemaProfiles[t] = s, this._applyTraceType(e, t);
          } catch (s) {
            console.error(`[plotly-chart-editor] Failed to load profile for "${t}":`, s), this._dispatchToast(t);
          }
      }
    },
    _applyTraceType(e, t) {
      const o = this.schemaProfiles[t], i = u(h(this.traces)[e] ?? {}), s = this._profileFieldKeys(o), n = { type: t };
      for (const r of ["name", "meta"])
        i[r] !== void 0 && (n[r] = i[r]);
      for (const r of Object.keys(i))
        ["type", "name", "meta"].includes(r) || s.has(r) && (n[r] = i[r]);
      const f = D[t] ?? {};
      for (const [r, l] of Object.entries(f))
        n[r] = l;
      if (o)
        for (const r of Object.values(o.groups))
          for (const l of r.fields)
            l.dflt !== void 0 && this.getPath(n, l.key) === void 0 && this.setPath(n, l.key, l.dflt);
      this.traces[e] = n;
    },
    _profileFieldKeys(e) {
      const t = /* @__PURE__ */ new Set();
      for (const o of Object.values((e == null ? void 0 : e.groups) ?? {}))
        for (const i of (o == null ? void 0 : o.fields) ?? [])
          t.add(i.key.split(".")[0]);
      return t;
    },
    _dispatchToast(e) {
      window.dispatchEvent(new CustomEvent("plotly-editor:toast", {
        detail: {
          key: "errors.profile_load_failed",
          message: N.replace(":type", e),
          type: e
        }
      }));
    },
    // ── Export (PRD §10) ──────────────────────────────────────────
    _buildExportPayload() {
      const e = h(this.traces).map((t) => this.compileTrace(t));
      return JSON.stringify(
        { data: e, layout: u(this.layout), config: u(this.config) },
        null,
        2
      );
    },
    /**
     * Download the full chart config as chart.json.
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
      if (!(this._plotlyMissing || !m))
        try {
          const t = await window.Plotly.toImage(m, {
            format: e,
            width: m.offsetWidth || 1200,
            height: m.offsetHeight || 600
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
        await navigator.clipboard.writeText(this._buildExportPayload()), this.copiedAt = Date.now(), clearTimeout(j), j = setTimeout(() => {
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
    _download(e, t, o, i = !1) {
      const s = document.createElement("a");
      s.href = i ? o : `data:${t};charset=utf-8,${encodeURIComponent(o)}`, s.download = e, s.style.display = "none", document.body.appendChild(s), s.click(), document.body.removeChild(s);
    },
    // ── Sync state ────────────────────────────────────────────────
    markDirty() {
      this.dirty = !0, this._maybeAutoSync();
    },
    _maybeAutoSync() {
      (this.syncMode === "auto" || this.syncMode === "hybrid") && (clearTimeout(M), M = setTimeout(() => this.syncToBackend(), 500));
    },
    syncToBackend() {
      if (this.syncing || !T) return;
      this.syncing = !0;
      const e = u(this.layout);
      this._compileAnnotations(e);
      const t = {
        traces: h(this.traces).map((o) => {
          var n;
          const i = u(o);
          i.type = z[i.type] ?? i.type;
          const s = ((n = i.meta) == null ? void 0 : n.columnNames) ?? {};
          for (const f of Object.keys(s)) {
            const r = f.split(".");
            let l = i;
            for (let d = 0; d < r.length - 1 && !(l[r[d]] == null || typeof l[r[d]] != "object"); d++)
              l = l[r[d]];
            delete l[r[r.length - 1]];
          }
          return i;
        }),
        layout: e
      };
      T.syncFromAlpine(JSON.stringify(t)).then(() => {
        this.dirty = !1, this.savedAt = Date.now(), clearTimeout(I), I = setTimeout(() => {
          this.savedAt = null;
        }, 2e3), window.dispatchEvent(new CustomEvent("plotly-chart-editor:synced", {
          detail: { traces: t.traces, layout: e }
        }));
      }).catch((o) => {
        console.error("[plotly-chart-editor] syncToBackend failed:", o), this.dirty = !0, window.dispatchEvent(new CustomEvent("plotly-chart-editor:sync-failed", {
          detail: { error: o.message ?? String(o) }
        }));
      }).finally(() => {
        this.syncing = !1, this.lastSyncAt = Date.now();
      });
    },
    setWire(e) {
      T = e;
    }
  });
}
function J(a, _, y, g, p, k, x, c) {
  L(a, _, y, g, x, c);
  const w = Alpine.store("chartBuilder");
  if (m = p, T = k, typeof window.Plotly > "u") {
    w._plotlyMissing = !0, p && (p.textContent = _);
    return;
  }
  A && w._render(), v && v.disconnect();
  const e = p == null ? void 0 : p.closest(".chart-builder");
  e && typeof ResizeObserver < "u" && (v = new ResizeObserver((t) => {
    var s, n;
    const i = (((n = (s = t[0]) == null ? void 0 : s.contentRect) == null ? void 0 : n.width) ?? window.innerWidth) < 1024;
    w._tooSmall = i, i && m && typeof window.Plotly < "u" && (window.Plotly.purge(m), A = !1);
  }), v.observe(e)), p && typeof ResizeObserver < "u" && new ResizeObserver(() => {
    if (w._plotlyMissing || typeof window.Plotly > "u" || w._tooSmall) return;
    const o = p.getBoundingClientRect();
    o.width === 0 || o.height === 0 || (A ? window.Plotly.Plots.resize(p) : (P = !0, w._startEffects(), A = !0, w._render()));
  }).observe(p);
}
typeof window < "u" && (window.initChartBuilder = L, window.bootChartBuilder = J);
export {
  J as bootChartBuilder,
  L as initChartBuilder
};
