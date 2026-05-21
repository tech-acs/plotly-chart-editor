function c(n) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(n) : n;
}
function p(n) {
  return JSON.parse(JSON.stringify(c(n)));
}
let g = null;
const C = {
  area: "scatter"
}, M = {
  area: { mode: "none", fill: "tozeroy", fillcolor: "#1f77b4" }
};
let h = null, k = null, A = null, T = !1, v = !1, _ = "Delete this trace? This cannot be undone.", S = null, P = null, b = null, O = null;
function N(n, y) {
  for (const [f, a] of Object.entries(y))
    n[f] === void 0 || n[f] === null ? n[f] = structuredClone(a) : typeof a == "object" && !Array.isArray(a) && typeof n[f] == "object" && !Array.isArray(n[f]) && N(n[f], a);
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
  showlegend: !0,
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
function I(n, y, f) {
  _ = f ?? _;
  const a = N(n.layout ?? {}, j);
  !!Alpine.store("chartBuilder") || Alpine.store("chartBuilder", {
    // ── Loaded from Livewire on mount ─────────────────────────────
    dataSources: n.dataSources ?? {},
    schemaProfiles: n.schemaProfiles ?? {},
    // ── Managed by Alpine ─────────────────────────────────────────
    traces: n.traces ?? [],
    layout: a,
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
    _plotlyMissingMessage: y,
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
      let o = e;
      for (let s = 0; s < i.length - 1; s++)
        (o[i[s]] == null || typeof o[i[s]] != "object") && (o[i[s]] = {}), o = o[i[s]];
      o[i[i.length - 1]] = r;
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
      const i = this.traces[e];
      i.meta || (i.meta = { columnNames: {} }), i.meta.columnNames || (i.meta.columnNames = {}), i.meta.columnNames[t] = r;
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
      clearTimeout(k), k = setTimeout(() => {
        this.validate(), this._render(), v ? v = !1 : this.markDirty();
      }, 50);
    },
    _render() {
      if (this._plotlyMissing || !h) return;
      const e = c(this.traces).map((s) => this.compileTrace(s)), t = p(this.layout), r = JSON.stringify(
        c(this.traces).map((s) => {
          var d;
          return {
            type: s.type,
            mode: s.mode,
            columnNames: (d = s.meta) == null ? void 0 : d.columnNames
          };
        })
      ), i = r !== O;
      O = r, t.uirevision = r, (i ? (window.Plotly.purge(h), window.Plotly.newPlot) : window.Plotly.react)(
        h,
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
      c(this.traces).forEach((t, r) => {
        var u;
        const i = ((u = t.meta) == null ? void 0 : u.columnNames) ?? {}, o = {};
        for (const [w, m] of Object.entries(i))
          m && this.dataSources[m] && (o[w] = c(this.dataSources[m]).length);
        const s = Object.values(o);
        if (s.length < 2) return;
        const d = Math.min(...s), l = Math.max(...s);
        if (d !== l)
          for (const [w, m] of Object.entries(o))
            m !== d && e.push({
              traceIndex: r,
              field: w,
              code: "LENGTH_MISMATCH",
              message: `Column '${w}' has ${m} values but trace expects ${d}. Showing first ${d}.`
            });
      }), this.warnings.splice(0, this.warnings.length, ...e);
    },
    /**
     * Return the warning (if any) for a specific trace+field combination.
     * Used by the inline warning in the column selector.
     */
    warningFor(e, t) {
      return c(this.warnings).find(
        (r) => r.traceIndex === e && r.field === t
      ) ?? null;
    },
    compileTrace(e) {
      var i;
      const t = p(e), r = ((i = t.meta) == null ? void 0 : i.columnNames) ?? {};
      for (const [o, s] of Object.entries(r))
        s && this.dataSources[s] !== void 0 && (t[o] = c(this.dataSources[s]));
      return t.type = C[t.type] ?? t.type, delete t.meta, t;
    },
    // ── Trace operations (PRD §6) ─────────────────────────────────
    /**
     * Append a new empty trace with the given type (defaults to first
     * enabled type). Sets it as active.
     *
     * @param {string} [type]
     */
    addTrace(e) {
      const t = e ?? c(this.traceTypes)[0] ?? "bar", r = {
        type: t,
        name: `Trace ${this.traces.length + 1}`,
        meta: { columnNames: {} }
      }, i = this.schemaProfiles[t];
      if (i)
        for (const o of Object.values(i.groups))
          for (const s of o.fields)
            s.dflt !== void 0 && this.setPath(r, s.key, s.dflt);
      this.traces.push(r), this.activeTraceIndex = this.traces.length - 1;
    },
    /**
     * Deep-copy the active trace and append it. Sets the copy active.
     *
     * @param {number} [index]
     */
    duplicateTrace(e) {
      const t = e ?? this.activeTraceIndex, r = p(c(this.traces)[t]);
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
      window.confirm(_) && (this.traces.splice(t, 1), this.traces.length === 0 ? this.activeTraceIndex = 0 : this.activeTraceIndex >= this.traces.length && (this.activeTraceIndex = this.traces.length - 1));
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
      const i = p(c(this.traces[e]));
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
      if (((i = c(this.traces)[e]) == null ? void 0 : i.type) !== t) {
        if (this.schemaProfiles[t]) {
          this._applyTraceType(e, t);
          return;
        }
        if (g)
          try {
            const o = await g.getSchemaProfile(t);
            if (!o || typeof o != "object" || !o.groups)
              throw new Error(`Invalid profile returned for type "${t}"`);
            this.schemaProfiles[t] = o, this._applyTraceType(e, t);
          } catch (o) {
            console.error(`[plotly-chart-editor] Failed to load profile for "${t}":`, o), this._dispatchToast(t);
          }
      }
    },
    _applyTraceType(e, t) {
      const r = this.schemaProfiles[t], i = p(c(this.traces)[e] ?? {}), o = this._profileFieldKeys(r), s = { type: t };
      for (const l of ["name", "meta"])
        i[l] !== void 0 && (s[l] = i[l]);
      for (const l of Object.keys(i))
        ["type", "name", "meta"].includes(l) || o.has(l) && (s[l] = i[l]);
      const d = M[t] ?? {};
      for (const [l, u] of Object.entries(d))
        s[l] = u;
      if (r)
        for (const l of Object.values(r.groups))
          for (const u of l.fields)
            u.dflt !== void 0 && this.getPath(s, u.key) === void 0 && this.setPath(s, u.key, u.dflt);
      this.traces[e] = s;
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
    // ── Export (PRD §10) ──────────────────────────────────────────
    _buildExportPayload() {
      const e = c(this.traces).map((t) => this.compileTrace(t));
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
      if (!(this._plotlyMissing || !h))
        try {
          const t = await window.Plotly.toImage(h, {
            format: e,
            width: h.offsetWidth || 1200,
            height: h.offsetHeight || 600
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
    _download(e, t, r, i = !1) {
      const o = document.createElement("a");
      o.href = i ? r : `data:${t};charset=utf-8,${encodeURIComponent(r)}`, o.download = e, o.style.display = "none", document.body.appendChild(o), o.click(), document.body.removeChild(o);
    },
    // ── Sync state ────────────────────────────────────────────────
    markDirty() {
      this.dirty = !0, this._maybeAutoSync();
    },
    _maybeAutoSync() {
      (this.syncMode === "auto" || this.syncMode === "hybrid") && (clearTimeout(A), A = setTimeout(() => this.syncToBackend(), 500));
    },
    syncToBackend() {
      if (this.syncing || !g) return;
      this.syncing = !0;
      const e = {
        traces: c(this.traces).map((t) => this.compileTrace(t)),
        layout: p(this.layout)
      };
      g.syncFromAlpine(JSON.stringify(e)).then(() => {
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
      g = e;
    }
  });
}
function z(n, y, f, a, x) {
  I(n, y, f);
  const e = Alpine.store("chartBuilder");
  if (h = a, g = x, typeof window.Plotly > "u") {
    e._plotlyMissing = !0, a && (a.textContent = y);
    return;
  }
  T && e._render(), b && b.disconnect();
  const t = a == null ? void 0 : a.closest(".chart-builder");
  t && typeof ResizeObserver < "u" && (b = new ResizeObserver((r) => {
    var s, d;
    const o = (((d = (s = r[0]) == null ? void 0 : s.contentRect) == null ? void 0 : d.width) ?? window.innerWidth) < 1024;
    e._tooSmall = o, o && h && typeof window.Plotly < "u" && (window.Plotly.purge(h), T = !1);
  }), b.observe(t)), a && typeof ResizeObserver < "u" && new ResizeObserver(() => {
    if (e._plotlyMissing || typeof window.Plotly > "u" || e._tooSmall) return;
    const i = a.getBoundingClientRect();
    i.width === 0 || i.height === 0 || (T ? window.Plotly.Plots.resize(a) : (v = !0, e._startEffects(), T = !0, e._render()));
  }).observe(a);
}
typeof window < "u" && (window.initChartBuilder = I, window.bootChartBuilder = z);
export {
  z as bootChartBuilder,
  I as initChartBuilder
};
