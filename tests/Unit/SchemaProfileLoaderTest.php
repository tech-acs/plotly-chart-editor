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

it('translates layout_groups labels', function () use ($baseConfig): void {
    $loader = new SchemaProfileLoader($baseConfig());
    $profile = $loader->load('bar');

    expect($profile)->toHaveKey('layout_groups')
        ->and($profile['layout_groups']['BarLayout']['label'])->toBe('Bar Layout')
        ->and($profile['layout_groups']['BarLayout']['fields'][0]['label'])->toBe('Mode');
});

it('includes layout_groups only for profiles that define them', function () use ($baseConfig): void {
    $loader = new SchemaProfileLoader($baseConfig());
    $scatter = $loader->load('scatter');
    $bar = $loader->load('bar');

    expect($bar)->toHaveKey('layout_groups');
    expect($scatter)->not->toHaveKey('layout_groups');
});

it('throws when type is unknown', function () use ($baseConfig): void {
    $loader = new SchemaProfileLoader($baseConfig());

    $loader->load('nonexistent_type');
})->throws(InvalidArgumentException::class);
