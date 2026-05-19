function a(r) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(r) : r;
}
function h(r) {
  return structuredClone(a(r));
}
let d = null, p = null, _ = null, g = null, v = !1, m = !1, y = "Delete this trace? This cannot be undone.";
function w(r, u) {
  for (const [c, n] of Object.entries(u))
    r[c] === void 0 || r[c] === null ? r[c] = structuredClone(n) : typeof n == "object" && !Array.isArray(n) && typeof r[c] == "object" && !Array.isArray(r[c]) && w(r[c], n);
  return r;
}
const x = {
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
  legend: { orientation: "v" },
  plot_bgcolor: "#ffffff",
  paper_bgcolor: "#ffffff"
};
function A(r, u, c) {
  y = c ?? y;
  const n = w(r.layout ?? {}, x);
  !!Alpine.store("chartBuilder") || Alpine.store("chartBuilder", {
    // ── Loaded from Livewire on mount ─────────────────────────────
    dataSources: r.dataSources ?? {},
    schemaProfiles: r.schemaProfiles ?? {},
    // ── Managed by Alpine ─────────────────────────────────────────
    traces: r.traces ?? [],
    layout: n,
    config: r.config ?? { responsive: !0 },
    // ── Sync / UI config ──────────────────────────────────────────
    syncMode: r.syncMode ?? "manual",
    traceTypes: r.traceTypes ?? ["bar"],
    showExport: r.showExport ?? !0,
    // ── Derived ───────────────────────────────────────────────────
    activeTraceIndex: 0,
    // ── Validation & sync state ───────────────────────────────────
    warnings: [],
    dirty: !1,
    syncing: !1,
    lastSyncAt: null,
    // ── Internal flags ────────────────────────────────────────────
    _plotlyMissingMessage: u,
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
      clearTimeout(_), _ = setTimeout(() => {
        this._render(), m ? m = !1 : this.markDirty();
      }, 50);
    },
    _render() {
      if (this._plotlyMissing || !p) return;
      const e = a(this.traces).map((t) => this.resolveMeta(t));
      window.Plotly.react(
        p,
        e,
        h(this.layout),
        h(this.config)
      );
    },
    // ── Meta resolution ───────────────────────────────────────────
    resolveMeta(e) {
      var i;
      const t = h(e), s = ((i = t.meta) == null ? void 0 : i.columnNames) ?? {};
      for (const [o, f] of Object.entries(s))
        f && this.dataSources[f] !== void 0 && (t[o] = a(this.dataSources[f]));
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
      const t = e ?? a(this.traceTypes)[0] ?? "bar";
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
      const t = e ?? this.activeTraceIndex, s = h(a(this.traces)[t]);
      s.name = (s.name ?? `Trace ${t + 1}`) + " (copy)", this.traces.push(s), this.activeTraceIndex = this.traces.length - 1;
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
      const s = this.traces.length;
      if (t < 0 || t >= s) return;
      const i = h(a(this.traces[e]));
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
      if (((i = a(this.traces)[e]) == null ? void 0 : i.type) !== t) {
        if (this.schemaProfiles[t]) {
          this._applyTraceType(e, t);
          return;
        }
        if (d)
          try {
            const o = await d.getSchemaProfile(t);
            if (!o || typeof o != "object" || !o.groups)
              throw new Error(`Invalid profile returned for type "${t}"`);
            this.schemaProfiles[t] = o, this._applyTraceType(e, t);
          } catch (o) {
            console.error(`[plotly-chart-editor] Failed to load profile for "${t}":`, o), this._dispatchToast(t);
          }
      }
    },
    _applyTraceType(e, t) {
      const s = this.schemaProfiles[t], i = h(a(this.traces)[e] ?? {}), o = this._profileFieldKeys(s), f = { type: t };
      for (const l of ["name", "meta"])
        i[l] !== void 0 && (f[l] = i[l]);
      for (const l of Object.keys(i))
        ["type", "name", "meta"].includes(l) || o.has(l) && (f[l] = i[l]);
      this.traces[e] = f;
    },
    _profileFieldKeys(e) {
      const t = /* @__PURE__ */ new Set();
      for (const s of Object.values((e == null ? void 0 : e.groups) ?? {}))
        for (const i of (s == null ? void 0 : s.fields) ?? [])
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
    // ── Sync state ────────────────────────────────────────────────
    markDirty() {
      this.dirty = !0, this._maybeAutoSync();
    },
    _maybeAutoSync() {
      (this.syncMode === "auto" || this.syncMode === "hybrid") && (clearTimeout(g), g = setTimeout(() => this.syncToBackend(), 500));
    },
    syncToBackend() {
      if (this.syncing || !d) return;
      this.syncing = !0;
      const e = {
        traces: a(this.traces).map((t) => this.compileTrace(t)),
        layout: h(this.layout)
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
function b(r, u, c, n, T) {
  A(r, u, c);
  const e = Alpine.store("chartBuilder");
  if (p = n, d = T, typeof window.Plotly > "u") {
    e._plotlyMissing = !0, n && (n.textContent = u);
    return;
  }
  v || (m = !0, e._startEffects(), v = !0), e._render();
}
typeof window < "u" && (window.initChartBuilder = A, window.bootChartBuilder = b);
export {
  b as bootChartBuilder,
  A as initChartBuilder
};
