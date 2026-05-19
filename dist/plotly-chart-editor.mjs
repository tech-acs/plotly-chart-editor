function h(n) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(n) : n;
}
function u(n) {
  return JSON.parse(JSON.stringify(h(n)));
}
let w = null;
const M = {
  area: "scatter"
}, N = {
  area: { mode: "none", fill: "tozeroy", fillcolor: "#1f77b4" }
};
let y = null, A = null, k = null, x = !1, _ = !1, b = "Delete this trace? This cannot be undone.", S = null, O = null, T = null;
function P(n, g) {
  for (const [f, c] of Object.entries(g))
    n[f] === void 0 || n[f] === null ? n[f] = structuredClone(c) : typeof c == "object" && !Array.isArray(c) && typeof n[f] == "object" && !Array.isArray(n[f]) && P(n[f], c);
  return n;
}
const C = {
  // Nested sub-objects that primitives bind into must always exist.
  // We provide structural defaults only — values that match Plotly's own
  // defaults so the controls reflect the actual chart state on first render.
  //
  // plot_bgcolor / paper_bgcolor are intentionally NOT defaulted here:
  // Plotly's default is transparent, which browsers render as white. Injecting
  // '#ffffff' would make the controls show white while the chart uses transparent
  // — causing a visible mismatch. Let the consumer provide these explicitly.
  title: { text: "", font: { family: "Arial", size: 16, color: "#000000" } },
  xaxis: {
    title: { text: "" },
    showgrid: !0,
    zeroline: !0,
    tickangle: 0,
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
    tickcolor: "#444444",
    tickwidth: 1,
    ticklen: 5,
    ticks: "outside"
  },
  yaxis: {
    title: { text: "" },
    showgrid: !0,
    zeroline: !0,
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
function I(n, g, f) {
  b = f ?? b;
  const c = P(n.layout ?? {}, C);
  !!Alpine.store("chartBuilder") || Alpine.store("chartBuilder", {
    // ── Loaded from Livewire on mount ─────────────────────────────
    dataSources: n.dataSources ?? {},
    schemaProfiles: n.schemaProfiles ?? {},
    // ── Managed by Alpine ─────────────────────────────────────────
    traces: n.traces ?? [],
    layout: c,
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
      return t.split(".").reduce((r, i) => r == null ? void 0 : r[i], e);
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
      const i = t.split(".");
      let s = e;
      for (let o = 0; o < i.length - 1; o++)
        (s[i[o]] == null || typeof s[i[o]] != "object") && (s[i[o]] = {}), s = s[i[o]];
      s[i[i.length - 1]] = r;
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
      }, i = r[e] ?? r["top-right"];
      t.xanchor = i.xanchor, t.yanchor = i.yanchor, t.x = i.x, t.y = i.y;
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
      if (this._plotlyMissing || !y) return;
      const e = h(this.traces).map((r) => this.compileTrace(r)), t = u(this.layout);
      t.uirevision = JSON.stringify(
        h(this.traces).map((r) => {
          var i;
          return {
            type: r.type,
            columnNames: (i = r.meta) == null ? void 0 : i.columnNames
          };
        })
      ), window.Plotly.react(
        y,
        e,
        t,
        u(this.config)
      ).catch((r) => {
        console.error("[plotly-chart-editor] Plotly.react failed:", r);
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
      h(this.traces).forEach((t, r) => {
        var p;
        const i = ((p = t.meta) == null ? void 0 : p.columnNames) ?? {}, s = {};
        for (const [m, d] of Object.entries(i))
          d && this.dataSources[d] && (s[m] = h(this.dataSources[d]).length);
        const o = Object.values(s);
        if (o.length < 2) return;
        const l = Math.min(...o), a = Math.max(...o);
        if (l !== a)
          for (const [m, d] of Object.entries(s))
            d !== l && e.push({
              traceIndex: r,
              field: m,
              code: "LENGTH_MISMATCH",
              message: `Column '${m}' has ${d} values but trace expects ${l}. Showing first ${l}.`
            });
      }), this.warnings.splice(0, this.warnings.length, ...e);
    },
    /**
     * Return the warning (if any) for a specific trace+field combination.
     * Used by the inline warning in the column selector.
     */
    warningFor(e, t) {
      return h(this.warnings).find(
        (r) => r.traceIndex === e && r.field === t
      ) ?? null;
    },
    // ── Meta resolution ───────────────────────────────────────────
    resolveMeta(e) {
      var i;
      const t = u(e), r = ((i = t.meta) == null ? void 0 : i.columnNames) ?? {};
      for (const [s, o] of Object.entries(r))
        o && this.dataSources[o] !== void 0 && (t[s] = h(this.dataSources[o]));
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
            const i = e[r.target];
            if (!Array.isArray(i)) continue;
            const s = i.map((o) => {
              switch (r.operation) {
                case "=":
                  return o === r.value;
                case "!=":
                  return o !== r.value;
                case "<":
                  return o < r.value;
                case "<=":
                  return o <= r.value;
                case ">":
                  return o > r.value;
                case ">=":
                  return o >= r.value;
                default:
                  return !0;
              }
            });
            for (const o of t)
              e[o] = e[o].filter((l, a) => s[a]);
          } else if (r.type === "sort") {
            const i = e[r.target];
            if (!Array.isArray(i)) continue;
            const s = i.length, o = Array.from({ length: s }, (l, a) => a);
            o.sort((l, a) => {
              const p = i[l], m = i[a], d = p < m ? -1 : p > m ? 1 : 0;
              return r.order === "descending" ? -d : d;
            });
            for (const l of t)
              e[l] = o.map((a) => e[l][a]);
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
      const t = e ?? h(this.traceTypes)[0] ?? "bar";
      this.traces.push({
        type: t,
        name: `Trace ${this.traces.length + 1}`,
        meta: { columnNames: {} }
      }), this.activeTraceIndex = this.traces.length - 1;
    },
    /**
     * Deep-copy the active trace and append it. Sets the copy active.
     *
     * @param {number} [index]
     */
    duplicateTrace(e) {
      const t = e ?? this.activeTraceIndex, r = u(h(this.traces)[t]);
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
        if (w)
          try {
            const s = await w.getSchemaProfile(t);
            if (!s || typeof s != "object" || !s.groups)
              throw new Error(`Invalid profile returned for type "${t}"`);
            this.schemaProfiles[t] = s, this._applyTraceType(e, t);
          } catch (s) {
            console.error(`[plotly-chart-editor] Failed to load profile for "${t}":`, s), this._dispatchToast(t);
          }
      }
    },
    _applyTraceType(e, t) {
      const r = this.schemaProfiles[t], i = u(h(this.traces)[e] ?? {}), s = this._profileFieldKeys(r), o = { type: t };
      for (const a of ["name", "meta", "transforms"])
        i[a] !== void 0 && (o[a] = i[a]);
      for (const a of Object.keys(i))
        ["type", "name", "meta"].includes(a) || s.has(a) && (o[a] = i[a]);
      const l = N[t] ?? {};
      for (const [a, p] of Object.entries(l))
        o[a] = p;
      this.traces[e] = o;
    },
    _profileFieldKeys(e) {
      const t = /* @__PURE__ */ new Set();
      for (const r of Object.values((e == null ? void 0 : e.groups) ?? {}))
        for (const i of (r == null ? void 0 : r.fields) ?? [])
          t.add(i.key.split(".")[0]);
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
      const e = h(this.traces).map((t) => this.compileTrace(t));
      return JSON.stringify(
        { data: e, layout: u(this.layout), config: u(this.config) },
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
        await navigator.clipboard.writeText(this._buildExportPayload()), this.copiedAt = Date.now(), clearTimeout(O), O = setTimeout(() => {
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
    _download(e, t, r, i = !1) {
      const s = document.createElement("a");
      s.href = i ? r : `data:${t};charset=utf-8,${encodeURIComponent(r)}`, s.download = e, s.style.display = "none", document.body.appendChild(s), s.click(), document.body.removeChild(s);
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
        traces: h(this.traces).map((t) => this.compileTrace(t)),
        layout: u(this.layout)
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
function j(n, g, f, c, v) {
  I(n, g, f);
  const e = Alpine.store("chartBuilder");
  if (y = c, w = v, typeof window.Plotly > "u") {
    e._plotlyMissing = !0, c && (c.textContent = g);
    return;
  }
  x && e._render(), T && T.disconnect();
  const t = c == null ? void 0 : c.closest(".chart-builder");
  t && typeof ResizeObserver < "u" && (T = new ResizeObserver((r) => {
    var o, l;
    const s = (((l = (o = r[0]) == null ? void 0 : o.contentRect) == null ? void 0 : l.width) ?? window.innerWidth) < 1024;
    e._tooSmall = s, s && y && typeof window.Plotly < "u" && (window.Plotly.purge(y), x = !1);
  }), T.observe(t)), c && typeof ResizeObserver < "u" && new ResizeObserver(() => {
    if (e._plotlyMissing || typeof window.Plotly > "u" || e._tooSmall) return;
    const i = c.getBoundingClientRect();
    i.width === 0 || i.height === 0 || (x ? window.Plotly.Plots.resize(c) : (_ = !0, e._startEffects(), x = !0, e._render()));
  }).observe(c);
}
typeof window < "u" && (window.initChartBuilder = I, window.bootChartBuilder = j);
export {
  j as bootChartBuilder,
  I as initChartBuilder
};
