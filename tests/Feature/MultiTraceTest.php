<?php

declare(strict_types=1);

use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('renders multiple traces in the payload', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => [
            'Country' => ['Nigeria', 'Ghana', 'Kenya'],
            'Population' => [223.8, 34.1, 55.1],
            'GDP' => [363.8, 76.6, 113.4],
        ],
        'data' => [
            [
                'type' => 'bar',
                'name' => 'Population',
                'meta' => ['columnNames' => ['x' => 'Country', 'y' => 'Population']],
                'marker' => ['color' => '#1f77b4'],
            ],
            [
                'type' => 'scatter',
                'name' => 'GDP',
                'meta' => ['columnNames' => ['x' => 'Country', 'y' => 'GDP']],
                'marker' => ['color' => '#ff7f0e'],
                'mode' => 'markers',
            ],
        ],
        'traceTypes' => ['bar', 'scatter'],
        'preloadSchema' => true,
    ])->html();

    // Both traces must be serialised into the mount payload
    // Blade HTML-encodes quotes in attribute values (" → &quot;)
    expect($html)
        ->toContain('data-chart-builder-payload')
        ->toContain('&quot;name&quot;:&quot;Population&quot;')
        ->toContain('&quot;name&quot;:&quot;GDP&quot;');

    // The sidebar must include the trace-list and section-header markup
    expect($html)
        ->toContain('chart-builder__trace-list')
        ->toContain('chart-builder__section-header');
});
