function s(e) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(e) : e;
}
function n(e) {
  return structuredClone(s(e));
}
function f(e, h) {
  let r = null, o = null, c = null, a = null;
  Alpine.store("chartBuilder", {
    // ── Loaded from Livewire on mount ─────────────────────────────────
    dataSources: e.dataSources ?? {},
    schemaProfiles: e.schemaProfiles ?? {},
    // ── Managed by Alpine ─────────────────────────────────────────────
    traces: e.traces ?? [],
    layout: e.layout ?? {},
    config: e.config ?? { responsive: !0 },
    // ── Sync / UI config ──────────────────────────────────────────────
    syncMode: e.syncMode ?? "manual",
    traceTypes: e.traceTypes ?? ["bar"],
    showExport: e.showExport ?? !0,
    // ── Derived ───────────────────────────────────────────────────────
    activeTraceIndex: 0,
    // ── Validation & sync state ───────────────────────────────────────
    warnings: [],
    dirty: !1,
    syncing: !1,
    lastSyncAt: null,
    // ── Internal flags (reactive — safe to make reactive) ─────────────
    _plotlyMissingMessage: h,
    _plotlyMissing: !1,
    /**
     * Call once after the store is registered, passing the canvas DOM element.
     *
     * @param {HTMLElement} canvasEl
     */
    boot(t) {
      if (o = t, typeof window.Plotly > "u") {
        this._plotlyMissing = !0, t && (t.textContent = this._plotlyMissingMessage);
        return;
      }
      Alpine.effect(() => {
        JSON.stringify(s(this.traces)), this._scheduleRender();
      }), Alpine.effect(() => {
        JSON.stringify(s(this.layout)), this._scheduleRender();
      }), this._render();
    },
    // ── Render pipeline ───────────────────────────────────────────────
    _scheduleRender() {
      clearTimeout(c), c = setTimeout(() => {
        this._render(), this.markDirty();
      }, 50);
    },
    _render() {
      if (this._plotlyMissing || !o) return;
      const t = s(this.traces).map((i) => this.resolveMeta(i));
      window.Plotly.react(
        o,
        t,
        n(this.layout),
        n(this.config)
      );
    },
    // ── Meta resolution ───────────────────────────────────────────────
    /**
     * Resolve meta.columnNames → actual data arrays from dataSources.
     * Returns a new plain object — never mutates the original trace.
     *
     * @param {object} trace
     * @returns {object}
     */
    resolveMeta(t) {
      var u;
      const i = n(t), y = ((u = i.meta) == null ? void 0 : u.columnNames) ?? {};
      for (const [d, l] of Object.entries(y))
        l && this.dataSources[l] !== void 0 && (i[d] = s(this.dataSources[l]));
      return i;
    },
    /**
     * Strip meta from a trace for export / sync payloads (PRD §4).
     *
     * @param {object} trace
     * @returns {object}
     */
    compileTrace(t) {
      const i = this.resolveMeta(t);
      return delete i.meta, i;
    },
    // ── Sync state ────────────────────────────────────────────────────
    markDirty() {
      this.dirty = !0, this._maybeAutoSync();
    },
    _maybeAutoSync() {
      (this.syncMode === "auto" || this.syncMode === "hybrid") && (clearTimeout(a), a = setTimeout(() => this.syncToBackend(), 500));
    },
    /**
     * Sync current state back to Livewire (PRD §10).
     * All sync calls route through this single method.
     */
    syncToBackend() {
      if (this.syncing || !r) return;
      this.syncing = !0;
      const t = {
        traces: s(this.traces).map((i) => this.compileTrace(i)),
        layout: n(this.layout)
      };
      r.syncFromAlpine(JSON.stringify(t)).finally(() => {
        this.syncing = !1, this.dirty = !1, this.lastSyncAt = Date.now();
      });
    },
    /**
     * Register the $wire reference. Called from Blade x-init.
     * Stored in the closure (not in the store) so Alpine never proxies it.
     *
     * @param {object} wire  — the Livewire $wire proxy
     */
    setWire(t) {
      r = t;
    }
  });
}
typeof window < "u" && (window.initChartBuilder = f);
export {
  f as initChartBuilder
};
