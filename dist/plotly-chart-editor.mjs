function a(s) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(s) : s;
}
function f(s) {
  return structuredClone(a(s));
}
let c = null, h = null, p = null, m = null, y = !1;
function _(s, u) {
  return !!Alpine.store("chartBuilder") || Alpine.store("chartBuilder", {
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
    // ── Internal flags (reactive — safe) ──────────────────────────
    _plotlyMissingMessage: u,
    _plotlyMissing: !1,
    // ── Effects setup ─────────────────────────────────────────────
    _startEffects() {
      Alpine.effect(() => {
        JSON.stringify(a(this.traces)), this._scheduleRender();
      }), Alpine.effect(() => {
        JSON.stringify(a(this.layout)), this._scheduleRender();
      });
    },
    // ── Render pipeline ───────────────────────────────────────────
    _scheduleRender() {
      clearTimeout(p), p = setTimeout(() => {
        this._render(), y && this.markDirty();
      }, 50);
    },
    _render() {
      if (this._plotlyMissing || !h) return;
      const t = a(this.traces).map((e) => this.resolveMeta(e));
      window.Plotly.react(
        h,
        t,
        f(this.layout),
        f(this.config)
      );
    },
    // ── Meta resolution ───────────────────────────────────────────
    resolveMeta(t) {
      var r;
      const e = f(t), o = ((r = e.meta) == null ? void 0 : r.columnNames) ?? {};
      for (const [i, l] of Object.entries(o))
        l && this.dataSources[l] !== void 0 && (e[i] = a(this.dataSources[l]));
      return e;
    },
    compileTrace(t) {
      const e = this.resolveMeta(t);
      return delete e.meta, e;
    },
    // ── Trace type switching (PRD §6) ─────────────────────────────
    /**
     * Change a trace's type. If the profile is not yet cached, lazy-loads
     * it via $wire.getSchemaProfile(). On failure: reverts type, emits toast.
     *
     * @param {number} index    — trace index in this.traces
     * @param {string} newType  — target trace type
     */
    async setTraceType(t, e) {
      var r;
      if (((r = a(this.traces)[t]) == null ? void 0 : r.type) !== e) {
        if (this.schemaProfiles[e]) {
          this._applyTraceType(t, e);
          return;
        }
        if (c)
          try {
            const i = await c.getSchemaProfile(e);
            if (!i || typeof i != "object" || !i.groups)
              throw new Error(`Invalid profile returned for type "${e}"`);
            this.schemaProfiles[e] = i, this._applyTraceType(t, e);
          } catch (i) {
            console.error(`[plotly-chart-editor] Failed to load profile for "${e}":`, i), this._dispatchToast(e);
          }
      }
    },
    /**
     * Apply a type change: update type, prune fields not in new profile,
     * preserve meta/name/type.
     *
     * @param {number} index
     * @param {string} newType
     */
    _applyTraceType(t, e) {
      const o = this.schemaProfiles[e], r = f(a(this.traces)[t] ?? {}), i = this._profileFieldKeys(o), l = { type: e };
      for (const n of ["name", "meta"])
        r[n] !== void 0 && (l[n] = r[n]);
      for (const n of Object.keys(r))
        ["type", "name", "meta"].includes(n) || i.has(n) && (l[n] = r[n]);
      this.traces[t] = l;
    },
    /**
     * Collect the top-level key names declared in a profile's fields.
     *
     * @param {object} profile
     * @returns {Set<string>}
     */
    _profileFieldKeys(t) {
      const e = /* @__PURE__ */ new Set();
      for (const o of Object.values((t == null ? void 0 : t.groups) ?? {}))
        for (const r of (o == null ? void 0 : o.fields) ?? [])
          e.add(r.key.split(".")[0]);
      return e;
    },
    /**
     * Dispatch a toast event for a failed profile load (PRD §11.2).
     *
     * @param {string} type
     */
    _dispatchToast(t) {
      window.dispatchEvent(new CustomEvent("plotly-editor:toast", {
        detail: {
          key: "errors.profile_load_failed",
          message: this._plotlyMissingMessage.replace ? `Failed to load profile for ${t}. Please try again.` : `Failed to load profile for ${t}. Please try again.`,
          type: t
        }
      }));
    },
    // ── Sync state ────────────────────────────────────────────────
    markDirty() {
      this.dirty = !0, this._maybeAutoSync();
    },
    _maybeAutoSync() {
      (this.syncMode === "auto" || this.syncMode === "hybrid") && (clearTimeout(m), m = setTimeout(() => this.syncToBackend(), 500));
    },
    syncToBackend() {
      if (this.syncing || !c) return;
      this.syncing = !0;
      const t = {
        traces: a(this.traces).map((e) => this.compileTrace(e)),
        layout: f(this.layout)
      };
      c.syncFromAlpine(JSON.stringify(t)).finally(() => {
        this.syncing = !1, this.dirty = !1, this.lastSyncAt = Date.now();
      });
    },
    setWire(t) {
      c = t;
    }
  }), Alpine.store("chartBuilder");
}
function g(s, u, d, t) {
  const e = _(s, u);
  if (h = d, c = t, typeof window.Plotly > "u") {
    e._plotlyMissing = !0, d && (d.textContent = u);
    return;
  }
  y || (e._startEffects(), y = !0), e._render();
}
typeof window < "u" && (window.initChartBuilder = _, window.bootChartBuilder = g);
export {
  g as bootChartBuilder,
  _ as initChartBuilder
};
