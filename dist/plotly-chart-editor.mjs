function f(n) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(n) : n;
}
function p(n) {
  return JSON.parse(JSON.stringify(f(n)));
}
let w = null;
const M = {
  area: "scatter"
}, C = {
  area: { mode: "none", fill: "tozeroy", fillcolor: "#1f77b4" }
};
let u = null, A = null, k = null, x = !1, _ = !1, b = "Delete this trace? This cannot be undone.", S = null, P = null, T = null, O = null;
function N(n, g) {
  for (const [d, l] of Object.entries(g))
    n[d] === void 0 || n[d] === null ? n[d] = structuredClone(l) : typeof l == "object" && !Array.isArray(l) && typeof n[d] == "object" && !Array.isArray(n[d]) && N(n[d], l);
  return n;
}
const j = {
  // Nested sub-objects that primitives bind into must always exist.
  // We provide structural defaults only — values that match Plotly's own
  // defaults so the controls reflect the actual chart state on first render.
  //
  // plot_bgcolor / paper_bgcolor are intentionally NOT defaulted here:
  // Plotly's default is transparent, which browsers render as white. Injecting
  // '#ffffff' would make the controls show white while the chart uses transparent
  // — causing a visible mismatch. Let the consumer provide these explicitly.
  title: { text: "", font: { family: "Arial", size: 16, color: "#000000" }, x: 0.5 },
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
  margin: { t: 50, b: 50, l: 60, r: 30 },
  showlegend: !1,
  legend: {
    orientation: "v",
    xanchor: "right",
    yanchor: "top",
    x: 1,
    y: 1,
    bgcolor: "",
    bordercolor: "#444444",
    borderwidth: 0,
    font: { family: "Arial", size: 12, color: "#000000" },
    title: { text: "", font: { family: "Arial", size: 12, color: "#000000" } }
  },
  hovermode: "x",
  hoverlabel: {
    bgcolor: "#ffffff",
    bordercolor: "#444444",
    font: { family: "Arial", size: 12, color: "#000000" }
  }
};
function I(n, g, d) {
  b = d ?? b;
  const l = N(n.layout ?? {}, j);
  !!Alpine.store("chartBuilder") || Alpine.store("chartBuilder", {
    // ── Loaded from Livewire on mount ─────────────────────────────
    dataSources: n.dataSources ?? {},
    schemaProfiles: n.schemaProfiles ?? {},
    // ── Managed by Alpine ─────────────────────────────────────────
    traces: n.traces ?? [],
    layout: l,
    config: n.config ?? { responsive: !0 },
    // ── Sync / UI config ──────────────────────────────────────────
    syncMode: n.syncMode ?? "manual",
    traceTypes: n.traceTypes ?? ["bar", "scatter", "pie", "histogram", "line", "area"],
    showExport: n.showExport ?? !0,
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
    _plotlyMissingMessage: g,
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
      return t.split(".").reduce((r, o) => r == null ? void 0 : r[o], e);
    },
    /**
     * Write a value at a dot-separated path on an object,
     * creating intermediate objects as needed.
     *
     * @param {object} obj
     * @param {string} path  dot-separated key string
     * @param {*}      value
     */
    setPath(e, t, r) {
      const o = t.split(".");
      let i = e;
      for (let s = 0; s < o.length - 1; s++)
        (i[o[s]] == null || typeof i[o[s]] != "object") && (i[o[s]] = {}), i = i[o[s]];
      i[o[o.length - 1]] = r;
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
    setColumnName(e, t, r) {
      const o = this.traces[e];
      o.meta || (o.meta = { columnNames: {} }), o.meta.columnNames || (o.meta.columnNames = {}), o.meta.columnNames[t] = r;
    },
    /**
     * Whether the given trace type supports marker config.
     * @param {string} type
     * @returns {boolean}
     */
    hasMarkerSupport(e) {
      return ["scatter", "bar", "histogram", "pie"].includes(e);
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
    /**
     * Set the legend position preset and update the 4 position fields.
     *
     * @param {string} position
     */
    setLegendPosition(e) {
      const t = this.layout.legend;
      this.setPath(this.layout, "legend._position", e);
      const r = {
        "top-right": { xanchor: "right", yanchor: "top", x: 1, y: 1 },
        "top-left": { xanchor: "left", yanchor: "top", x: 0, y: 1 },
        "bottom-right": { xanchor: "right", yanchor: "bottom", x: 1, y: 0 },
        "bottom-left": { xanchor: "left", yanchor: "bottom", x: 0, y: 0 },
        "top-center": { xanchor: "center", yanchor: "top", x: 0.5, y: 1 },
        "bottom-center": { xanchor: "center", yanchor: "bottom", x: 0.5, y: 0 },
        "left-center": { xanchor: "left", yanchor: "middle", x: 0, y: 0.5 },
        "right-center": { xanchor: "right", yanchor: "middle", x: 1, y: 0.5 }
      }, o = r[e] ?? r["top-right"];
      t.xanchor = o.xanchor, t.yanchor = o.yanchor, t.x = o.x, t.y = o.y;
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
      clearTimeout(A), A = setTimeout(() => {
        this.validate(), this._render(), _ ? _ = !1 : this.markDirty();
      }, 50);
    },
    _render() {
      if (this._plotlyMissing || !u) return;
      const e = f(this.traces).map((s) => this.compileTrace(s)), t = p(this.layout), r = JSON.stringify(
        f(this.traces).map((s) => {
          var c;
          return {
            type: s.type,
            mode: s.mode,
            columnNames: (c = s.meta) == null ? void 0 : c.columnNames
          };
        })
      ), o = r !== O;
      O = r, t.uirevision = r, (o ? (window.Plotly.purge(u), window.Plotly.newPlot) : window.Plotly.react)(
        u,
        e,
        t,
        p(this.config)
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
      f(this.traces).forEach((t, r) => {
        var h;
        const o = ((h = t.meta) == null ? void 0 : h.columnNames) ?? {}, i = {};
        for (const [m, y] of Object.entries(o))
          y && this.dataSources[y] && (i[m] = f(this.dataSources[y]).length);
        const s = Object.values(i);
        if (s.length < 2) return;
        const c = Math.min(...s), a = Math.max(...s);
        if (c !== a)
          for (const [m, y] of Object.entries(i))
            y !== c && e.push({
              traceIndex: r,
              field: m,
              code: "LENGTH_MISMATCH",
              message: `Column '${m}' has ${y} values but trace expects ${c}. Showing first ${c}.`
            });
      }), this.warnings.splice(0, this.warnings.length, ...e);
    },
    /**
     * Return the warning (if any) for a specific trace+field combination.
     * Used by the inline warning in the column selector.
     */
    warningFor(e, t) {
      return f(this.warnings).find(
        (r) => r.traceIndex === e && r.field === t
      ) ?? null;
    },
    // ── Meta resolution ───────────────────────────────────────────
    resolveMeta(e) {
      var o;
      const t = p(e), r = ((o = t.meta) == null ? void 0 : o.columnNames) ?? {};
      for (const [i, s] of Object.entries(r))
        s && this.dataSources[s] !== void 0 && (t[i] = f(this.dataSources[s]));
      return this._applyTransforms(t), t;
    },
    /**
     * Apply filter/sort transforms to the resolved trace data arrays.
     * Modifies the trace in place.
     *
     * @param {object} trace
     */
    _applyTransforms(e) {
      if (!Array.isArray(e.transforms) || e.transforms.length === 0) return;
      const t = Object.keys(e).filter(
        (r) => Array.isArray(e[r]) && r !== "transforms" && r !== "meta"
      );
      if (t.length !== 0) {
        for (const r of e.transforms)
          if (r.type === "filter") {
            const o = e[r.target];
            if (!Array.isArray(o)) continue;
            const i = o.map((s) => {
              switch (r.operation) {
                case "=":
                  return s === r.value;
                case "!=":
                  return s !== r.value;
                case "<":
                  return s < r.value;
                case "<=":
                  return s <= r.value;
                case ">":
                  return s > r.value;
                case ">=":
                  return s >= r.value;
                default:
                  return !0;
              }
            });
            for (const s of t)
              e[s] = e[s].filter((c, a) => i[a]);
          } else if (r.type === "sort") {
            const o = e[r.target];
            if (!Array.isArray(o)) continue;
            const i = o.length, s = Array.from({ length: i }, (c, a) => a);
            s.sort((c, a) => {
              const h = o[c], m = o[a], y = h < m ? -1 : h > m ? 1 : 0;
              return r.order === "descending" ? -y : y;
            });
            for (const c of t)
              e[c] = s.map((a) => e[c][a]);
          }
      }
    },
    compileTrace(e) {
      const t = this.resolveMeta(e);
      return t.type = M[t.type] ?? t.type, delete t.meta, t;
    },
    // ── Trace operations (PRD §6) ─────────────────────────────────
    /**
     * Append a new empty trace with the given type (defaults to first
     * enabled type). Sets it as active.
     *
     * @param {string} [type]
     */
    addTrace(e) {
      const t = e ?? f(this.traceTypes)[0] ?? "bar", r = {
        type: t,
        name: `Trace ${this.traces.length + 1}`,
        meta: { columnNames: {} }
      }, o = this.schemaProfiles[t];
      if (o)
        for (const i of Object.values(o.groups))
          for (const s of i.fields)
            s.dflt !== void 0 && this.setPath(r, s.key, s.dflt);
      this.traces.push(r), this.activeTraceIndex = this.traces.length - 1;
    },
    /**
     * Deep-copy the active trace and append it. Sets the copy active.
     *
     * @param {number} [index]
     */
    duplicateTrace(e) {
      const t = e ?? this.activeTraceIndex, r = p(f(this.traces)[t]);
      r.name = (r.name ?? `Trace ${t + 1}`) + " (copy)", this.traces.push(r), this.activeTraceIndex = this.traces.length - 1;
    },
    /**
     * Remove a trace after native confirm(). Adjusts activeTraceIndex
     * so it never goes out of bounds.
     *
     * @param {number} [index]
     */
    removeTrace(e) {
      const t = e ?? this.activeTraceIndex;
      window.confirm(b) && (this.traces.splice(t, 1), this.traces.length === 0 ? this.activeTraceIndex = 0 : this.activeTraceIndex >= this.traces.length && (this.activeTraceIndex = this.traces.length - 1));
    },
    /**
     * Swap trace at `from` with trace at `to`.
     *
     * @param {number} from
     * @param {number} to
     */
    moveTrace(e, t) {
      const r = this.traces.length;
      if (t < 0 || t >= r) return;
      const o = p(f(this.traces[e]));
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
        if (w)
          try {
            const i = await w.getSchemaProfile(t);
            if (!i || typeof i != "object" || !i.groups)
              throw new Error(`Invalid profile returned for type "${t}"`);
            this.schemaProfiles[t] = i, this._applyTraceType(e, t);
          } catch (i) {
            console.error(`[plotly-chart-editor] Failed to load profile for "${t}":`, i), this._dispatchToast(t);
          }
      }
    },
    _applyTraceType(e, t) {
      const r = this.schemaProfiles[t], o = p(f(this.traces)[e] ?? {}), i = this._profileFieldKeys(r), s = { type: t };
      for (const a of ["name", "meta", "transforms"])
        o[a] !== void 0 && (s[a] = o[a]);
      for (const a of Object.keys(o))
        ["type", "name", "meta"].includes(a) || i.has(a) && (s[a] = o[a]);
      const c = C[t] ?? {};
      for (const [a, h] of Object.entries(c))
        s[a] = h;
      if (r)
        for (const a of Object.values(r.groups))
          for (const h of a.fields)
            h.dflt !== void 0 && this.getPath(s, h.key) === void 0 && this.setPath(s, h.key, h.dflt);
      this.traces[e] = s;
    },
    _profileFieldKeys(e) {
      const t = /* @__PURE__ */ new Set();
      for (const r of Object.values((e == null ? void 0 : e.groups) ?? {}))
        for (const o of (r == null ? void 0 : r.fields) ?? [])
          t.add(o.key.split(".")[0]);
      return t;
    },
    _dispatchToast(e) {
      window.dispatchEvent(new CustomEvent("plotly-editor:toast", {
        detail: {
          key: "errors.profile_load_failed",
          message: `Failed to load profile for ${e}. Please try again.`,
          type: e
        }
      }));
    },
    // ── Transforms ────────────────────────────────────────────────
    /**
     * Add a transform to the active trace.
     * Creates the transforms array if it doesn't exist.
     *
     * @param {'filter'|'sort'} type
     */
    addTransform(e) {
      const t = this.traces[this.activeTraceIndex];
      if (!t) return;
      Array.isArray(t.transforms) || (t.transforms = []);
      const r = {
        filter: { type: "filter", target: "y", operation: ">", value: 0 },
        sort: { type: "sort", target: "y", order: "ascending" }
      };
      t.transforms.push(r[e] ?? { type: e }), this._scheduleRender();
    },
    /**
     * Remove a transform from the active trace by index.
     * Deletes the transforms key if the array becomes empty.
     *
     * @param {number} idx
     */
    removeTransform(e) {
      const t = this.traces[this.activeTraceIndex];
      !t || !Array.isArray(t.transforms) || (t.transforms.splice(e, 1), t.transforms.length === 0 && delete t.transforms, this._scheduleRender());
    },
    // ── Export (PRD §10) ──────────────────────────────────────────
    _buildExportPayload() {
      const e = f(this.traces).map((t) => this.compileTrace(t));
      return JSON.stringify(
        { data: e, layout: p(this.layout), config: p(this.config) },
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
      if (!(this._plotlyMissing || !u))
        try {
          const t = await window.Plotly.toImage(u, {
            format: e,
            width: u.offsetWidth || 1200,
            height: u.offsetHeight || 600
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
        await navigator.clipboard.writeText(this._buildExportPayload()), this.copiedAt = Date.now(), clearTimeout(P), P = setTimeout(() => {
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
    _download(e, t, r, o = !1) {
      const i = document.createElement("a");
      i.href = o ? r : `data:${t};charset=utf-8,${encodeURIComponent(r)}`, i.download = e, i.style.display = "none", document.body.appendChild(i), i.click(), document.body.removeChild(i);
    },
    // ── Sync state ────────────────────────────────────────────────
    markDirty() {
      this.dirty = !0, this._maybeAutoSync();
    },
    _maybeAutoSync() {
      (this.syncMode === "auto" || this.syncMode === "hybrid") && (clearTimeout(k), k = setTimeout(() => this.syncToBackend(), 500));
    },
    syncToBackend() {
      if (this.syncing || !w) return;
      this.syncing = !0;
      const e = {
        traces: f(this.traces).map((t) => this.compileTrace(t)),
        layout: p(this.layout)
      };
      w.syncFromAlpine(JSON.stringify(e)).then(() => {
        this.savedAt = Date.now(), clearTimeout(S), S = setTimeout(() => {
          this.savedAt = null;
        }, 2e3);
      }).catch((t) => {
        console.error("[plotly-chart-editor] syncToBackend failed:", t), this.dirty = !0;
      }).finally(() => {
        this.syncing = !1, this.lastSyncAt = Date.now();
      });
    },
    setWire(e) {
      w = e;
    }
  });
}
function R(n, g, d, l, v) {
  I(n, g, d);
  const e = Alpine.store("chartBuilder");
  if (u = l, w = v, typeof window.Plotly > "u") {
    e._plotlyMissing = !0, l && (l.textContent = g);
    return;
  }
  x && e._render(), T && T.disconnect();
  const t = l == null ? void 0 : l.closest(".chart-builder");
  t && typeof ResizeObserver < "u" && (T = new ResizeObserver((r) => {
    var s, c;
    const i = (((c = (s = r[0]) == null ? void 0 : s.contentRect) == null ? void 0 : c.width) ?? window.innerWidth) < 1024;
    e._tooSmall = i, i && u && typeof window.Plotly < "u" && (window.Plotly.purge(u), x = !1);
  }), T.observe(t)), l && typeof ResizeObserver < "u" && new ResizeObserver(() => {
    if (e._plotlyMissing || typeof window.Plotly > "u" || e._tooSmall) return;
    const o = l.getBoundingClientRect();
    o.width === 0 || o.height === 0 || (x ? window.Plotly.Plots.resize(l) : (_ = !0, e._startEffects(), x = !0, e._render()));
  }).observe(l);
}
typeof window < "u" && (window.initChartBuilder = I, window.bootChartBuilder = R);
export {
  R as bootChartBuilder,
  I as initChartBuilder
};
