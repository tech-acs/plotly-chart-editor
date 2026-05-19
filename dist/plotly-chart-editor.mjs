function n(s) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(s) : s;
}
function l(s) {
  return structuredClone(n(s));
}
let h = null, p = null, T = null, _ = null, g = !1, m = !1, y = "Delete this trace? This cannot be undone.";
function v(s, d, u) {
  y = u ?? y, !!Alpine.store("chartBuilder") || Alpine.store("chartBuilder", {
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
    // ── Effects ───────────────────────────────────────────────────
    _startEffects() {
      const t = this;
      Alpine.effect(() => {
        JSON.stringify(t.traces), t._scheduleRender();
      }), Alpine.effect(() => {
        JSON.stringify(t.layout), t._scheduleRender();
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
      var r;
      const e = l(t), i = ((r = e.meta) == null ? void 0 : r.columnNames) ?? {};
      for (const [c, o] of Object.entries(i))
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
      const e = t ?? this.activeTraceIndex, i = l(n(this.traces)[e]);
      i.name = (i.name ?? `Trace ${e + 1}`) + " (copy)", this.traces.push(i), this.activeTraceIndex = this.traces.length - 1;
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
      const i = this.traces.length;
      if (e < 0 || e >= i) return;
      const r = l(n(this.traces[t]));
      this.traces.splice(t, 1), this.traces.splice(e, 0, r), this.activeTraceIndex = e;
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
      var r;
      if (((r = n(this.traces)[t]) == null ? void 0 : r.type) !== e) {
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
      const i = this.schemaProfiles[e], r = l(n(this.traces)[t] ?? {}), c = this._profileFieldKeys(i), o = { type: e };
      for (const a of ["name", "meta"])
        r[a] !== void 0 && (o[a] = r[a]);
      for (const a of Object.keys(r))
        ["type", "name", "meta"].includes(a) || c.has(a) && (o[a] = r[a]);
      this.traces[t] = o;
    },
    _profileFieldKeys(t) {
      const e = /* @__PURE__ */ new Set();
      for (const i of Object.values((t == null ? void 0 : t.groups) ?? {}))
        for (const r of (i == null ? void 0 : i.fields) ?? [])
          e.add(r.key.split(".")[0]);
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
  });
}
function w(s, d, u, f, t) {
  v(s, d, u);
  const e = Alpine.store("chartBuilder");
  if (p = f, h = t, typeof window.Plotly > "u") {
    e._plotlyMissing = !0, f && (f.textContent = d);
    return;
  }
  g || (m = !0, e._startEffects(), g = !0), e._render();
}
typeof window < "u" && (window.initChartBuilder = v, window.bootChartBuilder = w);
export {
  w as bootChartBuilder,
  v as initChartBuilder
};
