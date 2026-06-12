# TODO: Schema-drive Folds 2–4 (Axes, Canvas, Annotations)

## Goal

Make the three hardcoded folds (Axes, Canvas & Titles, Annotations) schema-driven from config files, matching how the Traces fold already works.

## Why

- Currently only the Traces fold (`config/plotly-chart-editor.php` → `profiles`) is schema-driven.
- Axes (`axis-panel.blade.php`, 314 lines), Canvas (`plotly-editor.blade.php` lines 442–812, ~370 lines), and Annotations (lines 817–1271, ~360 lines) are hardcoded Blade markup.
- Consumers cannot customize them without editing Blade files.

## Approach

### Config file layout

Split the single config into 4 files (one per fold):

```
config/
├── plotly-chart-editor.php              # profiles, aliases, sync-mode (unchanged)
├── plotly-chart-editor-axes.php         # xaxis + yaxis groups/fields
├── plotly-chart-editor-canvas.php       # canvas groups/fields
└── plotly-chart-editor-annotations.php  # text / shape / image groups/fields
```

Each new file uses the same group/field schema as the existing `profiles` (keys: `groups` → `label`, `fields` → `type`, `key`, `label`, `dflt`, `values`, `xshow`, `min`, `max`, `step`).

**Service provider** (`PlotlyChartEditorServiceProvider.php`):
```php
// Change this:
->hasConfigFile()
// To this:
->hasConfigFile([
    'plotly-chart-editor',
    'plotly-chart-editor-axes',
    'plotly-chart-editor-canvas',
    'plotly-chart-editor-annotations',
])
```

**Livewire component** (`src/Livewire/PlotlyEditor.php`):
Add 3 new public properties (`$axesSchemas`, `$canvasSchemas`, `$annotationSchemas`), load them in `mount()` via `config()`, pass through label-translation (extract `translateProfile()` from `SchemaProfileLoader` into a shared helper/trait).

**Payload** (`data-chart-builder-payload` in Blade): include the new schemas alongside `schemaProfiles`.

All 4 config files should use the same tag for `vendor:publish` so consumers run one command to publish all.

### Shared rendering component

**New:** `resources/views/components/schema-fields.blade.php`

Extracts the field-rendering `x-if` chain (currently duplicated between trace-groups and layout-groups in Fold 1) into a reusable component:

```blade
@props(['schema', 'context', 'store'])
{{--
  schema:  Alpine expression evaluating to array of groups (same shape as _profile.groups)
  context: Alpine path string, e.g. "store.layout.xaxis"
  store:   Alpine store name, e.g. "store"
--}}
```

Supports all existing field types: `column`, `enumerated`, `color`, `range`, `number`, `text`, `boolean`. Also add 2 new field types for primitives:
- `'font'` → renders `<x-plotly-chart-editor::primitives.font>`
- `'margin'` → renders `<x-plotly-chart-editor::primitives.margin>`

### Fold refactors

1. **Axes fold (Fold 2):** Replace `axis-panel.blade.php` content with a single `<x-plotly-chart-editor::schema-fields>` call. X-axis and Y-axis have separate schemas (their `side` options differ: bottom/top vs left/right).

2. **Canvas & Titles fold (Fold 3):** Replace hardcoded groups (Title, Margins, Backgrounds, Defaults, Legend, Hover) with `<x-plotly-chart-editor::schema-fields>`. Conditional legend fields use `field.xshow` (same as existing).

3. **Annotations fold (Fold 4):** Replace the three `<template x-if="ann._plotlyType === 'text'|'shape'|'image'">` blocks with per-type `<x-plotly-chart-editor::schema-fields>` calls, keyed to the appropriate annotation type schema.

### Edge cases to handle

| Case | Solution |
|---|---|
| Axis `side` differs by axis | Separate xaxis/yaxis schemas in config |
| Axis `mirror` field (truthy-string values) | Special `'enumerated'` with true/false/ticks/all/allticks; use existing `getPath/setPath` |
| Annotation arrow fields (`x-show="showarrow"`) | `field.xshow` expression |
| `column` type (trace-specific) | Simply omit from non-trace schemas |
| `font` / `margin` primitives | New `'font'` / `'margin'` field types in the renderer |

## What this enables

- Consumers `vendor:publish` → customize any fold purely in config, no Blade edits
- New trace types = config addition only
- New canvas/axis/annotation fields = config addition only
- Each fold's config file is small and focused (~200–370 lines)
