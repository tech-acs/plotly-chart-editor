<?php

declare(strict_types=1);

use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('renders a bar trace with x and y column bindings', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => [
            'Country' => ['Nigeria', 'Ghana', 'Kenya'],
            'Population' => [223.8, 34.1, 55.1],
        ],
        'data' => [
            [
                'type' => 'bar',
                'name' => 'Population',
                'meta' => ['columnNames' => ['x' => 'Country', 'y' => 'Population']],
                'marker' => ['color' => '#1f77b4'],
            ],
        ],
        'traceTypes' => ['bar'],
        'preloadSchema' => true,
    ])->html();

    // The sidebar must render the Data group column selectors
    expect($html)
        ->toContain('data-chart-builder-payload')
        ->toContain('chart-builder__sidebar')
        ->toContain('chart-builder__canvas')
        // The payload must contain the trace meta with column names
        ->toContain('columnNames')
        ->toContain('Country')
        ->toContain('Population')
        // The schema profile for bar must be present
        ->toContain('schemaProfiles');
});
