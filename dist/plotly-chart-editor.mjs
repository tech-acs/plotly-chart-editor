function n(i) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(i) : i;
}
function l(i) {
  return structuredClone(n(i));
}
let h = null, p = null, T = null, _ = null, m = !1, y = "Delete this trace? This cannot be undone.";
function v(i, d, u) {
  return y = u ?? y, !!Alpine.store("chartBuilder") || Alpine.store("chartBuilder", {
    // ── Loaded from Livewire on mount ─────────────────────────────
    dataSources: i.dataSources ?? {},
    schemaProfiles: i.schemaProfiles ?? {},
    // ── Managed by Alpine ─────────────────────────────────────────
    traces: i.traces ?? [],
    layout: i.layout ?? {},
    config: i.config ?? { responsive: !0 },
    // ── Sync / UI config ──────────────────────────────────────────
    syncMode: i.syncMode ?? "manual",
    traceTypes: i.traceTypes ?? ["bar"],
    showExport: i.showExport ?? !0,
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
    // ── Effects ───────────────────────────────────────────────────
    _startEffects() {
      Alpine.effect(() => {
        JSON.stringify(n(this.traces)), this._scheduleRender();
      }), Alpine.effect(() => {
        JSON.stringify(n(this.layout)), this._scheduleRender();
      });
    },
    // ── Render pipeline ───────────────────────────────────────────
    _scheduleRender() {
      clearTimeout(T), T = setTimeout(() => {
        this._render(), m && this.markDirty();
      }, 50);
    },
    _render() {
      if (this._plotlyMissing || !p) return;
      const t = n(this.traces).map((e) => this.resolveMeta(e));
      window.Plotly.react(
        p,
        t,
        l(this.layout),
        l(this.config)
      );
    },
    // ── Meta resolution ───────────────────────────────────────────
    resolveMeta(t) {
      var s;
      const e = l(t), r = ((s = e.meta) == null ? void 0 : s.columnNames) ?? {};
      for (const [c, o] of Object.entries(r))
        o && this.dataSources[o] !== void 0 && (e[c] = n(this.dataSources[o]));
      return e;
    },
    compileTrace(t) {
      const e = this.resolveMeta(t);
      return delete e.meta, e;
    },
    // ── Trace operations (PRD §6) ─────────────────────────────────
    /**
     * Append a new empty trace with the given type (defaults to first
     * enabled type). Sets it as active.
     *
     * @param {string} [type]
     */
    addTrace(t) {
      const e = t ?? n(this.traceTypes)[0] ?? "bar";
      this.traces.push({
        type: e,
        name: `Trace ${this.traces.length + 1}`,
        meta: { columnNames: {} }
      }), this.activeTraceIndex = this.traces.length - 1;
    },
    /**
     * Deep-copy the active trace and append it. Sets the copy active.
     *
     * @param {number} [index]
     */
    duplicateTrace(t) {
      const e = t ?? this.activeTraceIndex, r = l(n(this.traces)[e]);
      r.name = (r.name ?? `Trace ${e + 1}`) + " (copy)", this.traces.push(r), this.activeTraceIndex = this.traces.length - 1;
    },
    /**
     * Remove a trace after native confirm(). Adjusts activeTraceIndex
     * so it never goes out of bounds.
     *
     * @param {number} [index]
     */
    removeTrace(t) {
      const e = t ?? this.activeTraceIndex;
      window.confirm(y) && (this.traces.splice(e, 1), this.traces.length === 0 ? this.activeTraceIndex = 0 : this.activeTraceIndex >= this.traces.length && (this.activeTraceIndex = this.traces.length - 1));
    },
    /**
     * Swap trace at `from` with trace at `to`.
     *
     * @param {number} from
     * @param {number} to
     */
    moveTrace(t, e) {
      const r = this.traces.length;
      if (e < 0 || e >= r) return;
      const s = n(this.traces), c = s.splice(t, 1)[0];
      s.splice(e, 0, c), this.traces = s, this.activeTraceIndex = e;
    },
    /**
     * Move the active trace one step up (lower index = rendered first).
     */
    moveTraceUp(t) {
      const e = t ?? this.activeTraceIndex;
      this.moveTrace(e, e - 1);
    },
    /**
     * Move the active trace one step down.
     */
    moveTraceDown(t) {
      const e = t ?? this.activeTraceIndex;
      this.moveTrace(e, e + 1);
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
    async setTraceType(t, e) {
      var s;
      if (((s = n(this.traces)[t]) == null ? void 0 : s.type) !== e) {
        if (this.schemaProfiles[e]) {
          this._applyTraceType(t, e);
          return;
        }
        if (h)
          try {
            const c = await h.getSchemaProfile(e);
            if (!c || typeof c != "object" || !c.groups)
              throw new Error(`Invalid profile returned for type "${e}"`);
            this.schemaProfiles[e] = c, this._applyTraceType(t, e);
          } catch (c) {
            console.error(`[plotly-chart-editor] Failed to load profile for "${e}":`, c), this._dispatchToast(e);
          }
      }
    },
    _applyTraceType(t, e) {
      const r = this.schemaProfiles[e], s = l(n(this.traces)[t] ?? {}), c = this._profileFieldKeys(r), o = { type: e };
      for (const a of ["name", "meta"])
        s[a] !== void 0 && (o[a] = s[a]);
      for (const a of Object.keys(s))
        ["type", "name", "meta"].includes(a) || c.has(a) && (o[a] = s[a]);
      this.traces[t] = o;
    },
    _profileFieldKeys(t) {
      const e = /* @__PURE__ */ new Set();
      for (const r of Object.values((t == null ? void 0 : t.groups) ?? {}))
        for (const s of (r == null ? void 0 : r.fields) ?? [])
          e.add(s.key.split(".")[0]);
      return e;
    },
    _dispatchToast(t) {
      window.dispatchEvent(new CustomEvent("plotly-editor:toast", {
        detail: {
          key: "errors.profile_load_failed",
          message: `Failed to load profile for ${t}. Please try again.`,
          type: t
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
      const t = {
        traces: n(this.traces).map((e) => this.compileTrace(e)),
        layout: l(this.layout)
      };
      h.syncFromAlpine(JSON.stringify(t)).finally(() => {
        this.syncing = !1, this.dirty = !1, this.lastSyncAt = Date.now();
      });
    },
    setWire(t) {
      h = t;
    }
  }), Alpine.store("chartBuilder");
}
function g(i, d, u, f, t) {
  const e = v(i, d, u);
  if (p = f, h = t, typeof window.Plotly > "u") {
    e._plotlyMissing = !0, f && (f.textContent = d);
    return;
  }
  m || (e._startEffects(), m = !0), e._render();
}
typeof window < "u" && (window.initChartBuilder = v, window.bootChartBuilder = g);
export {
  g as bootChartBuilder,
  v as initChartBuilder
};
