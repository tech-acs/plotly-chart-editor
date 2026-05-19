function l(s) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(s) : s;
}
function u(s) {
  return structuredClone(l(s));
}
let d = null, p = null, g = null, _ = null, v = !1, m = !1, y = "Delete this trace? This cannot be undone.";
function w(s, f) {
  for (const [o, a] of Object.entries(f))
    s[o] === void 0 || s[o] === null ? s[o] = structuredClone(a) : typeof a == "object" && !Array.isArray(a) && typeof s[o] == "object" && !Array.isArray(s[o]) && w(s[o], a);
  return s;
}
const x = {
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
function A(s, f, o) {
  y = o ?? y;
  const a = w(s.layout ?? {}, x);
  !!Alpine.store("chartBuilder") || Alpine.store("chartBuilder", {
    // ── Loaded from Livewire on mount ─────────────────────────────
    dataSources: s.dataSources ?? {},
    schemaProfiles: s.schemaProfiles ?? {},
    // ── Managed by Alpine ─────────────────────────────────────────
    traces: s.traces ?? [],
    layout: a,
    config: s.config ?? { responsive: !0 },
    // ── Sync / UI config ──────────────────────────────────────────
    syncMode: s.syncMode ?? "manual",
    traceTypes: s.traceTypes ?? ["bar"],
    showExport: s.showExport ?? !0,
    // ── Derived ───────────────────────────────────────────────────
    activeTraceIndex: 0,
    // ── Validation & sync state ───────────────────────────────────
    warnings: [],
    dirty: !1,
    syncing: !1,
    lastSyncAt: null,
    // ── Internal flags ────────────────────────────────────────────
    _plotlyMissingMessage: f,
    _plotlyMissing: !1,
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
      return t.split(".").reduce((i, r) => i == null ? void 0 : i[r], e);
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
      const r = t.split(".");
      let n = e;
      for (let c = 0; c < r.length - 1; c++)
        (n[r[c]] == null || typeof n[r[c]] != "object") && (n[r[c]] = {}), n = n[r[c]];
      n[r[r.length - 1]] = i;
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
      clearTimeout(g), g = setTimeout(() => {
        this._render(), m ? m = !1 : this.markDirty();
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
    // ── Meta resolution ───────────────────────────────────────────
    resolveMeta(e) {
      var r;
      const t = u(e), i = ((r = t.meta) == null ? void 0 : r.columnNames) ?? {};
      for (const [n, c] of Object.entries(i))
        c && this.dataSources[c] !== void 0 && (t[n] = l(this.dataSources[c]));
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
      window.confirm(y) && (this.traces.splice(t, 1), this.traces.length === 0 ? this.activeTraceIndex = 0 : this.activeTraceIndex >= this.traces.length && (this.activeTraceIndex = this.traces.length - 1));
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
      const r = u(l(this.traces[e]));
      this.traces.splice(e, 1), this.traces.splice(t, 0, r), this.activeTraceIndex = t;
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
      var r;
      if (((r = l(this.traces)[e]) == null ? void 0 : r.type) !== t) {
        if (this.schemaProfiles[t]) {
          this._applyTraceType(e, t);
          return;
        }
        if (d)
          try {
            const n = await d.getSchemaProfile(t);
            if (!n || typeof n != "object" || !n.groups)
              throw new Error(`Invalid profile returned for type "${t}"`);
            this.schemaProfiles[t] = n, this._applyTraceType(e, t);
          } catch (n) {
            console.error(`[plotly-chart-editor] Failed to load profile for "${t}":`, n), this._dispatchToast(t);
          }
      }
    },
    _applyTraceType(e, t) {
      const i = this.schemaProfiles[t], r = u(l(this.traces)[e] ?? {}), n = this._profileFieldKeys(i), c = { type: t };
      for (const h of ["name", "meta"])
        r[h] !== void 0 && (c[h] = r[h]);
      for (const h of Object.keys(r))
        ["type", "name", "meta"].includes(h) || n.has(h) && (c[h] = r[h]);
      this.traces[e] = c;
    },
    _profileFieldKeys(e) {
      const t = /* @__PURE__ */ new Set();
      for (const i of Object.values((e == null ? void 0 : e.groups) ?? {}))
        for (const r of (i == null ? void 0 : i.fields) ?? [])
          t.add(r.key.split(".")[0]);
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
      (this.syncMode === "auto" || this.syncMode === "hybrid") && (clearTimeout(_), _ = setTimeout(() => this.syncToBackend(), 500));
    },
    syncToBackend() {
      if (this.syncing || !d) return;
      this.syncing = !0;
      const e = {
        traces: l(this.traces).map((t) => this.compileTrace(t)),
        layout: u(this.layout)
      };
      d.syncFromAlpine(JSON.stringify(e)).finally(() => {
        this.syncing = !1, this.dirty = !1, this.lastSyncAt = Date.now();
      });
    },
    setWire(e) {
      d = e;
    }
  });
}
function b(s, f, o, a, T) {
  A(s, f, o);
  const e = Alpine.store("chartBuilder");
  if (p = a, d = T, typeof window.Plotly > "u") {
    e._plotlyMissing = !0, a && (a.textContent = f);
    return;
  }
  v || (m = !0, e._startEffects(), v = !0), e._render();
}
typeof window < "u" && (window.initChartBuilder = A, window.bootChartBuilder = b);
export {
  b as bootChartBuilder,
  A as initChartBuilder
};
