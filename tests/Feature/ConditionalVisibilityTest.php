<?php

declare(strict_types=1);

use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('renders xshow attribute on groups that have conditional visibility', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['Country' => ['Ghana'], 'Population' => [34]],
        'data' => [['type' => 'scatter', 'name' => 'T1', 'meta' => ['columnNames' => []]]],
        'traceTypes' => ['scatter'],
        'preloadSchema' => true,
    ])->html();

    // The scatter profile has Lines group with xshow = "trace.mode && trace.mode.includes('lines')"
    // and Markers group with xshow = "trace.mode && trace.mode.includes('markers')".
    // Both must appear as x-show attributes on group divs in the rendered HTML.
    expect($html)->toContain('group.xshow');
});

it('renders fold components in the sidebar', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['Country' => ['Ghana'], 'Population' => [34]],
        'traceTypes' => ['bar'],
        'preloadSchema' => true,
    ])->html();

    // All three fold headers must be present
    expect($html)
        ->toContain('chart-builder__fold')
        ->toContain('chart-builder__fold-header')
        ->toContain('chart-builder__fold-body');
});

it('renders the traces fold open and axes fold closed by default', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1, 2]],
        'traceTypes' => ['bar'],
        'preloadSchema' => true,
    ])->html();

    // The fold Blade component sets open via x-data — we check the @js() output.
    // Traces fold: open=true → x-data="{ open: true }"
    // Axes fold:   open=false → x-data="{ open: false }"
    expect($html)
        ->toContain('{ open: true }')
        ->toContain('{ open: false }');
});

it('includes the viewport-too-small message in the rendered markup', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1]],
    ])->html();

    expect($html)->toContain('chart-builder__too-small-msg');
});
