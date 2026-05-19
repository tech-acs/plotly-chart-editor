<?php

declare(strict_types=1);

use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('renders the export dropdown when showExport is true', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1]],
        'showExport' => true,
    ])->html();

    expect($html)
        ->toContain('chart-builder__export-wrap')
        ->toContain('chart-builder__export-menu')
        ->toContain('chart-builder__export-item');
});

it('still includes export markup when showExport is false (hidden via x-show)', function (): void {
    // x-show hides the element at runtime; the markup is always rendered
    // so Alpine can manage visibility. We assert the wrapper is present.
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1]],
        'showExport' => false,
    ])->html();

    expect($html)->toContain('chart-builder__export-wrap');
});

it('forwards showExport to the alpine store payload', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1]],
        'showExport' => false,
    ])->html();

    expect($html)->toContain('&quot;showExport&quot;:false');
});

it('includes all four export action items in the menu', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1]],
        'showExport' => true,
    ])->html();

    expect($html)
        ->toContain('JSON config')
        ->toContain('PNG image')
        ->toContain('SVG image')
        ->toContain('Copy to clipboard');
});
