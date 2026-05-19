function l(n) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(n) : n;
}
function u(n) {
  return structuredClone(l(n));
}
let y = null, p = null, x = null, A = null, m = !1, _ = !1, v = "Delete this trace? This cannot be undone.", S = null, g = null;
function k(n, d) {
  for (const [h, a] of Object.entries(d))
    n[h] === void 0 || n[h] === null ? n[h] = structuredClone(a) : typeof a == "object" && !Array.isArray(a) && typeof n[h] == "object" && !Array.isArray(n[h]) && k(n[h], a);
  return n;
}
const O = {
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
  showlegend: !0,
  legend: { orientation: "v" }
};
function I(n, d, h) {
  v = h ?? v;
  const a = k(n.layout ?? {}, O);
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
    traceTypes: n.traceTypes ?? ["bar"],
    showExport: n.showExport ?? !0,
    // ── Derived ───────────────────────────────────────────────────
    activeTraceIndex: 0,
    // ── Validation & sync state ───────────────────────────────────
    warnings: [],
    dirty: !1,
    syncing: !1,
    lastSyncAt: null,
    savedAt: null,
    // timestamp of last successful sync (drives "Saved ✓")
    // ── Internal flags ────────────────────────────────────────────
    _plotlyMissingMessage: d,
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
      for (let o = 0; o < s.length - 1; o++)
        (r[s[o]] == null || typeof r[s[o]] != "object") && (r[s[o]] = {}), r = r[s[o]];
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
      clearTimeout(x), x = setTimeout(() => {
        this.validate(), this._render(), _ ? _ = !1 : this.markDirty();
      }, 50);
    },
    _render() {
      if (this._plotlyMissing || !p) return;
      const e = l(this.traces).map((t) => this.resolveMeta(t));
      window.Plotly.react(
        p,
        e,
        u(this.layout),
        u(this.config)
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
      l(this.traces).forEach((t, i) => {
        var b;
        const s = ((b = t.meta) == null ? void 0 : b.columnNames) ?? {}, r = {};
        for (const [T, f] of Object.entries(s))
          f && this.dataSources[f] && (r[T] = l(this.dataSources[f]).length);
        const o = Object.values(r);
        if (o.length < 2) return;
        const c = Math.min(...o), M = Math.max(...o);
        if (c !== M)
          for (const [T, f] of Object.entries(r))
            f !== c && e.push({
              traceIndex: i,
              field: T,
              code: "LENGTH_MISMATCH",
              message: `Column '${T}' has ${f} values but trace expects ${c}. Showing first ${c}.`
            });
      }), this.warnings.splice(0, this.warnings.length, ...e);
    },
    /**
     * Return the warning (if any) for a specific trace+field combination.
     * Used by the inline warning in the column selector.
     */
    warningFor(e, t) {
      return l(this.warnings).find(
        (i) => i.traceIndex === e && i.field === t
      ) ?? null;
    },
    // ── Meta resolution ───────────────────────────────────────────
    resolveMeta(e) {
      var s;
      const t = u(e), i = ((s = t.meta) == null ? void 0 : s.columnNames) ?? {};
      for (const [r, o] of Object.entries(i))
        o && this.dataSources[o] !== void 0 && (t[r] = l(this.dataSources[o]));
      return t;
    },
    compileTrace(e) {
      const t = this.resolveMeta(e);
      return delete t.meta, t;
    },
    // ── Trace operations (PRD §6) ─────────────────────────────────
    /**
     * Append a new empty trace with the given type (defaults to first
     * enabled type). Sets it as active.
     *
     * @param {string} [type]
     */
    addTrace(e) {
      const t = e ?? l(this.traceTypes)[0] ?? "bar";
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
      const t = e ?? this.activeTraceIndex, i = u(l(this.traces)[t]);
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
      const s = u(l(this.traces[e]));
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
      if (((s = l(this.traces)[e]) == null ? void 0 : s.type) !== t) {
        if (this.schemaProfiles[t]) {
          this._applyTraceType(e, t);
          return;
        }
        if (y)
          try {
            const r = await y.getSchemaProfile(t);
            if (!r || typeof r != "object" || !r.groups)
              throw new Error(`Invalid profile returned for type "${t}"`);
            this.schemaProfiles[t] = r, this._applyTraceType(e, t);
          } catch (r) {
            console.error(`[plotly-chart-editor] Failed to load profile for "${t}":`, r), this._dispatchToast(t);
          }
      }
    },
    _applyTraceType(e, t) {
      const i = this.schemaProfiles[t], s = u(l(this.traces)[e] ?? {}), r = this._profileFieldKeys(i), o = { type: t };
      for (const c of ["name", "meta"])
        s[c] !== void 0 && (o[c] = s[c]);
      for (const c of Object.keys(s))
        ["type", "name", "meta"].includes(c) || r.has(c) && (o[c] = s[c]);
      this.traces[e] = o;
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
    // ── Sync state ────────────────────────────────────────────────
    markDirty() {
      this.dirty = !0, this._maybeAutoSync();
    },
    _maybeAutoSync() {
      (this.syncMode === "auto" || this.syncMode === "hybrid") && (clearTimeout(A), A = setTimeout(() => this.syncToBackend(), 500));
    },
    syncToBackend() {
      if (this.syncing || !y) return;
      this.syncing = !0;
      const e = {
        traces: l(this.traces).map((t) => this.compileTrace(t)),
        layout: u(this.layout)
      };
      y.syncFromAlpine(JSON.stringify(e)).then(() => {
        this.savedAt = Date.now(), clearTimeout(S), S = setTimeout(() => {
          this.savedAt = null;
        }, 2e3);
      }).finally(() => {
        this.syncing = !1, this.dirty = !1, this.lastSyncAt = Date.now();
      });
    },
    setWire(e) {
      y = e;
    }
  });
}
function P(n, d, h, a, w) {
  I(n, d, h);
  const e = Alpine.store("chartBuilder");
  if (p = a, y = w, typeof window.Plotly > "u") {
    e._plotlyMissing = !0, a && (a.textContent = d);
    return;
  }
  m || (_ = !0, e._startEffects(), m = !0), e._render(), g && g.disconnect();
  const t = a == null ? void 0 : a.closest(".chart-builder");
  t && typeof ResizeObserver < "u" && (g = new ResizeObserver((i) => {
    var o, c;
    const r = (((c = (o = i[0]) == null ? void 0 : o.contentRect) == null ? void 0 : c.width) ?? window.innerWidth) < 1024;
    e._tooSmall = r, r && p && typeof window.Plotly < "u" ? (window.Plotly.purge(p), m = !1) : !r && !m && p && (_ = !0, e._startEffects(), m = !0, e._render());
  }), g.observe(t));
}
typeof window < "u" && (window.initChartBuilder = I, window.bootChartBuilder = P);
export {
  P as bootChartBuilder,
  I as initChartBuilder
};
