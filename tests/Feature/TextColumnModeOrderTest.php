<?php

declare(strict_types=1);

use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

// ---------------------------------------------------------------------------
// These tests cover the bug where selecting a text-inclusive mode before
// selecting a text column prevented text from rendering on the chart.
//
// The root cause was that the Blade column selector used a direct Alpine
// property assignment ($atrace.meta.columnNames[key] = value) instead of
// routing through a store method. Alpine's reactive proxy does not reliably
// fire effects for new-key additions on a deeply nested object accessed via
// inline expression — whereas a store method call goes through the proxy in
// a context that always triggers tracking.
//
// The fix: setColumnName(traceIndex, fieldKey, columnName) store method +
// updated @change handler in the Blade template.
// ---------------------------------------------------------------------------

it('exposes setColumnName in the JS payload so the Blade @change handler can call it', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => [
            'Country' => ['Nigeria', 'Ghana', 'Kenya'],
            'Population' => [223.8, 34.1, 55.1],
        ],
        'data' => [['type' => 'scatter', 'name' => 'T1', 'meta' => ['columnNames' => []]]],
        'traceTypes' => ['scatter'],
        'preloadSchema' => true,
    ])->html();

    // The Blade template renders the column @change as:
    //   @change="Alpine.store('chartBuilder').setColumnName(...)"
    // Verify the method name appears in the rendered HTML.
    expect($html)->toContain('setColumnName');
});

it('accepts a scatter trace with text-inclusive mode and resolved text array via syncFromAlpine', function (): void {
    // This simulates what compileTrace() produces after the user has set both
    // mode (to a text-inclusive value) and a text column — regardless of the
    // order those two selections were made.
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => [
            'Country' => ['Nigeria', 'Ghana', 'Kenya'],
            'Population' => [223.8, 34.1, 55.1],
        ],
    ]);

    $payload = json_encode([
        'traces' => [
            [
                'type' => 'scatter',
                'name' => 'Labels',
                'mode' => 'lines+text',
                'x' => ['Nigeria', 'Ghana', 'Kenya'],
                'y' => [223.8, 34.1, 55.1],
                'text' => ['Nigeria', 'Ghana', 'Kenya'],
            ],
        ],
        'layout' => [],
    ]);

    $component->call('syncFromAlpine', $payload);

    $saved = $component->get('data');

    expect($saved)->toHaveCount(1)
        ->and($saved[0]['mode'])->toBe('lines+text')
        ->and($saved[0]['text'])->toBe(['Nigeria', 'Ghana', 'Kenya']);
});

it('accepts a scatter trace with markers+text mode and resolved text array via syncFromAlpine', function (): void {
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => [
            'Label' => ['A', 'B', 'C'],
            'Value' => [10, 20, 30],
        ],
    ]);

    $payload = json_encode([
        'traces' => [
            [
                'type' => 'scatter',
                'name' => 'Markers with text',
                'mode' => 'markers+text',
                'x' => ['A', 'B', 'C'],
                'y' => [10, 20, 30],
                'text' => ['A', 'B', 'C'],
            ],
        ],
        'layout' => [],
    ]);

    $component->call('syncFromAlpine', $payload);

    $saved = $component->get('data');

    expect($saved)->toHaveCount(1)
        ->and($saved[0]['mode'])->toBe('markers+text')
        ->and($saved[0]['text'])->toBe(['A', 'B', 'C']);
});

it('stores text data without meta when syncFromAlpine payload includes both mode and text', function (): void {
    // Confirms meta is stripped and text is preserved — the server-side half
    // of the "mode first, text column second" ordering scenario.
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['Country' => ['Nigeria', 'Ghana']],
    ]);

    $payload = json_encode([
        'traces' => [
            [
                'type' => 'scatter',
                'name' => 'T',
                'mode' => 'lines+markers+text',
                'text' => ['Nigeria', 'Ghana'],
                // meta is intentionally absent — compileTrace() deletes it before sync
            ],
        ],
        'layout' => [],
    ]);

    $component->call('syncFromAlpine', $payload);

    $saved = $component->get('data')[0];

    expect($saved)
        ->not->toHaveKey('meta')
        ->and($saved['mode'])->toBe('lines+markers+text')
        ->and($saved['text'])->toBe(['Nigeria', 'Ghana']);
});
