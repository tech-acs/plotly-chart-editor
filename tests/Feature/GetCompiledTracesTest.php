<?php

declare(strict_types=1);

use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('resolves area alias to scatter', function (): void {
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1, 2]],
        'data' => [
            ['type' => 'area', 'name' => 'Area Trace'],
            ['type' => 'bar', 'name' => 'Bar Trace'],
        ],
    ]);

    $compiled = $component->instance()->getCompiledTraces();

    expect($compiled[0]['type'])->toBe('scatter')
        ->and($compiled[1]['type'])->toBe('bar');
});

it('resolves line alias to scatter', function (): void {
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1, 2]],
        'data' => [
            ['type' => 'line', 'name' => 'Line Trace'],
        ],
    ]);

    expect($component->instance()->getCompiledTraces()[0]['type'])->toBe('scatter');
});

it('leaves native types unchanged', function (): void {
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1, 2]],
        'data' => [
            ['type' => 'bar', 'name' => 'Bar'],
            ['type' => 'scatter', 'name' => 'Scatter'],
            ['type' => 'pie', 'name' => 'Pie'],
        ],
    ]);

    $compiled = $component->instance()->getCompiledTraces();

    expect($compiled[0]['type'])->toBe('bar')
        ->and($compiled[1]['type'])->toBe('scatter')
        ->and($compiled[2]['type'])->toBe('pie');
});
