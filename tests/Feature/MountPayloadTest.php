<?php

declare(strict_types=1);

use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('exposes dataSources to the alpine store via the mount payload', function (): void {
    $dataSources = [
        'Country' => ['Ghana', 'Kenya', 'Nigeria'],
        'Population' => [32395450, 54985698, 211400708],
    ];

    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => $dataSources,
    ])->html();

    expect($html)
        ->toContain('data-chart-builder-payload')
        ->toContain('Country')
        ->toContain('Population');
});

it('forwards syncMode to the alpine store', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
        'syncMode' => 'hybrid',
    ])->html();

    expect($html)
        ->toContain('data-chart-builder-payload')
        // Blade HTML-encodes quotes in attribute values, so " becomes &quot;
        ->toContain('&quot;syncMode&quot;:&quot;hybrid&quot;');
});
