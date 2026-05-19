<?php

declare(strict_types=1);

use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('adds a filter transform via addTransform', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1, 2, 3]],
    ])->html();

    expect($html)
        ->toContain('addTransform')
        ->toContain('value="filter"')
        ->toContain('tr.operation')
        ->toContain('parseFloat');
});

it('adds a sort transform via addTransform', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1, 2, 3]],
    ])->html();

    expect($html)
        ->toContain('addTransform')
        ->toContain('value="sort"')
        ->toContain('tr.order');
});

it('removes a transform via removeTransform', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1, 2, 3]],
    ])->html();

    expect($html)
        ->toContain('removeTransform')
        ->toContain('chart-builder__btn--danger');
});

it('preserves transforms on trace type switch', function (): void {
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1, 2, 3]],
    ]);

    $payload = json_encode([
        'traces' => [[
            'type' => 'bar',
            'name' => 'With Transform',
            'transforms' => [
                ['type' => 'filter', 'target' => 'y', 'operation' => '>', 'value' => 0],
            ],
        ]],
        'layout' => [],
    ]);

    $component->call('syncFromAlpine', $payload);

    $trace = $component->get('data')[0];
    expect($trace)->toHaveKey('transforms');
    expect($trace['transforms'][0]['type'])->toBe('filter');
});

it('renders the transforms section in the sidebar', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1, 2, 3]],
    ])->html();

    expect($html)
        ->toContain('chart-builder__transform-card')
        ->toContain('Transforms');
});
