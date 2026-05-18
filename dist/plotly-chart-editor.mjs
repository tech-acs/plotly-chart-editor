function l(s, n) {
  Alpine.store("chartBuilder", {
    // ── Loaded from Livewire on mount ─────────────────────────────────
    dataSources: s.dataSources ?? {},
    schemaProfiles: s.schemaProfiles ?? {},
    // ── Managed by Alpine ─────────────────────────────────────────────
    traces: s.traces ?? [],
    layout: s.layout ?? {},
    config: s.config ?? { responsive: !0 },
    // ── Sync / UI config ──────────────────────────────────────────────
    syncMode: s.syncMode ?? "manual",
    traceTypes: s.traceTypes ?? ["bar"],
    showExport: s.showExport ?? !0,
    // ── Derived ───────────────────────────────────────────────────────
    activeTraceIndex: 0,
    // ── Validation & sync state ───────────────────────────────────────
    warnings: [],
    dirty: !1,
    syncing: !1,
    lastSyncAt: null,
    // ── Internal ──────────────────────────────────────────────────────
    _renderTimer: null,
    _canvasEl: null,
    _plotlyMissingMessage: n,
    _plotlyMissing: !1,
    /**
     * Call once after the store is registered, passing the canvas DOM element.
     * Wires up the $watch debounce pipeline and performs the initial render.
     *
     * @param {HTMLElement} canvasEl
     */
    boot(e) {
      if (this._canvasEl = e, typeof window.Plotly > "u") {
        this._plotlyMissing = !0, e && (e.textContent = this._plotlyMissingMessage);
        return;
      }
      Alpine.effect(() => {
        JSON.stringify(this.traces), this._scheduleRender();
      }), Alpine.effect(() => {
        JSON.stringify(this.layout), this._scheduleRender();
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
      const e = this.traces.map((t) => this.resolveMeta(t));
      window.Plotly.react(this._canvasEl, e, structuredClone(this.layout), structuredClone(this.config));
    },
    // ── Meta resolution ───────────────────────────────────────────────
    /**
     * Given an internal trace (with meta.columnNames), return a NEW trace
     * object with actual data arrays attached — does NOT mutate the original.
     *
     * PRD §4 compilation pipeline.
     *
     * @param {object} trace
     * @returns {object}
     */
    resolveMeta(e) {
      var r;
      const t = structuredClone(e), o = ((r = t.meta) == null ? void 0 : r.columnNames) ?? {};
      for (const [c, i] of Object.entries(o))
        i && this.dataSources[i] !== void 0 && (t[c] = this.dataSources[i]);
      return t;
    },
    /**
     * Strip meta from a trace for export / sync payloads (PRD §4 compileTrace).
     *
     * @param {object} trace
     * @returns {object}
     */
    compileTrace(e) {
      const t = this.resolveMeta(e);
      return delete t.meta, t;
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
      const e = {
        traces: this.traces.map((t) => this.compileTrace(t)),
        layout: structuredClone(this.layout)
      };
      typeof this._wire < "u" ? this._wire.syncFromAlpine(JSON.stringify(e)).finally(() => {
        this.syncing = !1, this.dirty = !1, this.lastSyncAt = Date.now();
      }) : this.syncing = !1;
    },
    /**
     * Register the $wire reference so syncToBackend() can reach Livewire.
     * Called from the Blade template once Alpine has initialised.
     *
     * @param {object} wire  — the Livewire $wire proxy
     */
    setWire(e) {
      this._wire = e;
    }
  });
}
typeof window < "u" && (window.initChartBuilder = l);
export {
  l as initChartBuilder
};
