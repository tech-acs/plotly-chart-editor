<?php

declare(strict_types=1);

use Illuminate\View\ViewException;
use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('mounts with required dataSources', function (): void {
    Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
    ])->assertOk();
});

it('throws when dataSources is missing', function (): void {
    Livewire::test(PlotlyEditor::class, [
        'dataSources' => [],
    ]);
})->throws(ViewException::class);

it('uses defaults for optional props', function (): void {
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
    ]);

    $component
        ->assertSet('traceTypes', ['bar'])
        ->assertSet('syncMode', 'manual')
        ->assertSet('preloadSchema', true)
        ->assertSet('showExport', true);
});
