# Plotly Chart Editor

A reactive chart builder for Laravel. This Livewire component gives your users a sidebar-driven editor to configure Plotly.js charts. It supports English, French, Portuguese, and Spanish.

- **Composer:** `uneca/plotly-chart-editor`
- **License:** MIT
- **Stack:** PHP 8.4 · Laravel 12 \|\| 13 · Livewire ^3.0 \|\| ^4.0 · Alpine 3 · Plotly.js 3.x (peer dep)

---

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Layout](#layout)
- [Props](#props)
- [Sync modes](#sync-modes)
- [Events](#events)
- [Persisting charts](#persisting-charts)
  - [Example migration](#example-migration)
  - [Option A — Host Livewire component](#option-a--host-livewire-component-wrapping)
  - [Option B — JS bridge](#option-b--js-bridge-to-a-sibling-livewire-component)
  - [Option C — Plain JS + HTTP](#option-c--plain-js--http-request)
  - [Option D — Native Laravel event](#option-d--native-laravel-event-listener)
  - [Option E — JS CustomEvent](#option-e--js-customevent)
  - [Option F — Alpine store](#option-f--alpine-store-direct-read)
  - [Loading an existing chart](#loading-an-existing-chart)
  - [Utility: getCompiledTraces](#utility-getcompiledtraces)
  - [Validation](#validation-validchartconfig-rule)
- [Publishing assets](#publishing-assets)
- [Theming](#theming)
- [Adding a new trace type profile](#adding-a-new-trace-type-profile)
- [Development](#development)
- [License](#license)

## Requirements

- PHP 8.4+
- Laravel 12.x or 13.x
- Livewire 3.x or 4.x
- Plotly.js exposed as `window.Plotly` in your app bundle (peer dependency — not shipped by this package)

---

## Installation

```bash
composer require uneca/plotly-chart-editor
```

Load Plotly.js before the package directives (choose one):

**CDN:**

```html
<script src="https://cdn.plot.ly/plotly-3.5.0.min.js"></script>
```

**or npm:**

```bash
npm install plotly.js-dist-min@^3.0.0
```

```js
// resources/js/app.js
import Plotly from 'plotly.js-dist-min';
window.Plotly = Plotly;
```

Then add these Blade directives to your layout's `<head>` after Plotly.js:

```blade
@plotlyChartEditorStyles
@plotlyChartEditorScripts

{{-- Livewire 4 bundles Alpine; do not load Alpine separately --}}
@livewireStyles
```

Place `@livewireScripts` before `</body>`.

## Quick start

```blade
<livewire:plotly-editor
    :data-sources="$rawDataset"
    :trace-types="['bar', 'line', 'scatter', 'pie', 'histogram']"
/>
```

Full control:

```blade
<livewire:plotly-editor
    :data-sources="$rawDataset"
    :data="$traces"
    :layout="$globalLayout"
    :config="$plotlyConfig"
    :trace-types="['bar', 'line', 'scatter']"
    :preload-schema="true"
    :sync-mode="'hybrid'"
    :show-export="true"
/>
```

---

## Layout

The editor fills its container. For a full-page editor without scrollbars, wrap `<livewire:plotly-editor>` in a flex container with `height: 100vh`:

**Inline style:**

```blade
<div style="height: 100vh; display: flex; flex-direction: column;">
    {{-- Optional title bar --}}
    <h1 style="flex-shrink: 0;">Edit chart</h1>

    <livewire:plotly-editor ... />
</div>
```

**Tailwind:**

```blade
<div class="h-screen flex flex-col">
    <h1 class="shrink-0">Edit chart</h1>

    <livewire:plotly-editor ... />
</div>
```

The `@plotlyChartEditorStyles` directive includes the inner flex rules — only the wrapper needs explicit sizing.

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `dataSources` | `array` | **required** | Key-value pool of columns. Immutable after mount. |
| `data` | `array` | `[]` | Pre-populated traces (each with optional `meta.columnNames` for column-referenced bindings). |
| `layout` | `array` | `[]` | Initial Plotly layout config. |
| `config` | `array` | `['responsive' => true]` | Plotly config flags. |
| `traceTypes` | `array` | `['bar']` | Enabled trace types; first is the default for new traces. |
| `preloadSchema` | `bool` | `true` | Load all enabled schema profiles on mount. |
| `syncMode` | `string` | `'manual'` | `manual` \| `auto` \| `hybrid` (see Sync modes below). |
| `showExport` | `bool` | `true` | Show the Export dropdown in the footer. |

### `dataSources` shape

```php
$dataSources = [
    'Country'    => ['Ghana', 'Kenya', 'Nigeria'],
    'Population' => [34, 55, 223],
];
```

All columns should be the same length. Length mismatches produce a non-blocking inline warning.

---

## Sync modes

| Mode | Behaviour | Save button |
|---|---|---|
| `manual` | Syncs only when the user clicks Save. | Visible |
| `auto` | Debounced (~500ms) sync after each mutation. Shows "Synced ✓" on success. | Hidden |
| `hybrid` | Auto-sync AND a Save button for forced immediate sync. | Visible |

---

## Events

| Event | Payload | When |
|---|---|---|
| `chart-synced` | `{ data: array, layout: array }` | After every successful sync (Livewire dispatch). |
| `ChartSynced` (native) | `$data` + `$layout` | Same moment, as a Laravel event class. |
| `plotly-chart-editor:synced` | `{ traces, layout }` | Same moment, as a browser CustomEvent. |
| `plotly-chart-editor:sync-failed` | `{ error }` | On sync failure, as a browser CustomEvent. |

> **Payload notes:** Traces in event payloads carry `meta.columnNames` (column references) but **not the resolved data arrays**. The actual data lives in `dataSources` on the server. To render a chart outside the editor, hydrate the traces by resolving `meta.columnNames` against your dataset — or use `getCompiledTraces()` to get Plotly-native traces with type aliases resolved and `meta` stripped. See "Loading an existing chart" below.

---

## Persisting charts

You have several options to save chart data from the editor to your backend.  
Choose the one that fits your app's architecture.

### Example migration

```php
Schema::create('charts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained();
    $table->string('title')->nullable();
    $table->json('traces');        // array of Plotly trace objects
    $table->json('layout');        // Plotly layout object
    $table->timestamps();
});
```

---

### Option A — Host Livewire component (wrapping)

Wrap `<livewire:plotly-editor>` in your own Livewire component. The Livewire `chart-synced` event bubbles up to parents, so `#[On]` works directly.

```php
use App\Models\Chart;
use Livewire\Attributes\On;

class EditChart extends \Livewire\Component
{
    public Chart $chart;
    public array $rawDataset;

    public function mount(Chart $chart): void
    {
        $this->chart = $chart;
        $this->rawDataset = [
            'Country'    => ['Ghana', 'Kenya', 'Nigeria'],
            'Population' => [34, 55, 223],
            'GDP'        => [72, 95, 446],
        ];
    }

    #[On('chart-synced')]
    public function onChartSynced(array $data, array $layout): void
    {
        $this->chart->update([
            'traces' => $data,
            'layout' => $layout,
        ]);
    }

    public function render()
    {
        return view('livewire.edit-chart');
    }
}
```

```blade
{{-- resources/views/livewire/edit-chart.blade.php --}}
<div style="height: 100vh; display: flex; flex-direction: column;">
    <h1 style="flex-shrink: 0;">{{ $chart->title }}</h1>

    <livewire:plotly-editor
        :data-sources="$rawDataset"
        :data="$chart->traces"
        :layout="$chart->layout"
        :sync-mode="'hybrid'"
    />
</div>
```

**Pros:** Clean PHP-only integration, easy to re-render other page parts.  
**Cons:** Requires a Livewire component just to wrap the editor.

---

### Option B — Listen directly from a sibling component

No wrapping needed. `PlotlyEditor` dispatches `chart-synced` as a browser event,
so any other Livewire component on the page can listen and react.

```blade
{{-- Parent view --}}
<livewire:plotly-editor :data-sources="$data" />
<livewire:save-button />
```

**Frontend (JS):**

```blade
{{-- resources/views/livewire/save-button.blade.php --}}
@script
<script>
Livewire.on('chart-synced', ({ data, layout }) => {
    // Persist $data and $layout however you like
});
</script>
@endscript
```

**Backend (PHP):** Use the `#[On]` attribute on a method in the sibling
component — no JS needed at all.

```php
use Livewire\Attributes\On;
use Livewire\Component;

class SaveButton extends Component
{
    #[On('chart-synced')]
    public function persist(array $data, array $layout): void
    {
        // Persist $data and $layout
    }

    public function render(): View
    {
        return view('livewire.save-button');
    }
}
```

**Pros:** No wrapping — components stay independent. Backend approach needs no JS.
**Cons:** The sibling component must register a listener (JS or `#[On]`).

---

### Option C — Plain JS + HTTP request

No Livewire component at all. The editor lives in a regular Blade view; save via `fetch`.

```blade
{{-- Not inside a Livewire component — a plain Blade view --}}
@extends('layouts.app')

@section('content')
<livewire:plotly-editor :data-sources="$countries" sync-mode="hybrid" />
@endsection

@push('scripts')
<script>
Livewire.on('chart-synced', ({ data, layout }) => {
    fetch('/charts/{{ $chart->id }}/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': '{{ csrf_token() }}' },
        body: JSON.stringify({ traces: data, layout }),
    });
});
</script>
@endpush
```

**Pros:** Zero Livewire boilerplate in the host.  
**Cons:** You handle CSRF, validation, and routing yourself.

---

### Option D — Native Laravel event listener

The `ChartSynced` event class is dispatched alongside `chart-synced`. Register a listener.

```php
// App\Providers\EventServiceProvider.php
protected $listen = [
    \Uneca\PlotlyChartEditor\Events\ChartSynced::class => [
        \App\Listeners\SaveChart::class,
    ],
];
```

```php
// App\Listeners\SaveChart.php
class SaveChart
{
    public function handle(\Uneca\PlotlyChartEditor\Events\ChartSynced $event): void
    {
        // $event->data, $event->layout
        // Save to database, trigger a job, etc.
    }
}
```

**Pros:** Decoupled from Livewire entirely. Can be queued.  
**Cons:** Requires registering a listener (one-time setup).

---

### Option E — JS CustomEvent

The package dispatches `plotly-chart-editor:synced` on `window`. Listen from any JS framework.

```js
window.addEventListener('plotly-chart-editor:synced', (e) => {
    const { traces, layout } = e.detail;
    // Send to backend, update a store, etc.
});
window.addEventListener('plotly-chart-editor:sync-failed', (e) => {
    console.error('Chart sync failed:', e.detail.error);
});
```

**Pros:** Framework-agnostic. Works with React, Vue, vanilla JS.  
**Cons:** Manual HTTP wiring.

---

### Option F — Alpine store direct read

Read chart state directly from `Alpine.store('chartBuilder')` at any time.

```blade
<livewire:plotly-editor :data-sources="$data" />
<button x-data @click="fetch('/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        traces: Alpine.store('chartBuilder').traces,
        layout: Alpine.store('chartBuilder').layout,
    }),
})">Save</button>
```

**Pros:** Full control, no event wiring.  
**Cons:** You must handle dirty-state tracking yourself.

---

### Loading an existing chart

The editor syncs traces in **reference form** — each trace carries `meta.columnNames` (e.g. `{'x': 'Country', 'y': 'Population'}`) instead of raw data arrays. The actual column data lives in `dataSources`.

Pass stored traces and layout back to the editor:

```blade
<livewire:plotly-editor
    :data-sources="$rawDataset"
    :data="$chart->traces"
    :layout="$chart->layout"
/>
```

The editor's Alpine store resolves `meta.columnNames` against `dataSources` at render time via `compileTrace()`, so the chart renders with the correct data.

For read-only display (outside the editor), resolve the bindings yourself or use `getCompiledTraces()` (see below).

---

### Utility: `getCompiledTraces()`

When serving stored traces to Plotly directly (outside the editor), some type aliases need resolving (`area` → `scatter`, `line` → `scatter`). Call this method on the component:

```php
$compiled = $component->getCompiledTraces();
// e.g. ['type' => 'area', ...] → ['type' => 'scatter', ...]
```

---

### Validation: `ValidChartConfig` rule

Validate incoming chart payloads in your controllers:

```php
use Uneca\PlotlyChartEditor\Rules\ValidChartConfig;

$request->validate([
    'chart' => ['required', new ValidChartConfig],
]);
```

---

## Publishing assets

None of the following publishes are required for the editor to work. Use them only if you need to override defaults.

```bash
php artisan vendor:publish --tag="plotly-chart-editor-config"       # trace type profiles
php artisan vendor:publish --tag="plotly-chart-editor-translations" # language strings
php artisan vendor:publish --tag="plotly-chart-editor-assets"       # static JS/CSS to public/
```

- **Config:** Edit `config/plotly-chart-editor.php` to add or modify trace type profiles (see [Adding a new trace type profile](#adding-a-new-trace-type-profile)).
- **Translations:** Override any string in `resources/lang/vendor/plotly-chart-editor`.
- **Assets:** By default JS/CSS are served via package routes. Publishing to `public/vendor/` bypasses the PHP route for a minor production perf gain.

---

## Theming

All visual tokens are CSS custom properties declared in `:root`. Override them in your own stylesheet:

```css
/* my-app.css */
:root {
    --plotly-editor-accent:       #7c3aed;  /* purple accent */
    --plotly-editor-sidebar-w:    320px;    /* narrower sidebar */
    --plotly-editor-bg:           #1e1e2e;  /* dark background */
    --plotly-editor-surface:      #2a2a3e;
    --plotly-editor-border:       #44446a;
    --plotly-editor-text:         #cdd6f4;
    --plotly-editor-text-muted:   #6c7086;
}
```

### Full token reference

| Token | Default | Purpose |
|---|---|---|
| `--plotly-editor-bg` | `#ffffff` | Root and canvas background |
| `--plotly-editor-surface` | `#f8fafc` | Sidebar and fold-header background |
| `--plotly-editor-border` | `#e2e8f0` | All borders and dividers |
| `--plotly-editor-text` | `#0f172a` | Primary text |
| `--plotly-editor-text-muted` | `#64748b` | Labels and secondary text |
| `--plotly-editor-accent` | `#2563eb` | Active states, Save button, focus ring |
| `--plotly-editor-accent-fg` | `#ffffff` | Text on accent-colored surfaces |
| `--plotly-editor-warning` | `#d97706` | Warning badge and inline messages |
| `--plotly-editor-danger` | `#dc2626` | Delete button hover |
| `--plotly-editor-success` | `#16a34a` | "Saved ✓" and "Copied ✓" messages |
| `--plotly-editor-radius` | `6px` | Border radius for controls and folds |
| `--plotly-editor-sidebar-w` | `380px` | Sidebar width |
| `--plotly-editor-font` | `system-ui, sans-serif` | Editor font stack |

---

## Adding a new trace type profile

1. Open `config/plotly-chart-editor.php`.
2. Add an entry under `profiles`:

```php
'bubble' => [
    'groups' => [
        'Data' => [
            'label'  => 'Data',
            'fields' => [
                ['key' => 'x',           'label' => 'X',    'type' => 'column'],
                ['key' => 'y',           'label' => 'Y',    'type' => 'column'],
                ['key' => 'marker.size', 'label' => 'Size', 'type' => 'column'],
            ],
        ],
    ],
],
```

3. Pass `'bubble'` in `traceTypes`:

```blade
<livewire:plotly-editor
    :data-sources="$data"
    :trace-types="['bar', 'scatter', 'bubble']"
/>
```

Pre-built types are loaded on mount. Exotic types are lazy-loaded on first use via a single Livewire request, then cached in the Alpine store for the remainder of the session.

---

## Development

```bash
composer install && npm install
vendor/bin/pest          # run tests
vendor/bin/pint          # fix code style
npm run build            # build assets
vendor/bin/testbench serve  # start workbench dev server
```

Browser tests are gated behind `--group=browser` and require a browser driver.

---

## License

MIT — see [LICENSE.md](LICENSE.md).
