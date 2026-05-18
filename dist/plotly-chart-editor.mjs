function s(e) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(e) : e;
}
function n(e) {
  return structuredClone(s(e));
}
function u(e, c) {
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
    // ── Internal ──────────────────────────────────────────────────────
    _renderTimer: null,
    _autoSyncTimer: null,
    _canvasEl: null,
    _plotlyMissingMessage: c,
    _plotlyMissing: !1,
    _wire: void 0,
    /**
     * Call once after the store is registered, passing the canvas DOM element.
     * Wires up the effect-based debounce pipeline and performs the initial render.
     *
     * @param {HTMLElement} canvasEl
     */
    boot(t) {
      if (this._canvasEl = t, typeof window.Plotly > "u") {
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
    /**
     * Schedule a render with a 50ms debounce (PRD §2 rule 3).
     */
    _scheduleRender() {
      clearTimeout(this._renderTimer), this._renderTimer = setTimeout(() => {
        this._render(), this.markDirty();
      }, 50);
    },
    /**
     * Resolve all trace meta and call Plotly.react().
     */
    _render() {
      if (this._plotlyMissing || !this._canvasEl) return;
      const t = s(this.traces).map((i) => this.resolveMeta(i));
      window.Plotly.react(
        this._canvasEl,
        t,
        n(this.layout),
        n(this.config)
      );
    },
    // ── Meta resolution ───────────────────────────────────────────────
    /**
     * Given an internal trace (with meta.columnNames), return a NEW plain
     * object with actual data arrays attached — does NOT mutate the original.
     *
     * PRD §4 compilation pipeline.
     *
     * @param {object} trace
     * @returns {object}
     */
    resolveMeta(t) {
      var o;
      const i = n(t), l = ((o = i.meta) == null ? void 0 : o.columnNames) ?? {};
      for (const [a, r] of Object.entries(l))
        r && this.dataSources[r] !== void 0 && (i[a] = s(this.dataSources[r]));
      return i;
    },
    /**
     * Strip meta from a trace for export / sync payloads (PRD §4 compileTrace).
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
      (this.syncMode === "auto" || this.syncMode === "hybrid") && (clearTimeout(this._autoSyncTimer), this._autoSyncTimer = setTimeout(() => this.syncToBackend(), 500));
    },
    /**
     * Sync current state back to Livewire (PRD §10).
     * All sync calls route through this single method — never inline $wire calls.
     */
    syncToBackend() {
      if (this.syncing) return;
      this.syncing = !0;
      const t = {
        traces: s(this.traces).map((i) => this.compileTrace(i)),
        layout: n(this.layout)
      };
      typeof this._wire < "u" ? this._wire.syncFromAlpine(JSON.stringify(t)).finally(() => {
        this.syncing = !1, this.dirty = !1, this.lastSyncAt = Date.now();
      }) : this.syncing = !1;
    },
    /**
     * Register the $wire reference so syncToBackend() can reach Livewire.
     * Called from the Blade template once Alpine has initialised.
     *
     * @param {object} wire  — the Livewire $wire proxy
     */
    setWire(t) {
      this._wire = t;
    }
  });
}
typeof window < "u" && (window.initChartBuilder = u);
export {
  u as initChartBuilder
};
