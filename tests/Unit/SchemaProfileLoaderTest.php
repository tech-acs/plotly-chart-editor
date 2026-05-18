<?php

declare(strict_types=1);

use Uneca\PlotlyChartEditor\Support\SchemaProfileLoader;

$baseConfig = fn () => config('plotly-chart-editor', []);

it('returns the scatter profile for the line alias', function () use ($baseConfig): void {
    $loader = new SchemaProfileLoader($baseConfig());
    $profile = $loader->load('line');

    // 'line' is an alias for 'scatter' — the groups structure must match scatter
    expect($profile)->toBeArray()
        ->and($profile['groups'])->toBeArray()
        ->and(array_keys($profile['groups']))->toContain('Data');
});

it('returns all enabled profiles via loadAll', function () use ($baseConfig): void {
    $loader = new SchemaProfileLoader($baseConfig());
    $profiles = $loader->loadAll(['bar', 'scatter', 'pie', 'histogram', 'line']);

    expect($profiles)->toBeArray()
        ->and($profiles)->toHaveKeys(['bar', 'scatter', 'pie', 'histogram', 'line'])
        ->and($profiles['bar']['groups'])->toBeArray()
        ->and($profiles['line']['groups'])->toBeArray(); // alias resolved
});

it('throws when type is unknown', function () use ($baseConfig): void {
    $loader = new SchemaProfileLoader($baseConfig());

    $loader->load('nonexistent_type');
})->throws(InvalidArgumentException::class);
