<?php

declare(strict_types=1);

use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('includes preloaded profiles in mount payload when preloadSchema is true', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
        'traceTypes' => ['bar', 'scatter'],
        'preloadSchema' => true,
    ])->html();

    // The schemaProfiles object in the payload should contain bar and scatter keys
    expect($html)
        ->toContain('data-chart-builder-payload')
        ->toContain('&quot;schemaProfiles&quot;')
        ->toContain('&quot;bar&quot;')
        ->toContain('&quot;scatter&quot;');
});

it('omits profiles from mount payload when preloadSchema is false', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
        'traceTypes' => ['bar', 'scatter'],
        'preloadSchema' => false,
    ])->html();

    // The schemaProfiles value should be an empty object {}
    expect($html)
        ->toContain('data-chart-builder-payload')
        ->toContain('&quot;schemaProfiles&quot;:{}');
});
