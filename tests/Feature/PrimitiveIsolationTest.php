<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;

it('margin primitive emits four separate inputs for t b l r', function (): void {
    $path = "Alpine.store('chartBuilder').layout.margin";

    $html = Blade::render(
        '<x-plotly-chart-editor::primitives.margin :path="$path" />',
        ['path' => $path]
    );

    expect($html)
        ->toContain("x-model.number=\"{$path}.t\"")
        ->toContain("x-model.number=\"{$path}.b\"")
        ->toContain("x-model.number=\"{$path}.l\"")
        ->toContain("x-model.number=\"{$path}.r\"");
});

it('font primitive emits bindings for family size and color only', function (): void {
    $path = "Alpine.store('chartBuilder').layout.title.font";

    $html = Blade::render(
        '<x-plotly-chart-editor::primitives.font :path="$path" />',
        ['path' => $path]
    );

    expect($html)
        ->toContain("x-model=\"{$path}.family\"")
        ->toContain("x-model.number=\"{$path}.size\"")
        ->toContain("x-model=\"{$path}.color\"");

    // Must not bind arbitrary sibling keys
    expect($html)->not->toContain("{$path}.text");
    expect($html)->not->toContain("{$path}.weight");
});
