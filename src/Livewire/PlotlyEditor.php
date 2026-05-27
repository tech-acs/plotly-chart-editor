<?php

declare(strict_types=1);

namespace Uneca\PlotlyChartEditor\Livewire;

use Illuminate\View\View;
use InvalidArgumentException;
use Livewire\Component;
use Uneca\PlotlyChartEditor\Events\ChartSynced;
use Uneca\PlotlyChartEditor\Support\SchemaProfileLoader;

class PlotlyEditor extends Component
{
    /** @var array<string, array<mixed>> Key-value pool of columns for data binding. Immutable after mount. */
    public array $dataSources = [];

    /** @var array<int, array<mixed>> Pre-populated traces (each with optional meta.columnNames). */
    public array $data = [];

    /** @var array<string, mixed> Initial layout configuration. */
    public array $layout = [];

    /** @var array<string, mixed> Plotly config flags. */
    public array $config = ['responsive' => true];

    /** @var array<int, string> Enabled trace types; first is the default for new traces. */
    public array $traceTypes = ['bar', 'scatter', 'pie', 'histogram', 'line', 'area', 'box', 'sunburst'];

    /** @var string One of: manual, auto, hybrid. */
    public string $syncMode = 'manual';

    /** @var bool Load all enabled schema profiles on mount. */
    public bool $preloadSchema = true;

    /** @var bool Show export buttons in footer. */
    public bool $showExport = true;

    /** @var bool Show Data viewer button in footer. */
    public bool $showDataViewer = true;

    /** @var array<string, array<mixed>> Pre-loaded schema profiles (populated during mount). */
    public array $schemaProfiles = [];

    /**
     * @param  array<string, array<mixed>>  $dataSources
     * @param  array<int, array<mixed>>  $data
     * @param  array<string, mixed>  $layout
     * @param  array<string, mixed>  $config
     * @param  array<int, string>  $traceTypes
     *
     * @throws InvalidArgumentException
     */
    public function mount(
        array $dataSources,
        array $data = [],
        array $layout = [],
        array $config = ['responsive' => true],
        array $traceTypes = ['bar', 'scatter', 'pie', 'histogram', 'line', 'area', 'box', 'sunburst'],
        string $syncMode = 'manual',
        bool $preloadSchema = true,
        bool $showExport = true,
        bool $showDataViewer = true,
    ): void {
        if (empty($dataSources)) {
            throw new InvalidArgumentException(
                __('plotly-chart-editor::plotly-chart-editor.validation.data_sources_required')
            );
        }

        $this->dataSources = $dataSources;
        $this->data = $data;
        $this->layout = $layout;
        $this->config = $config;
        $this->traceTypes = $traceTypes;
        $this->syncMode = $syncMode;
        $this->preloadSchema = $preloadSchema;
        $this->showExport = $showExport;
        $this->showDataViewer = $showDataViewer;

        if ($preloadSchema) {
            $this->schemaProfiles = $this->makeLoader()->loadAll($traceTypes);
        }
    }

    /**
     * Return the schema profile for a given trace type.
     * Used for lazy-loading exotic types from Alpine via $wire.getSchemaProfile(type).
     *
     * @throws InvalidArgumentException When the type is unknown.
     */
    public function getSchemaProfile(string $type): array
    {
        return $this->makeLoader()->load($type);
    }

    /**
     * Receive compiled state from Alpine, validate it, strip internal meta,
     * and dispatch the chart-synced event.
     *
     * @throws InvalidArgumentException When the payload is malformed.
     */
    public function syncFromAlpine(string $payload): void
    {
        $state = json_decode($payload, true);

        if (! is_array($state)) {
            throw new InvalidArgumentException(
                'syncFromAlpine: payload is not valid JSON or is not an object.'
            );
        }

        if (! array_key_exists('traces', $state) || ! is_array($state['traces'])) {
            throw new InvalidArgumentException(
                'syncFromAlpine: payload must contain a "traces" array.'
            );
        }

        if (! array_key_exists('layout', $state) || ! is_array($state['layout'])) {
            throw new InvalidArgumentException(
                'syncFromAlpine: payload must contain a "layout" object.'
            );
        }

        // meta.columnNames is kept in the stored traces so they can be
        // re-bound to dataSources when the editor mounts again.
        $this->data = $state['traces'];
        $this->layout = $state['layout'];

        $this->dispatch('chart-synced', data: $this->data, layout: $this->layout);
        ChartSynced::dispatch(data: $this->data, layout: $this->layout);
    }

    /**
     * Return traces with type aliases resolved (e.g. 'area' → 'scatter').
     * Useful for host controllers that need Plotly-native type names.
     *
     * @return array<int, array<mixed>>
     */
    public function getCompiledTraces(): array
    {
        $aliases = config('plotly-chart-editor.aliases', []);

        return array_map(function (array $trace) use ($aliases): array {
            $trace['type'] = $aliases[$trace['type']] ?? $trace['type'];

            return $trace;
        }, $this->data);
    }

    public function render(): View
    {
        return view('plotly-chart-editor::livewire.plotly-editor');
    }

    private function makeLoader(): SchemaProfileLoader
    {
        return new SchemaProfileLoader(
            config('plotly-chart-editor', [])
        );
    }
}
