<?php

declare(strict_types=1);

use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('dispatches chart-synced with trace names, types, and meta.columnNames', function (): void {
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['Country' => ['Ghana', 'Kenya'], 'Pop' => [34, 55]],
    ]);

    $payload = json_encode([
        'traces' => [
            [
                'type' => 'bar',
                'name' => 'Population',
                'meta' => ['columnNames' => ['x' => 'Country', 'y' => 'Pop']],
            ],
        ],
        'layout' => ['title' => ['text' => 'Test Chart']],
    ]);

    $component->call('syncFromAlpine', $payload)
        ->assertDispatched('chart-synced', function ($event, array $params): bool {
            return $params['data'][0]['name'] === 'Population'
                && $params['data'][0]['type'] === 'bar'
                && $params['data'][0]['meta']['columnNames']['y'] === 'Pop'
                && $params['layout']['title']['text'] === 'Test Chart';
        });
});

it('dispatches chart-synced with multiple traces', function (): void {
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1, 2, 3], 'Y' => [4, 5, 6]],
    ]);

    $payload = json_encode([
        'traces' => [
            ['type' => 'bar', 'name' => 'T1', 'meta' => ['columnNames' => ['x' => 'X']]],
            ['type' => 'scatter', 'name' => 'T2', 'meta' => ['columnNames' => ['y' => 'Y']]],
        ],
        'layout' => [],
    ]);

    $component->call('syncFromAlpine', $payload)
        ->assertDispatched('chart-synced', function ($event, array $params): bool {
            return count($params['data']) === 2
                && $params['data'][1]['name'] === 'T2';
        });
});

it('includes meta.columnNames in the chart-synced payload', function (): void {
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['Country' => ['Ghana']],
    ]);

    $payload = json_encode([
        'traces' => [
            [
                'type' => 'bar',
                'name' => 'T',
                'meta' => ['columnNames' => ['x' => 'Country']],
            ],
        ],
        'layout' => [],
    ]);

    $component->call('syncFromAlpine', $payload)
        ->assertDispatched('chart-synced', function ($event, array $params): bool {
            return isset($params['data'][0]['meta']['columnNames']['x'])
                && $params['data'][0]['meta']['columnNames']['x'] === 'Country';
        });
});
