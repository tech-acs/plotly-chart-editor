//#region resources/js/plotly-chart-editor.js
function e(e) {
	return typeof Alpine < "u" && typeof Alpine.raw == "function" ? Alpine.raw(e) : e;
}
function t(t) {
	return JSON.parse(JSON.stringify(e(t)));
}
var n = null, r = { area: "scatter" }, i = { area: {
	mode: "none",
	fill: "tozeroy",
	fillcolor: "#1f77b4"
} }, a = null, o = null, s = null, c = !1, l = !1, u = "Delete this trace? This cannot be undone.", d = "Delete this annotation? This cannot be undone.", f = "Column ':field' has :colLen values but trace expects :expectedLen. Showing first :shown.", p = "Failed to load profile for :type. Please try again.", m = null, h = null, g = null, _ = null;
function v(e, t) {
	for (let [n, r] of Object.entries(t)) e[n] === void 0 || e[n] === null || typeof e[n] != typeof r ? e[n] = structuredClone(r) : typeof r == "object" && !Array.isArray(r) && typeof e[n] == "object" && !Array.isArray(e[n]) && v(e[n], r);
	return e;
}
var y = {
	title: {
		text: "",
		font: {
			family: "Arial",
			size: 16,
			color: "#000000"
		},
		x: .5,
		automargin: !1
	},
	xaxis: {
		title: {
			text: "",
			font: {
				family: "Arial",
				size: 14,
				color: "#000000"
			}
		},
		showgrid: !0,
		tickangle: "auto",
		tickfont: {
			family: "Arial",
			size: 12,
			color: "#000000"
		},
		type: "-",
		autorange: !0,
		showline: !1,
		linecolor: "#444444",
		linewidth: 1,
		mirror: !1,
		showticklabels: !0,
		tickprefix: "",
		ticksuffix: "",
		automargin: !1,
		side: "bottom",
		tickcolor: "#444444",
		tickwidth: 1,
		ticklen: 5,
		ticks: "outside"
	},
	yaxis: {
		title: {
			text: "",
			font: {
				family: "Arial",
				size: 14,
				color: "#000000"
			}
		},
		showgrid: !0,
		tickangle: "auto",
		tickformat: "",
		tickfont: {
			family: "Arial",
			size: 12,
			color: "#000000"
		},
		type: "-",
		autorange: !0,
		showline: !1,
		linecolor: "#444444",
		linewidth: 1,
		mirror: !1,
		showticklabels: !0,
		tickprefix: "",
		ticksuffix: "",
		automargin: !1,
		side: "left",
		tickcolor: "#444444",
		tickwidth: 1,
		ticklen: 5,
		ticks: "outside"
	},
	margin: {
		t: 50,
		b: 50,
		l: 60,
		r: 30,
		pad: 0
	},
	showlegend: !0,
	legend: {
		orientation: "v",
		xanchor: "auto",
		yanchor: "auto",
		x: 1,
		y: 1,
		bgcolor: "",
		bordercolor: "#444444",
		borderwidth: 0,
		font: {
			family: "Arial",
			size: 12,
			color: "#000000"
		},
		title: {
			text: "",
			font: {
				family: "Arial",
				size: 12,
				color: "#000000"
			}
		}
	},
	_annotations: [],
	font: {
		family: "Arial",
		size: 12,
		color: "#444444"
	},
	uniformtext: {
		mode: !1,
		minsize: 0
	},
	separators: ".,",
	colorway: [
		"#1f77b4",
		"#ff7f0e",
		"#2ca02c",
		"#d62728",
		"#9467bd",
		"#8c564b",
		"#e377c2",
		"#7f7f7f",
		"#bcbd22",
		"#17becf"
	],
	dragmode: "zoom",
	hovermode: "x",
	hoverlabel: {
		bgcolor: "#ffffff",
		bordercolor: "#444444",
		font: {
			family: "Arial",
			size: 12,
			color: "#000000"
		},
		align: "auto"
	}
}, b = {
	text: {
		_plotlyType: "text",
		text: "new text",
		font: {
			family: "Arial",
			size: 14,
			color: "#000000"
		},
		textangle: 0,
		align: "center",
		valign: "middle",
		showarrow: !0,
		arrowcolor: "#444444",
		arrowhead: 1,
		arrowwidth: 1,
		arrowsize: 1,
		ax: -50,
		ay: -50,
		x: .5,
		y: .5,
		xref: "paper",
		yref: "paper",
		xanchor: "auto",
		yanchor: "auto",
		bgcolor: "",
		bordercolor: "#444444",
		borderwidth: 1,
		borderpad: 1,
		opacity: 1
	},
	shape: {
		_plotlyType: "shape",
		type: "rect",
		x0: .1,
		y0: .1,
		x1: .5,
		y1: .5,
		xref: "paper",
		yref: "paper",
		line: {
			color: "#444444",
			width: 2,
			dash: "solid"
		},
		fillcolor: "#1f77b4",
		layer: "above",
		opacity: .7
	},
	image: {
		_plotlyType: "image",
		source: "",
		x: .5,
		y: .5,
		sizex: .2,
		sizey: .2,
		xref: "paper",
		yref: "paper",
		xanchor: "left",
		yanchor: "top",
		sizing: "contain",
		layer: "above",
		opacity: 1
	}
};
function x(c, g, x, S, C, w) {
	u = x ?? u, d = S ?? d, f = C ?? f, p = w ?? p;
	let T = c.layout ?? {}, E = v(Array.isArray(T) ? {} : T, y), D = [
		"marker.color",
		"line.color",
		"fillcolor"
	], O = c.layout?.colorway ?? y.colorway;
	c.traces && Array.isArray(c.traces) && c.traces.forEach((e, t) => {
		let n = O[t % O.length];
		for (let t of D) {
			let r = t.split("."), i = e, a = !0;
			for (let e of r) {
				if (i === void 0 || i[e] === void 0) {
					a = !1;
					break;
				}
				i = i[e];
			}
			if (a) continue;
			let o = e;
			for (let e = 0; e < r.length - 1; e++) (o[r[e]] == null || typeof o[r[e]] != "object") && (o[r[e]] = {}), o = o[r[e]];
			o[r[r.length - 1]] = n;
		}
	}), E.annotations && Array.isArray(E.annotations) && (E._annotations = E._annotations.concat(E.annotations.map((e) => ({
		...e,
		_plotlyType: "text"
	}))), delete E.annotations), E.shapes && Array.isArray(E.shapes) && (E._annotations = E._annotations.concat(E.shapes.map((e) => ({
		...e,
		_plotlyType: "shape"
	}))), delete E.shapes), E.images && Array.isArray(E.images) && (E._annotations = E._annotations.concat(E.images.map((e) => ({
		...e,
		_plotlyType: "image"
	}))), delete E.images), Alpine.store("chartBuilder") || Alpine.store("chartBuilder", {
		dataSources: c.dataSources ?? {},
		schemaProfiles: c.schemaProfiles ?? {},
		traces: c.traces ?? [],
		layout: E,
		config: c.config ?? { responsive: !0 },
		syncMode: c.syncMode ?? "manual",
		traceTypes: c.traceTypes ?? [
			"bar",
			"scatter",
			"pie",
			"histogram",
			"line",
			"area"
		],
		showExport: c.showExport ?? !0,
		showDataViewer: c.showDataViewer ?? !0,
		activeTraceIndex: 0,
		activeAxis: "x",
		warnings: [],
		dirty: !1,
		syncing: !1,
		lastSyncAt: null,
		savedAt: null,
		copiedAt: null,
		_plotlyMissingMessage: g,
		_plotlyMissing: !1,
		_tooSmall: !1,
		get trace() {
			return this.traces[this.activeTraceIndex] ?? {};
		},
		get traceType() {
			return this.traces[this.activeTraceIndex]?.type ?? "";
		},
		getPath(e, t) {
			return t.split(".").reduce((e, t) => e?.[t], e);
		},
		setPath(e, t, n) {
			let r = t.split("."), i = e;
			for (let e = 0; e < r.length - 1; e++) (i[r[e]] == null || typeof i[r[e]] != "object") && (i[r[e]] = {}), i = i[r[e]];
			i[r[r.length - 1]] = n;
		},
		setColumnName(e, t, n) {
			let r = this.traces[e];
			r.meta ||= { columnNames: {} }, r.meta.columnNames || (r.meta.columnNames = {}), r.meta.columnNames[t] = n;
		},
		hasMarkerSupport(e) {
			return [
				"scatter",
				"bar",
				"histogram",
				"pie",
				"sunburst"
			].includes(e);
		},
		hasFillSupport(e) {
			return ["scatter"].includes(e);
		},
		evaluateXshow(e) {
			return e ? Function("store", "trace", "traceType", "hasMarkerSupport", "hasFillSupport", "return " + e)(this, this.trace, this.traceType, this.hasMarkerSupport.bind(this), this.hasFillSupport.bind(this)) : !0;
		},
		_startEffects() {
			let e = this;
			Alpine.effect(() => {
				JSON.stringify(e.traces), e._scheduleRender();
			}), Alpine.effect(() => {
				JSON.stringify(e.layout), e._scheduleRender();
			});
		},
		_scheduleRender() {
			clearTimeout(o), o = setTimeout(() => {
				this.validate(), this._render(), l ? l = !1 : this.markDirty();
			}, 50);
		},
		_render() {
			if (this._plotlyMissing || !a) return;
			let n = e(this.traces).map((e) => this.compileTrace(e)), r = t(this.layout);
			this._compileAnnotations(r);
			let i = JSON.stringify(e(this.traces).map((e) => ({
				type: e.type,
				mode: e.mode,
				columnNames: e.meta?.columnNames
			}))), o = i !== _;
			_ = i, r.uirevision = i, (o ? (window.Plotly.purge(a), window.Plotly.newPlot) : window.Plotly.react)(a, n, r, t(this.config)).catch((e) => {
				console.error("[plotly-chart-editor] Plotly render failed:", e);
			});
		},
		validate() {
			let t = [];
			e(this.traces).forEach((n, r) => {
				let i = n.meta?.columnNames ?? {}, a = {};
				for (let [t, n] of Object.entries(i)) n && this.dataSources[n] && (a[t] = e(this.dataSources[n]).length);
				let o = Object.values(a);
				if (o.length < 2) return;
				let s = Math.min(...o);
				if (s !== Math.max(...o)) for (let [e, n] of Object.entries(a)) n !== s && t.push({
					traceIndex: r,
					field: e,
					code: "LENGTH_MISMATCH",
					message: f.replace(":field", e).replace(":columnLen", String(n)).replace(":expectedLen", String(s)).replace(":shown", String(s))
				});
			}), this.warnings.splice(0, this.warnings.length, ...t);
		},
		warningFor(t, n) {
			return e(this.warnings).find((e) => e.traceIndex === t && e.field === n) ?? null;
		},
		compileTrace(n) {
			let i = t(n), a = i.meta?.columnNames ?? {};
			for (let [t, n] of Object.entries(a)) {
				if (!n || this.dataSources[n] === void 0 || t === "marker.size" && i.marker?.size_from_column === !1) continue;
				let r = t.split("."), a = i;
				for (let e = 0; e < r.length - 1; e++) (a[r[e]] == null || typeof a[r[e]] != "object") && (a[r[e]] = {}), a = a[r[e]];
				a[r[r.length - 1]] = e(this.dataSources[n]);
			}
			return i.type = r[i.type] ?? i.type, i;
		},
		addTrace(t) {
			let n = t ?? e(this.traceTypes)[0] ?? "bar", r = {
				type: n,
				name: `Trace ${this.traces.length + 1}`,
				meta: { columnNames: {} }
			}, i = this.schemaProfiles[n];
			if (i) for (let e of Object.values(i.groups)) for (let t of e.fields) t.dflt !== void 0 && this.setPath(r, t.key, t.dflt);
			this.traces.push(r), this.activeTraceIndex = this.traces.length - 1;
		},
		duplicateTrace(n) {
			let r = n ?? this.activeTraceIndex, i = t(e(this.traces)[r]);
			i.name = (i.name ?? `Trace ${r + 1}`) + " (copy)", this.traces.push(i), this.activeTraceIndex = this.traces.length - 1;
		},
		removeTrace(e) {
			let t = e ?? this.activeTraceIndex;
			window.confirm(u) && (this.traces.splice(t, 1), this.traces.length === 0 ? this.activeTraceIndex = 0 : this.activeTraceIndex >= this.traces.length && (this.activeTraceIndex = this.traces.length - 1));
		},
		moveTrace(n, r) {
			let i = this.traces.length;
			if (r < 0 || r >= i) return;
			let a = t(e(this.traces[n]));
			this.traces.splice(n, 1), this.traces.splice(r, 0, a), this.activeTraceIndex = r;
		},
		moveTraceUp(e) {
			let t = e ?? this.activeTraceIndex;
			this.moveTrace(t, t - 1);
		},
		moveTraceDown(e) {
			let t = e ?? this.activeTraceIndex;
			this.moveTrace(t, t + 1);
		},
		addAnnotation(e) {
			let n = b[e];
			n && (this.layout._annotations || (this.layout._annotations = []), this.layout._annotations.push(t(n)), this._scheduleRender());
		},
		removeAnnotation(e) {
			let t = this.layout._annotations;
			!t || e < 0 || e >= t.length || (t.splice(e, 1), this._scheduleRender());
		},
		moveAnnotation(n, r) {
			let i = this.layout._annotations;
			if (!i || n < 0 || n >= i.length || r < 0 || r >= i.length || n === r) return;
			let a = t(e(i[n]));
			i.splice(n, 1), i.splice(r, 0, a), this._scheduleRender();
		},
		moveAnnotationUp(e) {
			this.moveAnnotation(e, e - 1);
		},
		moveAnnotationDown(e) {
			this.moveAnnotation(e, e + 1);
		},
		_compileAnnotations(n) {
			let r = n._annotations;
			if (!r || !Array.isArray(r) || r.length === 0) {
				n.annotations = [], n.shapes = [], n.images = [], delete n._annotations;
				return;
			}
			let i = [], a = [], o = [];
			for (let n of r) {
				let r = e(n), s = t(r);
				delete s._plotlyType, r._plotlyType === "text" ? i.push(s) : r._plotlyType === "shape" ? a.push(s) : r._plotlyType === "image" && o.push(s);
			}
			n.annotations = i, n.shapes = a, n.images = o, delete n._annotations;
		},
		async setTraceType(t, r) {
			if (e(this.traces)[t]?.type !== r) {
				if (this.schemaProfiles[r]) {
					this._applyTraceType(t, r);
					return;
				}
				if (n) try {
					let e = await n.getSchemaProfile(r);
					if (!e || typeof e != "object" || !e.groups) throw Error(`Invalid profile returned for type "${r}"`);
					this.schemaProfiles[r] = e, this._applyTraceType(t, r);
				} catch (e) {
					console.error(`[plotly-chart-editor] Failed to load profile for "${r}":`, e), this._dispatchToast(r);
				}
			}
		},
		_applyTraceType(n, r) {
			let a = this.schemaProfiles[r], o = t(e(this.traces)[n] ?? {}), s = this._profileFieldKeys(a), c = { type: r };
			for (let e of ["name", "meta"]) o[e] !== void 0 && (c[e] = o[e]);
			for (let e of Object.keys(o)) [
				"type",
				"name",
				"meta"
			].includes(e) || s.has(e) && (c[e] = o[e]);
			let l = i[r] ?? {};
			for (let [e, t] of Object.entries(l)) c[e] = t;
			if (a) for (let e of Object.values(a.groups)) for (let t of e.fields) t.dflt !== void 0 && this.getPath(c, t.key) === void 0 && this.setPath(c, t.key, t.dflt);
			this.traces[n] = c;
		},
		_profileFieldKeys(e) {
			let t = /* @__PURE__ */ new Set();
			for (let n of Object.values(e?.groups ?? {})) for (let e of n?.fields ?? []) t.add(e.key.split(".")[0]);
			return t;
		},
		_dispatchToast(e) {
			window.dispatchEvent(new CustomEvent("plotly-editor:toast", { detail: {
				key: "errors.profile_load_failed",
				message: p.replace(":type", e),
				type: e
			} }));
		},
		_buildExportPayload() {
			let n = e(this.traces).map((e) => this.compileTrace(e));
			return JSON.stringify({
				data: n,
				layout: t(this.layout),
				config: t(this.config)
			}, null, 2);
		},
		exportJSON() {
			this._download("chart.json", "application/json", this._buildExportPayload());
		},
		async exportImage(e = "png") {
			if (!(this._plotlyMissing || !a)) try {
				let t = await window.Plotly.toImage(a, {
					format: e,
					width: a.offsetWidth || 1200,
					height: a.offsetHeight || 600
				});
				this._download(`chart.${e}`, `image/${e}`, t, !0);
			} catch (e) {
				console.error("[plotly-chart-editor] exportImage failed:", e);
			}
		},
		async copyConfig() {
			try {
				await navigator.clipboard.writeText(this._buildExportPayload()), this.copiedAt = Date.now(), clearTimeout(h), h = setTimeout(() => {
					this.copiedAt = null;
				}, 2e3);
			} catch (e) {
				console.error("[plotly-chart-editor] copyConfig failed:", e);
			}
		},
		_download(e, t, n, r = !1) {
			let i = document.createElement("a");
			i.href = r ? n : `data:${t};charset=utf-8,${encodeURIComponent(n)}`, i.download = e, i.style.display = "none", document.body.appendChild(i), i.click(), document.body.removeChild(i);
		},
		markDirty() {
			this.dirty = !0, this._maybeAutoSync();
		},
		_maybeAutoSync() {
			(this.syncMode === "auto" || this.syncMode === "hybrid") && (clearTimeout(s), s = setTimeout(() => this.syncToBackend(), 500));
		},
		syncToBackend() {
			if (this.syncing || !n) return;
			this.syncing = !0;
			let i = t(this.layout);
			this._compileAnnotations(i);
			let a = {
				traces: e(this.traces).map((e) => {
					let n = t(e);
					n.type = r[n.type] ?? n.type;
					let i = n.meta?.columnNames ?? {};
					for (let e of Object.keys(i)) {
						let t = e.split("."), r = n;
						for (let e = 0; e < t.length - 1 && !(r[t[e]] == null || typeof r[t[e]] != "object"); e++) r = r[t[e]];
						delete r[t[t.length - 1]];
					}
					return n;
				}),
				layout: i
			};
			n.syncFromAlpine(JSON.stringify(a)).then(() => {
				this.dirty = !1, this.savedAt = Date.now(), clearTimeout(m), m = setTimeout(() => {
					this.savedAt = null;
				}, 2e3), window.dispatchEvent(new CustomEvent("plotly-chart-editor:synced", { detail: {
					traces: a.traces,
					layout: i
				} }));
			}).catch((e) => {
				console.error("[plotly-chart-editor] syncToBackend failed:", e), this.dirty = !0, window.dispatchEvent(new CustomEvent("plotly-chart-editor:sync-failed", { detail: { error: e.message ?? String(e) } }));
			}).finally(() => {
				this.syncing = !1, this.lastSyncAt = Date.now();
			});
		},
		setWire(e) {
			n = e;
		}
	});
}
function S(e, t, r, i, o, s, u, d) {
	x(e, t, r, i, u, d);
	let f = Alpine.store("chartBuilder");
	if (a = o, n = s, window.Plotly === void 0) {
		f._plotlyMissing = !0, o && (o.textContent = t);
		return;
	}
	c && f._render(), g && g.disconnect();
	let p = o?.closest(".chart-builder");
	p && typeof ResizeObserver < "u" && (g = new ResizeObserver((e) => {
		let t = (e[0]?.contentRect?.width ?? window.innerWidth) < 1024;
		f._tooSmall = t, t && a && window.Plotly !== void 0 && (window.Plotly.purge(a), c = !1);
	}), g.observe(p)), o && typeof ResizeObserver < "u" && new ResizeObserver(() => {
		if (f._plotlyMissing || window.Plotly === void 0 || f._tooSmall) return;
		let e = o.getBoundingClientRect();
		e.width === 0 || e.height === 0 || (c ? window.Plotly.Plots.resize(o) : (l = !0, f._startEffects(), c = !0, f._render()));
	}).observe(o);
}
typeof window < "u" && (window.initChartBuilder = x, window.bootChartBuilder = S);
//#endregion
export { S as bootChartBuilder, x as initChartBuilder };
