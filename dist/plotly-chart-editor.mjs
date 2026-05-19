function a(s) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(s) : s;
}
function l(s) {
  return structuredClone(a(s));
}
let h = null, p = null, T = null, _ = null, g = !1, m = !1, y = "Delete this trace? This cannot be undone.";
function v(s, d, f) {
  y = f ?? y, !!Alpine.store("chartBuilder") || Alpine.store("chartBuilder", {
    // ── Loaded from Livewire on mount ─────────────────────────────
    dataSources: s.dataSources ?? {},
    schemaProfiles: s.schemaProfiles ?? {},
    // ── Managed by Alpine ─────────────────────────────────────────
    traces: s.traces ?? [],
    layout: s.layout ?? {},
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
    _plotlyMissingMessage: d,
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
      clearTimeout(T), T = setTimeout(() => {
        this._render(), m ? m = !1 : this.markDirty();
      }, 50);
    },
    _render() {
      if (this._plotlyMissing || !p) return;
      const e = a(this.traces).map((t) => this.resolveMeta(t));
      window.Plotly.react(
        p,
        e,
        l(this.layout),
        l(this.config)
      );
    },
    // ── Meta resolution ───────────────────────────────────────────
    resolveMeta(e) {
      var i;
      const t = l(e), r = ((i = t.meta) == null ? void 0 : i.columnNames) ?? {};
      for (const [c, o] of Object.entries(r))
        o && this.dataSources[o] !== void 0 && (t[c] = a(this.dataSources[o]));
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
      const t = e ?? this.activeTraceIndex, r = l(a(this.traces)[t]);
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
      window.confirm(y) && (this.traces.splice(t, 1), this.traces.length === 0 ? this.activeTraceIndex = 0 : this.activeTraceIndex >= this.traces.length && (this.activeTraceIndex = this.traces.length - 1));
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
      const i = l(a(this.traces[e]));
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
        if (h)
          try {
            const c = await h.getSchemaProfile(t);
            if (!c || typeof c != "object" || !c.groups)
              throw new Error(`Invalid profile returned for type "${t}"`);
            this.schemaProfiles[t] = c, this._applyTraceType(e, t);
          } catch (c) {
            console.error(`[plotly-chart-editor] Failed to load profile for "${t}":`, c), this._dispatchToast(t);
          }
      }
    },
    _applyTraceType(e, t) {
      const r = this.schemaProfiles[t], i = l(a(this.traces)[e] ?? {}), c = this._profileFieldKeys(r), o = { type: t };
      for (const n of ["name", "meta"])
        i[n] !== void 0 && (o[n] = i[n]);
      for (const n of Object.keys(i))
        ["type", "name", "meta"].includes(n) || c.has(n) && (o[n] = i[n]);
      this.traces[e] = o;
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
    // ── Sync state ────────────────────────────────────────────────
    markDirty() {
      this.dirty = !0, this._maybeAutoSync();
    },
    _maybeAutoSync() {
      (this.syncMode === "auto" || this.syncMode === "hybrid") && (clearTimeout(_), _ = setTimeout(() => this.syncToBackend(), 500));
    },
    syncToBackend() {
      if (this.syncing || !h) return;
      this.syncing = !0;
      const e = {
        traces: a(this.traces).map((t) => this.compileTrace(t)),
        layout: l(this.layout)
      };
      h.syncFromAlpine(JSON.stringify(e)).finally(() => {
        this.syncing = !1, this.dirty = !1, this.lastSyncAt = Date.now();
      });
    },
    setWire(e) {
      h = e;
    }
  });
}
function w(s, d, f, u, e) {
  v(s, d, f);
  const t = Alpine.store("chartBuilder");
  if (p = u, h = e, typeof window.Plotly > "u") {
    t._plotlyMissing = !0, u && (u.textContent = d);
    return;
  }
  g || (m = !0, t._startEffects(), g = !0), t._render();
}
typeof window < "u" && (window.initChartBuilder = v, window.bootChartBuilder = w);
export {
  w as bootChartBuilder,
  v as initChartBuilder
};
