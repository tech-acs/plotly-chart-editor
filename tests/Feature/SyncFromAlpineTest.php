<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Event;
use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Events\ChartSynced;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('updates data and layout from a valid payload', function (): void {
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1, 2, 3]],
    ]);

    $payload = json_encode([
        'traces' => [
            ['type' => 'bar', 'name' => 'My Trace', 'x' => [1, 2, 3]],
        ],
        'layout' => ['title' => ['text' => 'Updated Title']],
    ]);

    $component->call('syncFromAlpine', $payload);

    expect($component->get('data'))->toHaveCount(1)
        ->and($component->get('data')[0]['name'])->toBe('My Trace')
        ->and($component->get('layout')['title']['text'])->toBe('Updated Title');
});

it('dispatches chart-synced after a successful sync', function (): void {
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1, 2]],
    ]);

    $payload = json_encode([
        'traces' => [['type' => 'scatter', 'name' => 'T1']],
        'layout' => ['title' => ['text' => 'Test']],
    ]);

    $component->call('syncFromAlpine', $payload)
        ->assertDispatched('chart-synced', function ($event, $params) {
            return isset($params['data']) && isset($params['layout']);
        });
});

it('throws on malformed payload', function (): void {
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1]],
    ]);

    expect(fn () => $component->call('syncFromAlpine', 'not-json'))
        ->toThrow(InvalidArgumentException::class);
});

it('throws when traces key is missing', function (): void {
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1]],
    ]);

    expect(fn () => $component->call('syncFromAlpine', json_encode(['layout' => []])))
        ->toThrow(InvalidArgumentException::class);
});

it('preserves meta.columnNames from incoming traces', function (): void {
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['Country' => ['Ghana'], 'Pop' => [34]],
    ]);

    $payload = json_encode([
        'traces' => [
            [
                'type' => 'bar',
                'name' => 'Pop',
                'meta' => ['columnNames' => ['x' => 'Country', 'y' => 'Pop']],
                'x' => ['Ghana'],
                'y' => [34],
            ],
        ],
        'layout' => [],
    ]);

    $component->call('syncFromAlpine', $payload);

    expect($component->get('data')[0])
        ->toHaveKey('meta')
        ->and($component->get('data')[0]['meta'])
        ->toHaveKey('columnNames');
});

it('dispatches the native ChartSynced event after a successful sync', function (): void {
    Event::fake([ChartSynced::class]);

    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1, 2]],
    ]);

    $payload = json_encode([
        'traces' => [['type' => 'scatter', 'name' => 'T1']],
        'layout' => ['title' => ['text' => 'Test']],
    ]);

    $component->call('syncFromAlpine', $payload);

    Event::assertDispatched(ChartSynced::class, function (ChartSynced $event): bool {
        return count($event->data) === 1
            && $event->data[0]['name'] === 'T1'
            && $event->layout['title']['text'] === 'Test';
    });
});
