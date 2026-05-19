function c(o) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(o) : o;
}
function d(o) {
  return structuredClone(c(o));
}
let m = null;
const C = {
  area: "scatter"
}, P = {
  area: { mode: "none", fill: "tozeroy", fillcolor: "#1f77b4" }
};
let u = null, A = null, S = null, w = !1, b = !1, v = "Delete this trace? This cannot be undone.", O = null, I = null, _ = null;
function k(o, y) {
  for (const [h, a] of Object.entries(y))
    o[h] === void 0 || o[h] === null ? o[h] = structuredClone(a) : typeof a == "object" && !Array.isArray(a) && typeof o[h] == "object" && !Array.isArray(o[h]) && k(o[h], a);
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
    tickfont: { family: "Arial", size: 12, color: "#000000" }
  },
  yaxis: {
    title: { text: "" },
    showgrid: !0,
    zeroline: !0,
    tickformat: ""
  },
  margin: { t: 50, b: 50, l: 60, r: 30 },
  showlegend: !1,
  legend: { orientation: "v" }
};
function M(o, y, h) {
  v = h ?? v;
  const a = k(o.layout ?? {}, N);
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
      return t.split(".").reduce((i, s) => i == null ? void 0 : i[s], e);
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
      const s = t.split(".");
      let r = e;
      for (let n = 0; n < s.length - 1; n++)
        (r[s[n]] == null || typeof r[s[n]] != "object") && (r[s[n]] = {}), r = r[s[n]];
      r[s[s.length - 1]] = i;
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
        this.validate(), this._render(), b ? b = !1 : this.markDirty();
      }, 50);
    },
    _render() {
      if (this._plotlyMissing || !u) return;
      const e = c(this.traces).map((t) => this.resolveMeta(t));
      window.Plotly.react(
        u,
        e,
        d(this.layout),
        d(this.config)
      );
    },
    // ── Validation (PRD §11) ──────────────────────────────────────
    /**
     * Run all validations against current traces and dataSources.
     * Mutates this.warnings in place — replaces the entire array so
     * Alpine tracks the change.
     */
    validate() {
      const e = [];
      c(this.traces).forEach((t, i) => {
        var g;
        const s = ((g = t.meta) == null ? void 0 : g.columnNames) ?? {}, r = {};
        for (const [T, p] of Object.entries(s))
          p && this.dataSources[p] && (r[T] = c(this.dataSources[p]).length);
        const n = Object.values(r);
        if (n.length < 2) return;
        const f = Math.min(...n), l = Math.max(...n);
        if (f !== l)
          for (const [T, p] of Object.entries(r))
            p !== f && e.push({
              traceIndex: i,
              field: T,
              code: "LENGTH_MISMATCH",
              message: `Column '${T}' has ${p} values but trace expects ${f}. Showing first ${f}.`
            });
      }), this.warnings.splice(0, this.warnings.length, ...e);
    },
    /**
     * Return the warning (if any) for a specific trace+field combination.
     * Used by the inline warning in the column selector.
     */
    warningFor(e, t) {
      return c(this.warnings).find(
        (i) => i.traceIndex === e && i.field === t
      ) ?? null;
    },
    // ── Meta resolution ───────────────────────────────────────────
    resolveMeta(e) {
      var s;
      const t = d(e), i = ((s = t.meta) == null ? void 0 : s.columnNames) ?? {};
      for (const [r, n] of Object.entries(i))
        n && this.dataSources[n] !== void 0 && (t[r] = c(this.dataSources[n]));
      return t;
    },
    compileTrace(e) {
      const t = this.resolveMeta(e);
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
      const t = e ?? c(this.traceTypes)[0] ?? "bar";
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
      const t = e ?? this.activeTraceIndex, i = d(c(this.traces)[t]);
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
      window.confirm(v) && (this.traces.splice(t, 1), this.traces.length === 0 ? this.activeTraceIndex = 0 : this.activeTraceIndex >= this.traces.length && (this.activeTraceIndex = this.traces.length - 1));
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
      const s = d(c(this.traces[e]));
      this.traces.splice(e, 1), this.traces.splice(t, 0, s), this.activeTraceIndex = t;
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
      var s;
      if (((s = c(this.traces)[e]) == null ? void 0 : s.type) !== t) {
        if (this.schemaProfiles[t]) {
          this._applyTraceType(e, t);
          return;
        }
        if (m)
          try {
            const r = await m.getSchemaProfile(t);
            if (!r || typeof r != "object" || !r.groups)
              throw new Error(`Invalid profile returned for type "${t}"`);
            this.schemaProfiles[t] = r, this._applyTraceType(e, t);
          } catch (r) {
            console.error(`[plotly-chart-editor] Failed to load profile for "${t}":`, r), this._dispatchToast(t);
          }
      }
    },
    _applyTraceType(e, t) {
      const i = this.schemaProfiles[t], s = d(c(this.traces)[e] ?? {}), r = this._profileFieldKeys(i), n = { type: t };
      for (const l of ["name", "meta"])
        s[l] !== void 0 && (n[l] = s[l]);
      for (const l of Object.keys(s))
        ["type", "name", "meta"].includes(l) || r.has(l) && (n[l] = s[l]);
      const f = P[t] ?? {};
      for (const [l, g] of Object.entries(f))
        n[l] = g;
      this.traces[e] = n;
    },
    _profileFieldKeys(e) {
      const t = /* @__PURE__ */ new Set();
      for (const i of Object.values((e == null ? void 0 : e.groups) ?? {}))
        for (const s of (i == null ? void 0 : i.fields) ?? [])
          t.add(s.key.split(".")[0]);
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
    /**
     * Download the full chart config as chart.json.
     * meta is stripped — the file is ready for direct use with Plotly.newPlot().
     */
    exportJSON() {
      const e = c(this.traces).map((i) => this.compileTrace(i)), t = JSON.stringify(
        { data: e, layout: d(this.layout), config: d(this.config) },
        null,
        2
      );
      this._download("chart.json", "application/json", t);
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
      const e = c(this.traces).map((i) => this.compileTrace(i)), t = JSON.stringify(
        { data: e, layout: d(this.layout), config: d(this.config) },
        null,
        2
      );
      try {
        await navigator.clipboard.writeText(t), this.copiedAt = Date.now(), clearTimeout(I), I = setTimeout(() => {
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
    _download(e, t, i, s = !1) {
      const r = document.createElement("a");
      r.href = s ? i : `data:${t};charset=utf-8,${encodeURIComponent(i)}`, r.download = e, r.style.display = "none", document.body.appendChild(r), r.click(), document.body.removeChild(r);
    },
    // ── Sync state ────────────────────────────────────────────────
    markDirty() {
      this.dirty = !0, this._maybeAutoSync();
    },
    _maybeAutoSync() {
      (this.syncMode === "auto" || this.syncMode === "hybrid") && (clearTimeout(S), S = setTimeout(() => this.syncToBackend(), 500));
    },
    syncToBackend() {
      if (this.syncing || !m) return;
      this.syncing = !0;
      const e = {
        traces: c(this.traces).map((t) => this.compileTrace(t)),
        layout: d(this.layout)
      };
      m.syncFromAlpine(JSON.stringify(e)).then(() => {
        this.savedAt = Date.now(), clearTimeout(O), O = setTimeout(() => {
          this.savedAt = null;
        }, 2e3);
      }).finally(() => {
        this.syncing = !1, this.dirty = !1, this.lastSyncAt = Date.now();
      });
    },
    setWire(e) {
      m = e;
    }
  });
}
function j(o, y, h, a, x) {
  M(o, y, h);
  const e = Alpine.store("chartBuilder");
  if (u = a, m = x, typeof window.Plotly > "u") {
    e._plotlyMissing = !0, a && (a.textContent = y);
    return;
  }
  w && e._render(), _ && _.disconnect();
  const t = a == null ? void 0 : a.closest(".chart-builder");
  t && typeof ResizeObserver < "u" && (_ = new ResizeObserver((i) => {
    var n, f;
    const r = (((f = (n = i[0]) == null ? void 0 : n.contentRect) == null ? void 0 : f.width) ?? window.innerWidth) < 1024;
    e._tooSmall = r, r && u && typeof window.Plotly < "u" && (window.Plotly.purge(u), w = !1);
  }), _.observe(t)), a && typeof ResizeObserver < "u" && new ResizeObserver(() => {
    if (e._plotlyMissing || typeof window.Plotly > "u" || e._tooSmall) return;
    const s = a.getBoundingClientRect();
    s.width === 0 || s.height === 0 || (w ? window.Plotly.Plots.resize(a) : (b = !0, e._startEffects(), w = !0, e._render()));
  }).observe(a);
}
typeof window < "u" && (window.initChartBuilder = M, window.bootChartBuilder = j);
export {
  j as bootChartBuilder,
  M as initChartBuilder
};
