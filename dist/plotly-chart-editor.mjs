function r(e) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(e) : e;
}
function o(e) {
  return structuredClone(r(e));
}
let l = null, a = null, f = null, h = null, u = !1;
function y(e, s) {
  return !!Alpine.store("chartBuilder") || Alpine.store("chartBuilder", {
    // ── Loaded from Livewire on mount ─────────────────────────────
    dataSources: e.dataSources ?? {},
    schemaProfiles: e.schemaProfiles ?? {},
    // ── Managed by Alpine ─────────────────────────────────────────
    traces: e.traces ?? [],
    layout: e.layout ?? {},
    config: e.config ?? { responsive: !0 },
    // ── Sync / UI config ──────────────────────────────────────────
    syncMode: e.syncMode ?? "manual",
    traceTypes: e.traceTypes ?? ["bar"],
    showExport: e.showExport ?? !0,
    // ── Derived ───────────────────────────────────────────────────
    activeTraceIndex: 0,
    // ── Validation & sync state ───────────────────────────────────
    warnings: [],
    dirty: !1,
    syncing: !1,
    lastSyncAt: null,
    // ── Internal flags ────────────────────────────────────────────
    _plotlyMissingMessage: s,
    _plotlyMissing: !1,
    /**
     * Wire up effects and perform the initial render.
     * Called by boot() below; separated so re-boot after a Livewire
     * morph can call _render() without re-registering effects.
     */
    _startEffects() {
      Alpine.effect(() => {
        JSON.stringify(r(this.traces)), this._scheduleRender();
      }), Alpine.effect(() => {
        JSON.stringify(r(this.layout)), this._scheduleRender();
      });
    },
    // ── Render pipeline ───────────────────────────────────────────
    _scheduleRender() {
      clearTimeout(f), f = setTimeout(() => {
        this._render(), u && this.markDirty();
      }, 50);
    },
    _render() {
      if (this._plotlyMissing || !a) return;
      const i = r(this.traces).map((t) => this.resolveMeta(t));
      window.Plotly.react(
        a,
        i,
        o(this.layout),
        o(this.config)
      );
    },
    // ── Meta resolution ───────────────────────────────────────────
    resolveMeta(i) {
      var d;
      const t = o(i), m = ((d = t.meta) == null ? void 0 : d.columnNames) ?? {};
      for (const [p, c] of Object.entries(m))
        c && this.dataSources[c] !== void 0 && (t[p] = r(this.dataSources[c]));
      return t;
    },
    compileTrace(i) {
      const t = this.resolveMeta(i);
      return delete t.meta, t;
    },
    // ── Sync state ────────────────────────────────────────────────
    markDirty() {
      this.dirty = !0, this._maybeAutoSync();
    },
    _maybeAutoSync() {
      (this.syncMode === "auto" || this.syncMode === "hybrid") && (clearTimeout(h), h = setTimeout(() => this.syncToBackend(), 500));
    },
    syncToBackend() {
      if (this.syncing || !l) return;
      this.syncing = !0;
      const i = {
        traces: r(this.traces).map((t) => this.compileTrace(t)),
        layout: o(this.layout)
      };
      l.syncFromAlpine(JSON.stringify(i)).finally(() => {
        this.syncing = !1, this.dirty = !1, this.lastSyncAt = Date.now();
      });
    },
    setWire(i) {
      l = i;
    }
  }), Alpine.store("chartBuilder");
}
function _(e, s, n, i) {
  const t = y(e, s);
  if (a = n, l = i, typeof window.Plotly > "u") {
    t._plotlyMissing = !0, n && (n.textContent = s);
    return;
  }
  u || (t._startEffects(), u = !0), t._render();
}
typeof window < "u" && (window.initChartBuilder = y, window.bootChartBuilder = _);
export {
  _ as bootChartBuilder,
  y as initChartBuilder
};
