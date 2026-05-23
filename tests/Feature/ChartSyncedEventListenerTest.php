<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Event;
use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Events\ChartSynced;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('dispatches ChartSynced to a registered listener with traces and layout', function (): void {
    $received = null;

    Event::listen(ChartSynced::class, function (ChartSynced $event) use (&$received): void {
        $received = $event;
    });

    Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1, 2]],
    ])->call('syncFromAlpine', json_encode([
        'traces' => [['type' => 'scatter', 'name' => 'T1', 'meta' => ['columnNames' => ['x' => 'X']]]],
        'layout' => ['title' => ['text' => 'Test']],
    ]));

    expect($received)->not->toBeNull()
        ->and($received->data)->toHaveCount(1)
        ->and($received->data[0]['name'])->toBe('T1')
        ->and($received->data[0]['meta']['columnNames']['x'])->toBe('X')
        ->and($received->layout['title']['text'])->toBe('Test');
});

it('dispatches ChartSynced with empty traces and layout', function (): void {
    $received = null;

    Event::listen(ChartSynced::class, function (ChartSynced $event) use (&$received): void {
        $received = $event;
    });

    Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1]],
    ])->call('syncFromAlpine', json_encode([
        'traces' => [],
        'layout' => [],
    ]));

    expect($received)->not->toBeNull()
        ->and($received->data)->toBe([])
        ->and($received->layout)->toBe([]);
});

it('dispatches ChartSynced to multiple listeners', function (): void {
    $count = 0;

    Event::listen(ChartSynced::class, function () use (&$count): void {
        $count++;
    });
    Event::listen(ChartSynced::class, function () use (&$count): void {
        $count++;
    });

    Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['X' => [1]],
    ])->call('syncFromAlpine', json_encode([
        'traces' => [['type' => 'bar']],
        'layout' => [],
    ]));

    expect($count)->toBe(2);
});
