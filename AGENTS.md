# AGENTS.md — Maintenance Guide

## Package identity

| Field | Value |
|---|---|
| Composer name | `uneca/plotly-chart-editor` |
| PHP namespace | `Uneca\PlotlyChartEditor` |
| Service provider | `Uneca\PlotlyChartEditor\PlotlyChartEditorServiceProvider` |
| Config key | `plotly-chart-editor` |
| Livewire component | `plotly-editor` (registered with full FQCN) |
| Blade prefix | `plotly-chart-editor::` |
| Translation namespace | `plotly-chart-editor` |
| License | MIT |

## Pinned versions

| Tool | Version |
|---|---|
| PHP | **8.4** |
| Laravel | **13.x** |
| Livewire | **4.x** |
| Alpine.js | **3.x** |
| Tailwind CSS | **v4** (CSS-first, no `tailwind.config.js`) |
| Plotly.js | **peer dependency** — consumer exposes `window.Plotly` |
| Pest | **4.x** |
| Pint | latest |

## Commands cheat sheet

| Need | Command |
|---|---|
| Run all tests | `vendor/bin/pest` |
| Run one test file | `vendor/bin/pest tests/Feature/MountTest.php` |
| Filter tests | `vendor/bin/pest --filter="syncs from alpine"` |
| Fix code style | `vendor/bin/pint` |
| Check code style | `vendor/bin/pint --test` |
| Build JS assets | `npm run build` |
| Dev assets watch | `npm run dev` |
| Install deps | `composer install && npm install` |

## Architecture overview

The package provides a `<livewire:plotly-editor>` component with a sidebar + Plotly.js canvas layout. The sidebar is composed of accordion **folds**, each containing schema-driven fields grouped by concern (Data, Axes, Legend, Hover, Text, etc.).

Key architectural decisions:

- **Single Alpine store** (`Alpine.store('chartBuilder')`) holds all client-side state. State mutations go through store methods, not direct property assignment (except `x-model` two-way bindings).
- **Schema-driven rendering.** Trace-type profiles are defined in `config/plotly-chart-editor.php`. Each profile declares groups of fields. A generic `schema-field` Blade component renders fields based on their `type` (column, number, color, select, etc.).
- **Render strategy.** Structural changes (traces added/removed, type changes) use `Plotly.purge()` + `Plotly.newPlot()`. Styling changes use `Plotly.react()`. Tracked via `_lastStructuralSig`.
- **Sync modes.** Three modes: `auto` (debounced 50ms), `manual` (Save button), `hybrid` (auto + Save button). All sync calls go through `syncToBackend()` store method — never inline `$wire.*()` calls.
- **Deep copies** use `JSON.parse(JSON.stringify(toRaw(value)))` — not `structuredClone()`, because `Alpine.raw()` only unwraps the top proxy level.
- **No facades** inside the Livewire component for things that have constructor-injectable services.

## Code conventions

### PHP
- Strict types: `declare(strict_types=1);` at the top of every file.
- PHP 8.4: typed properties, constructor promotion, `readonly` where appropriate.
- Wrap user-facing strings with `__('plotly-chart-editor.…')`.

### Blade
- Use `<x-plotly-chart-editor::name>` for package components.
- `@props([...])` at the top of every component.
- `x-show` / `x-bind` / `x-model` on dedicated wrapping elements when readability suffers.
- No inline `<style>` in Blade.

### JavaScript / Alpine
- All JS in `resources/js/plotly-chart-editor.js` (single file).
- Debounce render with a 50ms timer using `setTimeout`/`clearTimeout`. No lodash.
- Structural changes (`purge`+`newPlot`) vs styling changes (`react`) via `_lastStructuralSig`.

### CSS
- Tailwind v4 with `@theme` block in `resources/css/plotly-chart-editor.css`.
- Theme tokens use `--plotly-editor-*` prefix. See `README.md` for the full reference.
- BEM class names: `chart-builder__fold`, `plotly-primitive`, etc.
- No `!important` unless commented with rationale.

### Tests
- Pest 4 syntax. Use `it('does X', ...)` not `test('it does X', ...)`.
- Feature tests in `tests/Feature/`. Unit tests in `tests/Unit/`.
- Livewire tests: `Livewire::test(PlotlyEditor::class, [...])`.
- Browser-dependent tests marked with `->group('browser')` and skipped by default.

## Guardrails (do not do without asking)

- Add a new composer or npm dependency.
- Change PHP, Laravel, Livewire, Alpine, Tailwind, or Plotly versions.
- Use `dd()`, `dump()`, `var_dump()`, or `console.log()` in committed code.
- Skip writing tests because "it's a UI thing."
- Modify files outside the package scope (`.github/`, `.git/`, `vendor/`, `node_modules/`).

## Working practices

- Run `vendor/bin/pest` after any non-trivial change.
- Run `vendor/bin/pint --test` before declaring done.
- Use `workbench/fixtures/african-countries.json` for test data.
