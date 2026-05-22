# Annotations — Implementation Plan

## Overview

Add a Fold 4 to the chart editor for managing Plotly annotations (text labels with arrows, shapes, and images). Follows the same **type-selector + cards** pattern that Transforms used before removal.

---

## Data Model

All annotations live in a single unified array `layout._annotations`. Each item carries a `_plotlyType` discriminator:

- `'text'` — Plotly text annotations (`layout.annotations[]`)
- `'shape'` — Plotly shapes (`layout.shapes[]`)
- `'image'` — Plotly images (`layout.images[]`)

On render and sync, `_annotations` is compiled into Plotly's native separate layout keys (`annotations`, `shapes`, `images`) and the `_plotlyType` field is stripped.

### Scaffold defaults

**Text:**
```js
{
    _plotlyType: 'text',
    text: 'new text',
    font: { family: 'Arial', size: 14, color: '#000000' },
    textangle: 0,
    align: 'center',
    valign: 'middle',
    showarrow: true,
    arrowcolor: '#444444',
    arrowhead: 1,
    arrowwidth: 1,
    arrowsize: 1,
    ax: -50,
    ay: -50,
    x: 0.5,
    y: 0.5,
    xref: 'paper',
    yref: 'paper',
    xanchor: 'auto',
    yanchor: 'auto',
    bgcolor: '',
    bordercolor: '#444444',
    borderwidth: 1,
    borderpad: 1,
    opacity: 1,
}
```

**Shape:**
```js
{
    _plotlyType: 'shape',
    type: 'rect',
    x0: 0.1, y0: 0.1, x1: 0.5, y1: 0.5,
    xref: 'paper', yref: 'paper',
    line: { color: '#444444', width: 2, dash: 'solid' },
    fillcolor: '#1f77b4',
    layer: 'above',
    opacity: 0.7,
}
```

**Image:**
```js
{
    _plotlyType: 'image',
    source: '',
    x: 0.5, y: 0.5, sizex: 0.2, sizey: 0.2,
    xref: 'paper', yref: 'paper',
    xanchor: 'left', yanchor: 'top',
    sizing: 'contain',
    layer: 'above',
    opacity: 1,
}
```

---

## Alpine Store Changes (`resources/js/plotly-chart-editor.js`)

### Module-level additions

| Variable | Purpose |
|---|---|
| `_deleteAnnotationConfirmMsg` | Confirm message for annotation deletion (like `_deleteConfirmMsg`) |

### `LAYOUT_DEFAULTS`

Add `_annotations: []` so the array always exists for `x-for` bindings.

### Function signature changes

```js
function initChartBuilder(payload, plotlyMissingMessage, deleteConfirmMessage, deleteAnnotationConfirmMessage)
function bootChartBuilder(payload, plotlyMissingMessage, deleteConfirmMessage, deleteAnnotationConfirmMessage, canvasEl, wire)
```

### Store methods

**`addAnnotation(type)`**
Pushes the scaffold matching `type` ('text' | 'shape' | 'image') onto `this.layout._annotations`. Creates the array if missing. Calls `this._scheduleRender()`.

**`removeAnnotation(idx)`**
Returns early if array missing. `window.confirm()` with `_deleteAnnotationConfirmMsg`. Splices item. Calls `_scheduleRender()`.

**`moveAnnotation(from, to)`**
Deep-clones item at `from`, splices it out, splices clone in at `to`. Guards bounds. Calls `_scheduleRender()`.

**`moveAnnotationUp(idx)`** / **`moveAnnotationDown(idx)`**
Thin wrappers over `moveAnnotation()`.

**`_compileAnnotations(layout)`** (new helper)
Given a layout object (deep-cloned), reads `layout._annotations`, groups items by `_plotlyType` into Plotly-native arrays, assigns them to `layout.annotations` / `layout.shapes` / `layout.images`, and deletes `layout._annotations`. Called by both `_render()` and `syncToBackend()`.

### `_render()` changes

After `const layout = deepClone(this.layout)` and before `layout.uirevision = structuralSig`, call `this._compileAnnotations(layout)`.

### `syncToBackend()` changes

In the wire payload construction, call `_compileAnnotations` on the deep-cloned layout so the consumer receives Plotly-native arrays.

---

## Blade View Changes (`resources/views/livewire/plotly-editor.blade.php`)

### `x-init`

Pass the new confirm message:
```blade
var deleteAnnMsg = @js(__('plotly-chart-editor::plotly-chart-editor.confirmations.delete_annotation'));
window.bootChartBuilder(payload, missingMsg, deleteMsg, deleteAnnMsg, canvas, $wire);
```

