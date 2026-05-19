function c(o) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(o) : o;
}
function f(o) {
  return JSON.parse(JSON.stringify(c(o)));
}
let m = null;
const P = {
  area: "scatter"
}, C = {
  area: { mode: "none", fill: "tozeroy", fillcolor: "#1f77b4" }
};
let u = null, A = null, k = null, T = !1, b = !1, _ = "Delete this trace? This cannot be undone.", S = null, I = null, v = null;
function O(o, y) {
  for (const [d, a] of Object.entries(y))
    o[d] === void 0 || o[d] === null ? o[d] = structuredClone(a) : typeof a == "object" && !Array.isArray(a) && typeof o[d] == "object" && !Array.isArray(o[d]) && O(o[d], a);
  return o;
}
const N = {
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
function M(o, y, d) {
  _ = d ?? _;
  const a = O(o.layout ?? {}, N);
  !!Alpine.store("chartBuilder") || Alpine.store("chartBuilder", {
    // ── Loaded from Livewire on mount ─────────────────────────────
    dataSources: o.dataSources ?? {},
    schemaProfiles: o.schemaProfiles ?? {},
    // ── Managed by Alpine ─────────────────────────────────────────
    traces: o.traces ?? [],
    layout: a,
    config: o.config ?? { responsive: !0 },
    // ── Sync / UI config ──────────────────────────────────────────
    syncMode: o.syncMode ?? "manual",
    traceTypes: o.traceTypes ?? ["bar", "scatter", "pie", "histogram", "line", "area"],
    showExport: o.showExport ?? !0,
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
      var t;
      return ((t = this.traces[this.activeTraceIndex]) == null ? void 0 : t.type) ?? "";
    },
    /**
     * Read a dot-separated path from an object.
     * e.g. getPath(trace, 'marker.color') === trace.marker.color
     *
     * @param {object} obj
     * @param {string} path  dot-separated key string
     * @returns {*}
     */
    getPath(t, e) {
      return e.split(".").reduce((i, r) => i == null ? void 0 : i[r], t);
    },
    /**
     * Write a value at a dot-separated path on an object,
     * creating intermediate objects as needed.
     *
     * @param {object} obj
     * @param {string} path  dot-separated key string
     * @param {*}      value
     */
    setPath(t, e, i) {
      const r = e.split(".");
      let s = t;
      for (let n = 0; n < r.length - 1; n++)
        (s[r[n]] == null || typeof s[r[n]] != "object") && (s[r[n]] = {}), s = s[r[n]];
      s[r[r.length - 1]] = i;
    },
    /**
     * Whether the given trace type supports marker config.
     * @param {string} type
     * @returns {boolean}
     */
    hasMarkerSupport(t) {
      return ["scatter", "bar", "histogram", "pie"].includes(t);
    },
    /**
     * Whether the given trace type supports fill config.
     * @param {string} type
     * @returns {boolean}
     */
    hasFillSupport(t) {
      return ["scatter"].includes(t);
    },
    // ── Effects ───────────────────────────────────────────────────
    _startEffects() {
      const t = this;
      Alpine.effect(() => {
        JSON.stringify(t.traces), t._scheduleRender();
      }), Alpine.effect(() => {
        JSON.stringify(t.layout), t._scheduleRender();
      });
    },
    // ── Render pipeline ───────────────────────────────────────────
    _scheduleRender() {
      clearTimeout(A), A = setTimeout(() => {
        this.validate(), this._render(), b ? b = !1 : this.markDirty();
      }, 50);
    },
    _render() {
      if (this._plotlyMissing || !u) return;
      const t = c(this.traces).map((e) => this.resolveMeta(e));
      window.Plotly.react(
        u,
        t,
        f(this.layout),
        f(this.config)
      );
    },
    // ── Validation (PRD §11) ──────────────────────────────────────
    /**
     * Run all validations against current traces and dataSources.
     * Mutates this.warnings in place — replaces the entire array so
     * Alpine tracks the change.
     */
    validate() {
      const t = [];
      c(this.traces).forEach((e, i) => {
        var g;
        const r = ((g = e.meta) == null ? void 0 : g.columnNames) ?? {}, s = {};
        for (const [w, p] of Object.entries(r))
          p && this.dataSources[p] && (s[w] = c(this.dataSources[p]).length);
        const n = Object.values(s);
        if (n.length < 2) return;
        const h = Math.min(...n), l = Math.max(...n);
        if (h !== l)
          for (const [w, p] of Object.entries(s))
            p !== h && t.push({
              traceIndex: i,
              field: w,
              code: "LENGTH_MISMATCH",
              message: `Column '${w}' has ${p} values but trace expects ${h}. Showing first ${h}.`
            });
      }), this.warnings.splice(0, this.warnings.length, ...t);
    },
    /**
     * Return the warning (if any) for a specific trace+field combination.
     * Used by the inline warning in the column selector.
     */
    warningFor(t, e) {
      return c(this.warnings).find(
        (i) => i.traceIndex === t && i.field === e
      ) ?? null;
    },
    // ── Meta resolution ───────────────────────────────────────────
    resolveMeta(t) {
      var r;
      const e = f(t), i = ((r = e.meta) == null ? void 0 : r.columnNames) ?? {};
      for (const [s, n] of Object.entries(i))
        n && this.dataSources[n] !== void 0 && (e[s] = c(this.dataSources[n]));
      return e;
    },
    compileTrace(t) {
      const e = this.resolveMeta(t);
      return e.type = P[e.type] ?? e.type, delete e.meta, e;
    },
    // ── Trace operations (PRD §6) ─────────────────────────────────
    /**
     * Append a new empty trace with the given type (defaults to first
     * enabled type). Sets it as active.
     *
     * @param {string} [type]
     */
    addTrace(t) {
      const e = t ?? c(this.traceTypes)[0] ?? "bar";
      this.traces.push({
        type: e,
        name: `Trace ${this.traces.length + 1}`,
        meta: { columnNames: {} }
      }), this.activeTraceIndex = this.traces.length - 1;
    },
    /**
     * Deep-copy the active trace and append it. Sets the copy active.
     *
     * @param {number} [index]
     */
    duplicateTrace(t) {
      const e = t ?? this.activeTraceIndex, i = f(c(this.traces)[e]);
      i.name = (i.name ?? `Trace ${e + 1}`) + " (copy)", this.traces.push(i), this.activeTraceIndex = this.traces.length - 1;
    },
    /**
     * Remove a trace after native confirm(). Adjusts activeTraceIndex
     * so it never goes out of bounds.
     *
     * @param {number} [index]
     */
    removeTrace(t) {
      const e = t ?? this.activeTraceIndex;
      window.confirm(_) && (this.traces.splice(e, 1), this.traces.length === 0 ? this.activeTraceIndex = 0 : this.activeTraceIndex >= this.traces.length && (this.activeTraceIndex = this.traces.length - 1));
    },
    /**
     * Swap trace at `from` with trace at `to`.
     *
     * @param {number} from
     * @param {number} to
     */
    moveTrace(t, e) {
      const i = this.traces.length;
      if (e < 0 || e >= i) return;
      const r = f(c(this.traces[t]));
      this.traces.splice(t, 1), this.traces.splice(e, 0, r), this.activeTraceIndex = e;
    },
    /**
     * Move the active trace one step up (lower index = rendered first).
     */
    moveTraceUp(t) {
      const e = t ?? this.activeTraceIndex;
      this.moveTrace(e, e - 1);
    },
    /**
     * Move the active trace one step down.
     */
    moveTraceDown(t) {
      const e = t ?? this.activeTraceIndex;
      this.moveTrace(e, e + 1);
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
    async setTraceType(t, e) {
      var r;
      if (((r = c(this.traces)[t]) == null ? void 0 : r.type) !== e) {
        if (this.schemaProfiles[e]) {
          this._applyTraceType(t, e);
          return;
        }
        if (m)
          try {
            const s = await m.getSchemaProfile(e);
            if (!s || typeof s != "object" || !s.groups)
              throw new Error(`Invalid profile returned for type "${e}"`);
            this.schemaProfiles[e] = s, this._applyTraceType(t, e);
          } catch (s) {
            console.error(`[plotly-chart-editor] Failed to load profile for "${e}":`, s), this._dispatchToast(e);
          }
      }
    },
    _applyTraceType(t, e) {
      const i = this.schemaProfiles[e], r = f(c(this.traces)[t] ?? {}), s = this._profileFieldKeys(i), n = { type: e };
      for (const l of ["name", "meta", "transforms"])
        r[l] !== void 0 && (n[l] = r[l]);
      for (const l of Object.keys(r))
        ["type", "name", "meta"].includes(l) || s.has(l) && (n[l] = r[l]);
      const h = C[e] ?? {};
      for (const [l, g] of Object.entries(h))
        n[l] = g;
      this.traces[t] = n;
    },
    _profileFieldKeys(t) {
      const e = /* @__PURE__ */ new Set();
      for (const i of Object.values((t == null ? void 0 : t.groups) ?? {}))
        for (const r of (i == null ? void 0 : i.fields) ?? [])
          e.add(r.key.split(".")[0]);
      return e;
    },
    _dispatchToast(t) {
      window.dispatchEvent(new CustomEvent("plotly-editor:toast", {
        detail: {
          key: "errors.profile_load_failed",
          message: `Failed to load profile for ${t}. Please try again.`,
          type: t
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
    addTransform(t) {
      const e = c(this.traces)[this.activeTraceIndex];
      if (!e) return;
      Array.isArray(e.transforms) || (e.transforms = []);
      const i = {
        filter: { type: "filter", target: "y", operation: ">", value: 0 },
        sort: { type: "sort", target: "y", order: "ascending" }
      };
      e.transforms.push(i[t] ?? { type: t }), this.traces[this.activeTraceIndex] = e;
    },
    /**
     * Remove a transform from the active trace by index.
     * Deletes the transforms key if the array becomes empty.
     *
     * @param {number} idx
     */
    removeTransform(t) {
      const e = c(this.traces)[this.activeTraceIndex];
      !e || !Array.isArray(e.transforms) || (e.transforms.splice(t, 1), e.transforms.length === 0 && delete e.transforms, this.traces[this.activeTraceIndex] = e);
    },
    // ── Export (PRD §10) ──────────────────────────────────────────
    /**
     * Download the full chart config as chart.json.
     * meta is stripped — the file is ready for direct use with Plotly.newPlot().
     */
    exportJSON() {
      const t = c(this.traces).map((i) => this.compileTrace(i)), e = JSON.stringify(
        { data: t, layout: f(this.layout), config: f(this.config) },
        null,
        2
      );
      this._download("chart.json", "application/json", e);
    },
    /**
     * Export the current chart canvas as an image.
     *
     * @param {'png'|'jpeg'|'svg'|'webp'} format
     */
    async exportImage(t = "png") {
      if (!(this._plotlyMissing || !u))
        try {
          const e = await window.Plotly.toImage(u, {
            format: t,
            width: u.offsetWidth || 1200,
            height: u.offsetHeight || 600
          });
          this._download(`chart.${t}`, `image/${t}`, e, !0);
        } catch (e) {
          console.error("[plotly-chart-editor] exportImage failed:", e);
        }
    },
    /**
     * Copy the chart config JSON to the clipboard.
     * Shows a transient "Copied ✓" indicator via copiedAt.
     */
    async copyConfig() {
      const t = c(this.traces).map((i) => this.compileTrace(i)), e = JSON.stringify(
        { data: t, layout: f(this.layout), config: f(this.config) },
        null,
        2
      );
      try {
        await navigator.clipboard.writeText(e), this.copiedAt = Date.now(), clearTimeout(I), I = setTimeout(() => {
          this.copiedAt = null;
        }, 2e3);
      } catch (i) {
        console.error("[plotly-chart-editor] copyConfig failed:", i);
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
    _download(t, e, i, r = !1) {
      const s = document.createElement("a");
      s.href = r ? i : `data:${e};charset=utf-8,${encodeURIComponent(i)}`, s.download = t, s.style.display = "none", document.body.appendChild(s), s.click(), document.body.removeChild(s);
    },
    // ── Sync state ────────────────────────────────────────────────
    markDirty() {
      this.dirty = !0, this._maybeAutoSync();
    },
    _maybeAutoSync() {
      (this.syncMode === "auto" || this.syncMode === "hybrid") && (clearTimeout(k), k = setTimeout(() => this.syncToBackend(), 500));
    },
    syncToBackend() {
      if (this.syncing || !m) return;
      this.syncing = !0;
      const t = {
        traces: c(this.traces).map((e) => this.compileTrace(e)),
        layout: f(this.layout)
      };
      m.syncFromAlpine(JSON.stringify(t)).then(() => {
        this.savedAt = Date.now(), clearTimeout(S), S = setTimeout(() => {
          this.savedAt = null;
        }, 2e3);
      }).finally(() => {
        this.syncing = !1, this.dirty = !1, this.lastSyncAt = Date.now();
      });
    },
    setWire(t) {
      m = t;
    }
  });
}
function z(o, y, d, a, x) {
  M(o, y, d);
  const t = Alpine.store("chartBuilder");
  if (u = a, m = x, typeof window.Plotly > "u") {
    t._plotlyMissing = !0, a && (a.textContent = y);
    return;
  }
  T && t._render(), v && v.disconnect();
  const e = a == null ? void 0 : a.closest(".chart-builder");
  e && typeof ResizeObserver < "u" && (v = new ResizeObserver((i) => {
    var n, h;
    const s = (((h = (n = i[0]) == null ? void 0 : n.contentRect) == null ? void 0 : h.width) ?? window.innerWidth) < 1024;
    t._tooSmall = s, s && u && typeof window.Plotly < "u" && (window.Plotly.purge(u), T = !1);
  }), v.observe(e)), a && typeof ResizeObserver < "u" && new ResizeObserver(() => {
    if (t._plotlyMissing || typeof window.Plotly > "u" || t._tooSmall) return;
    const r = a.getBoundingClientRect();
    r.width === 0 || r.height === 0 || (T ? window.Plotly.Plots.resize(a) : (b = !0, t._startEffects(), T = !0, t._render()));
  }).observe(a);
}
typeof window < "u" && (window.initChartBuilder = M, window.bootChartBuilder = z);
export {
  z as bootChartBuilder,
  M as initChartBuilder
};
