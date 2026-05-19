# Changelog

All notable changes to `plotly-chart-editor` will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.0] — 2026-05-19

Initial public release.

### Added

**Core component**
- `livewire:plotly-editor` Livewire 4 component with full two-column layout (380px sidebar + Plotly canvas).
- Alpine 3 store (`Alpine.store('chartBuilder')`) managing traces, layout, config, warnings, dirty state, and sync status.
- Schema-driven field rendering via configurable profiles in `config/plotly-chart-editor.php`.
- Five built-in schema profiles: `bar`, `scatter`, `line` (alias → scatter), `pie`, `histogram`.
- Lazy-loading of exotic trace types via `$wire.getSchemaProfile(type)` with client-side caching.

**Multi-trace management**
- `addTrace`, `removeTrace`, `duplicateTrace`, `moveTraceUp`, `moveTraceDown`, `setTraceType`.
- Type switching prunes irrelevant fields and preserves `meta`, `name`, `type`.
- Native `confirm()` delete confirmation.

**Folds UI**
- Three collapsible accordion folds: Traces, Axes, Canvas & Titles.
- `<x-plotly-chart-editor::fold>` anonymous Blade component.
- Four reusable primitive components: `font`, `line`, `marker`, `margin`.
- `getPath()` / `setPath()` store helpers for dot-notation field keys (`marker.color` etc.).

**Conditional visibility**
- `xshow` expressions on schema groups and fields evaluated via `new Function()` with injected helpers: `trace`, `traceType`, `hasMarkerSupport()`, `hasFillSupport()`.

**Sync modes**
- `manual`: sync on explicit Save button click.
- `auto`: 500ms debounced auto-sync after every mutation; transient "Saved ✓" indicator.
- `hybrid`: auto-sync + Save button for forced immediate sync.
- `syncFromAlpine()` with strict JSON validation and `meta` stripping before server storage.
- `chart-synced` event dispatched with `{ data, layout }` after every successful sync.

**Validation**
- Column-length mismatch detection (`LENGTH_MISMATCH` code) runs each debounced tick.
- Inline warning beneath offending column selector.
- Footer aggregate badge: "⚠ N warnings".

**Export**
- `exportJSON()` — downloads `chart.json` with meta stripped, ready for `Plotly.newPlot()`.
- `exportImage('png'|'svg')` — uses `Plotly.toImage()` and triggers download.
- `copyConfig()` — copies JSON to clipboard; shows transient "Copied ✓".
- Export dropdown visible when `showExport=true` (default).

**Viewport gate**
- `ResizeObserver` on `.chart-builder` sets `_tooSmall` flag when width < 1024px.
- Sidebar and canvas hidden; placeholder message shown; `Plotly.purge()` called.
- Editor re-mounts automatically when viewport grows back above 1024px.

**Theming**
- Full CSS variable theme (`--plotly-editor-*`) declared in `:root`.
- All structural BEM classes (`chart-builder__*`, `plotly-primitive`) documented.
- No hardcoded colors in any component.

**i18n**
- All user-facing strings in `resources/lang/en/plotly-chart-editor.php`.
- Publishable via `vendor:publish --tag="plotly-chart-editor-translations"`.

### Requirements

- PHP 8.4+
- Laravel 13.x
- Livewire 4.x
- Plotly.js 3.x (peer dependency — not bundled)
- Alpine.js 3.x (bundled with Livewire 4 — do not load separately)
