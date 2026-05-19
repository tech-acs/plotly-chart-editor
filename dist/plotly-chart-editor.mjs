function c(o) {
  return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(o) : o;
}
function d(o) {
  return structuredClone(c(o));
}
let p = null, u = null, b = null, A = null, m = !1, w = !1, _ = "Delete this trace? This cannot be undone.", S = null, I = null, T = null;
function k(o, f) {
  for (const [h, l] of Object.entries(f))
    o[h] === void 0 || o[h] === null ? o[h] = structuredClone(l) : typeof l == "object" && !Array.isArray(l) && typeof o[h] == "object" && !Array.isArray(o[h]) && k(o[h], l);
  return o;
}
const O = {
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
function C(o, f, h) {
  _ = h ?? _;
  const l = k(o.layout ?? {}, O);
  !!Alpine.store("chartBuilder") || Alpine.store("chartBuilder", {
    // ── Loaded from Livewire on mount ─────────────────────────────
    dataSources: o.dataSources ?? {},
    schemaProfiles: o.schemaProfiles ?? {},
    // ── Managed by Alpine ─────────────────────────────────────────
    traces: o.traces ?? [],
    layout: l,
    config: o.config ?? { responsive: !0 },
    // ── Sync / UI config ──────────────────────────────────────────
    syncMode: o.syncMode ?? "manual",
    traceTypes: o.traceTypes ?? ["bar"],
    showExport: o.showExport ?? !0,
    // ── Derived ───────────────────────────────────────────────────
    activeTraceIndex: 0,
    // ── Validation & sync state ───────────────────────────────────
    warnings: [],
    dirty: !1,
    syncing: !1,
    lastSyncAt: null,
    savedAt: null,
    // timestamp of last successful sync (drives "Saved ✓")
    copiedAt: null,
    // timestamp of last clipboard copy (drives "Copied ✓")
    // ── Internal flags ────────────────────────────────────────────
    _plotlyMissingMessage: f,
    _plotlyMissing: !1,
    _tooSmall: !1,
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
      let s = e;
      for (let n = 0; n < r.length - 1; n++)
        (s[r[n]] == null || typeof s[r[n]] != "object") && (s[r[n]] = {}), s = s[r[n]];
      s[r[r.length - 1]] = i;
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
      clearTimeout(b), b = setTimeout(() => {
        this.validate(), this._render(), w ? w = !1 : this.markDirty();
      }, 50);
    },
    _render() {
      if (this._plotlyMissing || !u) return;
      const e = c(this.traces).map((t) => this.resolveMeta(t));
      window.Plotly.react(
        u,
        e,
        d(this.layout),
        d(this.config)
      );
    },
    // ── Validation (PRD §11) ──────────────────────────────────────
    /**
     * Run all validations against current traces and dataSources.
     * Mutates this.warnings in place — replaces the entire array so
     * Alpine tracks the change.
     */
    validate() {
      const e = [];
      c(this.traces).forEach((t, i) => {
        var x;
        const r = ((x = t.meta) == null ? void 0 : x.columnNames) ?? {}, s = {};
        for (const [g, y] of Object.entries(r))
          y && this.dataSources[y] && (s[g] = c(this.dataSources[y]).length);
        const n = Object.values(s);
        if (n.length < 2) return;
        const a = Math.min(...n), M = Math.max(...n);
        if (a !== M)
          for (const [g, y] of Object.entries(s))
            y !== a && e.push({
              traceIndex: i,
              field: g,
              code: "LENGTH_MISMATCH",
              message: `Column '${g}' has ${y} values but trace expects ${a}. Showing first ${a}.`
            });
      }), this.warnings.splice(0, this.warnings.length, ...e);
    },
    /**
     * Return the warning (if any) for a specific trace+field combination.
     * Used by the inline warning in the column selector.
     */
    warningFor(e, t) {
      return c(this.warnings).find(
        (i) => i.traceIndex === e && i.field === t
      ) ?? null;
    },
    // ── Meta resolution ───────────────────────────────────────────
    resolveMeta(e) {
      var r;
      const t = d(e), i = ((r = t.meta) == null ? void 0 : r.columnNames) ?? {};
      for (const [s, n] of Object.entries(i))
        n && this.dataSources[n] !== void 0 && (t[s] = c(this.dataSources[n]));
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
      const t = e ?? c(this.traceTypes)[0] ?? "bar";
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
      const t = e ?? this.activeTraceIndex, i = d(c(this.traces)[t]);
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
      window.confirm(_) && (this.traces.splice(t, 1), this.traces.length === 0 ? this.activeTraceIndex = 0 : this.activeTraceIndex >= this.traces.length && (this.activeTraceIndex = this.traces.length - 1));
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
      const r = d(c(this.traces[e]));
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
      if (((r = c(this.traces)[e]) == null ? void 0 : r.type) !== t) {
        if (this.schemaProfiles[t]) {
          this._applyTraceType(e, t);
          return;
        }
        if (p)
          try {
            const s = await p.getSchemaProfile(t);
            if (!s || typeof s != "object" || !s.groups)
              throw new Error(`Invalid profile returned for type "${t}"`);
            this.schemaProfiles[t] = s, this._applyTraceType(e, t);
          } catch (s) {
            console.error(`[plotly-chart-editor] Failed to load profile for "${t}":`, s), this._dispatchToast(t);
          }
      }
    },
    _applyTraceType(e, t) {
      const i = this.schemaProfiles[t], r = d(c(this.traces)[e] ?? {}), s = this._profileFieldKeys(i), n = { type: t };
      for (const a of ["name", "meta"])
        r[a] !== void 0 && (n[a] = r[a]);
      for (const a of Object.keys(r))
        ["type", "name", "meta"].includes(a) || s.has(a) && (n[a] = r[a]);
      this.traces[e] = n;
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
    // ── Export (PRD §10) ──────────────────────────────────────────
    /**
     * Download the full chart config as chart.json.
     * meta is stripped — the file is ready for direct use with Plotly.newPlot().
     */
    exportJSON() {
      const e = c(this.traces).map((i) => this.compileTrace(i)), t = JSON.stringify(
        { data: e, layout: d(this.layout), config: d(this.config) },
        null,
        2
      );
      this._download("chart.json", "application/json", t);
    },
    /**
     * Export the current chart canvas as an image.
     *
     * @param {'png'|'jpeg'|'svg'|'webp'} format
     */
    async exportImage(e = "png") {
      if (!(this._plotlyMissing || !u))
        try {
          const t = await window.Plotly.toImage(u, {
            format: e,
            width: u.offsetWidth || 1200,
            height: u.offsetHeight || 600
          });
          this._download(`chart.${e}`, `image/${e}`, t, !0);
        } catch (t) {
          console.error("[plotly-chart-editor] exportImage failed:", t);
        }
    },
    /**
     * Copy the chart config JSON to the clipboard.
     * Shows a transient "Copied ✓" indicator via copiedAt.
     */
    async copyConfig() {
      const e = c(this.traces).map((i) => this.compileTrace(i)), t = JSON.stringify(
        { data: e, layout: d(this.layout), config: d(this.config) },
        null,
        2
      );
      try {
        await navigator.clipboard.writeText(t), this.copiedAt = Date.now(), clearTimeout(I), I = setTimeout(() => {
          this.copiedAt = null;
        }, 2e3);
      } catch (i) {
        console.error("[plotly-chart-editor] copyConfig failed:", i);
      }
    },
    /**
     * Trigger a browser download of content as a file.
     *
     * @param {string}  filename
     * @param {string}  mimeType
     * @param {string}  content
     * @param {boolean} isDataUrl  When true, content is already a data URL.
     */
    _download(e, t, i, r = !1) {
      const s = document.createElement("a");
      s.href = r ? i : `data:${t};charset=utf-8,${encodeURIComponent(i)}`, s.download = e, s.style.display = "none", document.body.appendChild(s), s.click(), document.body.removeChild(s);
    },
    // ── Sync state ────────────────────────────────────────────────
    markDirty() {
      this.dirty = !0, this._maybeAutoSync();
    },
    _maybeAutoSync() {
      (this.syncMode === "auto" || this.syncMode === "hybrid") && (clearTimeout(A), A = setTimeout(() => this.syncToBackend(), 500));
    },
    syncToBackend() {
      if (this.syncing || !p) return;
      this.syncing = !0;
      const e = {
        traces: c(this.traces).map((t) => this.compileTrace(t)),
        layout: d(this.layout)
      };
      p.syncFromAlpine(JSON.stringify(e)).then(() => {
        this.savedAt = Date.now(), clearTimeout(S), S = setTimeout(() => {
          this.savedAt = null;
        }, 2e3);
      }).finally(() => {
        this.syncing = !1, this.dirty = !1, this.lastSyncAt = Date.now();
      });
    },
    setWire(e) {
      p = e;
    }
  });
}
function N(o, f, h, l, v) {
  C(o, f, h);
  const e = Alpine.store("chartBuilder");
  if (u = l, p = v, typeof window.Plotly > "u") {
    e._plotlyMissing = !0, l && (l.textContent = f);
    return;
  }
  m || (w = !0, e._startEffects(), m = !0), e._render(), T && T.disconnect();
  const t = l == null ? void 0 : l.closest(".chart-builder");
  t && typeof ResizeObserver < "u" && (T = new ResizeObserver((i) => {
    var n, a;
    const s = (((a = (n = i[0]) == null ? void 0 : n.contentRect) == null ? void 0 : a.width) ?? window.innerWidth) < 1024;
    e._tooSmall = s, s && u && typeof window.Plotly < "u" ? (window.Plotly.purge(u), m = !1) : !s && !m && u && (w = !0, e._startEffects(), m = !0, e._render());
  }), T.observe(t));
}
typeof window < "u" && (window.initChartBuilder = C, window.bootChartBuilder = N);
export {
  N as bootChartBuilder,
  C as initChartBuilder
};
