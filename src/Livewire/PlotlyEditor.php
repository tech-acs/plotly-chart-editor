<?php

declare(strict_types=1);

namespace Uneca\PlotlyChartEditor\Livewire;

use Illuminate\View\View;
use Livewire\Component;

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
    public array $traceTypes = ['bar'];

    /** @var string One of: manual, auto, hybrid. */
    public string $syncMode = 'manual';

    /** @var bool Load all enabled schema profiles on mount. */
    public bool $preloadSchema = true;

    /** @var bool Show export buttons in footer. */
    public bool $showExport = true;

    /**
     * @param  array<string, array<mixed>>  $dataSources
     * @param  array<int, array<mixed>>  $data
     * @param  array<string, mixed>  $layout
     * @param  array<string, mixed>  $config
     * @param  array<int, string>  $traceTypes
     *
     * @throws \InvalidArgumentException
     */
    public function mount(
        array $dataSources,
        array $data = [],
        array $layout = [],
        array $config = ['responsive' => true],
        array $traceTypes = ['bar'],
        string $syncMode = 'manual',
        bool $preloadSchema = true,
        bool $showExport = true,
    ): void {
        if (empty($dataSources)) {
            throw new \InvalidArgumentException(
                __('plotly-chart-editor.validation.data_sources_required')
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
    }

    public function render(): View
    {
        return view('plotly-chart-editor::livewire.plotly-editor');
    }
}
