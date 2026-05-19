<?php

declare(strict_types=1);

use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('exposes syncMode to the alpine store payload', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1]],
        'syncMode' => 'auto',
    ])->html();

    expect($html)->toContain('&quot;syncMode&quot;:&quot;auto&quot;');
});

it('renders the save button when syncMode is manual', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1]],
        'syncMode' => 'manual',
    ])->html();

    // Save button is present (syncMode !== 'auto' check in x-show)
    expect($html)->toContain('chart-builder__btn--save');
});

it('renders the save button when syncMode is hybrid', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1]],
        'syncMode' => 'hybrid',
    ])->html();

    expect($html)->toContain('chart-builder__btn--save');
});

it('still renders the save button markup in auto mode (hidden via x-show)', function (): void {
    // The button is always in the DOM; x-show hides it in auto mode.
    // This asserts the markup is present (Alpine handles visibility at runtime).
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1]],
        'syncMode' => 'auto',
    ])->html();

    expect($html)->toContain('chart-builder__btn--save');
});
