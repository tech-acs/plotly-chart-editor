# Plotly Chart Editor

A reusable Laravel package providing a reactive visual chart builder Livewire component that produces valid Plotly.js configurations.

- **Composer:** `uneca/plotly-chart-editor`
- **License:** MIT
- **Stack:** PHP 8.4 · Laravel 13 · Livewire 4 · Alpine 3 · Tailwind v4 · Plotly.js (peer dep)

## Requirements

- PHP 8.4+
- Laravel 13.x
- Livewire 4.x
- Plotly.js exposed as `window.Plotly` in your app bundle (peer dependency — not shipped by this package)

## Installation

```bash
composer require uneca/plotly-chart-editor
```

Publish the config and language files:

```bash
php artisan vendor:publish --tag="plotly-chart-editor-config"
php artisan vendor:publish --tag="plotly-chart-editor-translations"
```

## Basic usage

```blade
<livewire:plotly-editor
    :data-sources="$rawDataset"
    :trace-types="['bar', 'line', 'scatter', 'pie', 'histogram']"
/>
```

Full API:

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

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `dataSources` | `array` | **required** | Key-value pool of columns. Immutable after mount. |
| `data` | `array` | `[]` | Pre-populated traces. |
| `layout` | `array` | `[]` | Initial Plotly layout config. |
| `config` | `array` | `['responsive' => true]` | Plotly config flags. |
| `traceTypes` | `array` | `['bar']` | Enabled trace types. |
| `preloadSchema` | `bool` | `true` | Load all enabled schema profiles on mount. |
| `syncMode` | `string` | `'manual'` | `manual` \| `auto` \| `hybrid` |
| `showExport` | `bool` | `true` | Show export buttons in footer. |

## Sync modes

| Mode | Behaviour |
|---|---|
| `manual` | Syncs only when the user clicks Save. |
| `auto` | Debounced (~500ms) sync after each mutation. |
| `hybrid` | Auto-sync AND a Save button for immediate sync. |

## Events

| Event | Payload | When |
|---|---|---|
| `chart-synced` | `{ data, layout }` | After every successful sync to Livewire. |

## Development

```bash
composer install
npm install
vendor/bin/pest        # run tests
vendor/bin/pint        # fix code style
npm run build          # build assets
```
