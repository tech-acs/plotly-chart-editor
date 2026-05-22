# Plotly Chart Editor

A reactive chart builder for Laravel. This Livewire component gives your users a sidebar-driven editor to configure Plotly.js charts. It supports English, French, Portuguese, and Spanish.

- **Composer:** `uneca/plotly-chart-editor`
- **License:** MIT
- **Stack:** PHP 8.4 · Laravel 13 · Livewire 4 · Alpine 3 · Tailwind v4 · Plotly.js 3.x (peer dep)

---

## Requirements

- PHP 8.4+
- Laravel 13.x
- Livewire 4.x
- Plotly.js exposed as `window.Plotly` in your app bundle (peer dependency — not shipped by this package)

---

## Installation

```bash
composer require uneca/plotly-chart-editor
```

Publish the config and language files:

```bash
php artisan vendor:publish --tag="plotly-chart-editor-config"
php artisan vendor:publish --tag="plotly-chart-editor-translations"
php artisan vendor:publish --tag="plotly-chart-editor-assets"
```

Load Plotly.js **before** `@livewireScripts` (Livewire 4 bundles Alpine; do not load Alpine separately):

```html
<script src="https://cdn.plot.ly/plotly-3.5.0.min.js"></script>
<link rel="stylesheet" href="/vendor/plotly-chart-editor/plotly-chart-editor.css">
<script src="/vendor/plotly-chart-editor/plotly-chart-editor.js"></script>
```

---

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

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `dataSources` | `array` | **required** | Key-value pool of columns. Immutable after mount. |
| `data` | `array` | `[]` | Pre-populated traces (each with optional `meta.columnNames`). |
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
| `auto` | Debounced (~500ms) sync after each mutation. Shows "Saved ✓" on success. | Hidden |
| `hybrid` | Auto-sync AND a Save button for forced immediate sync. | Visible |

---

## Events

| Event | Payload | When |
|---|---|---|
| `chart-synced` | `{ data: array, layout: array }` | After every successful sync to Livewire. |

---

## Persisting charts

The `chart-synced` event fires on every successful sync. Use it to save the chart state to your database.

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

### Saving

Listen for the event in your Livewire component, then persist:

```php
use App\Models\Chart;
use Livewire\Attributes\On;

class ChartEditor extends \Livewire\Component
{
    public Chart $chart;

    #[On('chart-synced')]
    public function saveChart(array $data, array $layout): void
    {
        $this->chart->update([
            'traces' => $data,
            'layout' => $layout,
        ]);
    }
}
```

### Loading an existing chart

Pass the stored `traces` and `layout` back as props:

```blade
<livewire:plotly-editor
    :data-sources="$rawDataset"
    :data="$chart->traces"
    :layout="$chart->layout"
/>
```

### Full save/load example with `sync-mode="manual"`

Your page component loads the chart, passes it to the editor, and listens for saves:

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
        // Load your data sources however you normally do
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

        session()->flash('saved', 'Chart updated.');
    }

    public function render()
    {
        return view('livewire.edit-chart', [
            'chart' => $this->chart,
        ]);
    }
}
```

```blade
{{-- resources/views/livewire/edit-chart.blade.php --}}
<div>
    <h1>{{ $chart->title }}</h1>

    @if (session('saved'))
        <p class="text-green-600">{{ session('saved') }}</p>
    @endif

    <livewire:plotly-editor
        :data-sources="$rawDataset"
        :data="$chart->traces"
        :layout="$chart->layout"
        :sync-mode="'manual'"
    />
</div>
```

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
