<?php

declare(strict_types=1);

use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('renders warning markup in the footer', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1, 2, 3]],
    ])->html();

    // The footer warning badge element must be present in the DOM.
    // Alpine hides it via x-show when warnings.length === 0.
    expect($html)->toContain('chart-builder__warning');
});

it('renders inline warning element under column selectors', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['Country' => ['Ghana', 'Kenya'], 'Pop' => [34]],
        'data' => [[
            'type' => 'bar',
            'name' => 'T',
            'meta' => ['columnNames' => ['x' => 'Country', 'y' => 'Pop']],
        ]],
        'traceTypes' => ['bar'],
        'preloadSchema' => true,
    ])->html();

    // The inline warning div must be present under column fields.
    expect($html)->toContain('chart-builder__warning--inline');
});

it('renders the dirty indicator element', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1]],
    ])->html();

    expect($html)->toContain('chart-builder__dirty-indicator');
});