### Fold 4 (added after Fold 3, ~line 718)

```
▾ ANNOTATIONS (closed by default)
  ┌──────────────────────────────────────────────────┐
  │  [+ Add annotation ▾]                            │
  └──────────────────────────────────────────────────┘

  [Card 0]  "new text"        [↑] [↓] [×]
  │  ├── Text section
  │  │    text (input), font (primitive), angle (number),
  │  │    align (select: left/center/right),
  │  │    valign (select: top/middle/bottom)
  │  ├── Arrow section
  │  │    showarrow (checkbox), width (number),
  │  │    color (color), arrowhead (select 0-8),
  │  │    size (number step=0.1), Tail X (number), Tail Y (number)
  │  ├── H. Position section
  │  │    X (range -2..3), X anchor (select), X ref (select)
  │  └── V. Position section
  │       Y (range -2..3), Y anchor (select), Y ref (select)
  │  └── Box section
  │       BG color, Border color, Border width,
  │       Border pad, Opacity (range 0..1)

  [Card 1]  "rect"  (shape)   [↑] [↓] [×]
  │  ├── Shape section
  │  │    type (select: rect/circle/line),
  │  │    X0, Y0, X1, Y1 (number)
  │  ├── Line section
  │  │    color (color), width (number, default 2), dash (select)
  │  ├── Fill section
  │  │    fillcolor (color), opacity (range 0..1)
  │  ├── Layer section
  │  │    layer (select: above/below)
  │  └── Reference section
  │       X ref (select), Y ref (select)

  [Card 2]  "image"           [↑] [↓] [×]
  │  ├── Source section
  │  │    URL (text), X (number), Y (number),
  │  │    Width (number), Height (number)
  │  ├── Display section
  │  │    sizing (select: fill/contain/stretch),
  │  │    X anchor (select), Y anchor (select),
  │  │    layer (select: above/below),
  │  │    opacity (range 0..1)
  │  └── Reference section
  │       X ref (select), Y ref (select)

  (empty state: "+ Add annotation →" when none exist)
```

**Implementation details:**
- Type-selector dropdown uses local `x-data` with `_annotationToAdd` (same as transforms' `_transformToAdd`)
- Cards use `x-for` over `store.layout._annotations`
- Per-type fields use `template x-if="ann._plotlyType === 'text'"` etc.
- The add `<select>` resets to `''` after adding (same as transforms)
- Delete button uses `window.confirm()` via `Alpine.store('chartBuilder').removeAnnotation(idx)`

---

## CSS Additions (`resources/css/plotly-chart-editor.css`)

```css
/* ── Annotation cards ────────────────────────────── */
.chart-builder__annotation-card {
    border: 1px solid var(--plotly-editor-border);
    border-radius: var(--plotly-editor-radius);
    padding: 0.5rem;
    margin-top: 0.5rem;
}

.chart-builder__annotation-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--plotly-editor-border);
    margin-bottom: 0.5rem;
}

.chart-builder__annotation-card__title {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--plotly-editor-text);
}

.chart-builder__annotation-card__actions {
    display: flex;
    gap: 0.25rem;
}

.chart-builder__annotation-card__fields {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
```

---

## Language Keys

### English (`resources/lang/en/plotly-chart-editor.php`)

```php
// confirmations
'delete_annotation' => 'Delete this annotation? This cannot be undone.',

// ui
'fold_annotations' => 'Annotations',
'add_annotation' => '+ Add annotation',
'annotation_text' => 'Text',
'annotation_shape' => 'Shape',
'annotation_image' => 'Image',

// groups
'annotation_text_section' => 'Text',
'annotation_arrow' => 'Arrow',
'annotation_box' => 'Box',
'annotation_shape_section' => 'Shape',
'annotation_shape_line' => 'Line',
'annotation_shape_fill' => 'Fill',
'annotation_source' => 'Source',
'annotation_display' => 'Display',
'annotation_reference' => 'Reference',
'annotation_h_position' => 'Horizontal position',
'annotation_v_position' => 'Vertical position',

// fields (annotation)
'annotation_text' => 'Text',
'annotation_textangle' => 'Angle',
'annotation_align' => 'Align',
'annotation_valign' => 'V. align',
'annotation_showarrow' => 'Show arrow',
'annotation_arrowhead' => 'Arrowhead',
'annotation_arrowsize' => 'Arrow size',
'annotation_arrowwidth' => 'Arrow width',
'annotation_arrowcolor' => 'Arrow color',
'annotation_ax' => 'Tail X',
'annotation_ay' => 'Tail Y',
'annotation_x' => 'X',
'annotation_y' => 'Y',
'annotation_xanchor' => 'X anchor',
'annotation_yanchor' => 'Y anchor',
'annotation_xref' => 'X ref',
'annotation_yref' => 'Y ref',
'annotation_bgcolor' => 'BG color',
'annotation_bordercolor' => 'Border color',
'annotation_borderwidth' => 'Border width',
'annotation_borderpad' => 'Border pad',
'annotation_shape_type' => 'Type',
'annotation_x0' => 'X start',
'annotation_y0' => 'Y start',
'annotation_x1' => 'X end',
'annotation_y1' => 'Y end',
'annotation_source' => 'Source URL',
'annotation_sizex' => 'Width',
'annotation_sizey' => 'Height',
'annotation_sizing' => 'Sizing',
'annotation_layer' => 'Layer',
'annotation_dash' => 'Dash',
'annotation_align_left' => 'Left',
'annotation_align_center' => 'Center',
'annotation_align_right' => 'Right',
'annotation_valign_top' => 'Top',
'annotation_valign_middle' => 'Middle',
'annotation_valign_bottom' => 'Bottom',
'annotation_sizing_fill' => 'Fill',
'annotation_sizing_contain' => 'Contain',
'annotation_sizing_stretch' => 'Stretch',
'annotation_layer_above' => 'Above',
'annotation_layer_below' => 'Below',
'annotation_ref_paper' => 'Paper',
'annotation_shape_type_rect' => 'Rectangle',
'annotation_shape_type_circle' => 'Circle',
'annotation_shape_type_line' => 'Line',
```

### French / Portuguese / Spanish

Same key structure, translated values.

---

## New Test File (`tests/Feature/AnnotationsTest.php`)

Pest tests covering:

| Test | What it verifies |
|---|---|
| `adds a text annotation` | `addAnnotation('text')` pushes scaffold with correct type, text, defaults |
| `adds a shape annotation` | `addAnnotation('shape')` pushes scaffold with `type:'rect'`, `fillcolor` |
| `adds an image annotation` | `addAnnotation('image')` pushes scaffold with `source`, `sizing` |
| `removes an annotation` | confirm + splice, array length decreases |
| `reorders annotations` | `moveAnnotationUp`/`Down` swaps items correctly |
| `empty state renders helper text` | No annotations → `"+ Add annotation →"` in HTML |
| `renders annotation cards in the component HTML` | Cards with `chart-builder__annotation-card` present |
| `per-type fields render for text` | Text input, font, arrow checkbox in HTML |
| `per-type fields render for shape` | Shape type select, x0/x1/y0/y1 fields in HTML |
| `per-type fields render for image` | Source URL input, sizing select in HTML |
| `annotations compile to Plotly-native layout` | `_compileAnnotations` splits `_annotations` into `annotations/shapes/images`, strips `_plotlyType` |

---

## Status: ✅ IMPLEMENTED (2026-05-22)

All 8 files modified. All 64 tests pass (10 annotation-specific). Pint clean. Build succeeds.

---

## Files to modify (summary)

| File | Change |
|---|---|
| `resources/js/plotly-chart-editor.js` | Add `LAYOUT_DEFAULTS._annotations`, `_deleteAnnotationConfirmMsg`, methods, helper, update `_render` and `syncToBackend`, update `initChartBuilder`/`bootChartBuilder` signatures |
| `resources/views/livewire/plotly-editor.blade.php` | Update `x-init` with delete annotation message, add Fold 4 after line 718 |
| `resources/css/plotly-chart-editor.css` | Add `.chart-builder__annotation-card*` rules |
| `resources/lang/en/plotly-chart-editor.php` | Add ~50 translation keys |
| `resources/lang/fr/plotly-chart-editor.php` | Mirror English keys |
| `resources/lang/pt/plotly-chart-editor.php` | Mirror English keys |
| `resources/lang/es/plotly-chart-editor.php` | Mirror English keys |
| `tests/Feature/AnnotationsTest.php` | New file, ~11 tests |

## Does NOT change

- `config/plotly-chart-editor.php` — no profile changes
- `src/PlotlyEditor.php` — no new Livewire properties
- `PlotlyChartEditorServiceProvider.php` — no registration changes
- `dist/` — built via `npm run build` after JS changes
