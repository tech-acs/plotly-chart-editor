<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;

it('binds x-model for dash without generating color or width bindings on the same element', function (): void {
    $path = "Alpine.store('chartBuilder').traces[0].marker.line";

    $html = Blade::render(
        '<x-plotly-chart-editor::primitives.line :path="$path" />',
        ['path' => $path]
    );

    // Dash field must be bound to the path
    expect($html)->toContain("x-model=\"{$path}.dash\"");

    // Color and width must appear on their own separate inputs, not on the
    // same element as dash — verifying primitive encapsulation (PRD C4).
    // We assert all three keys appear in the output (each in its own input).
    expect($html)->toContain("x-model=\"{$path}.color\"");
    expect($html)->toContain("x-model.number=\"{$path}.width\"");

    // Crucially: no single element should bind both dash AND color.
    // We check this by confirming the rendered HTML never puts both attributes
    // on the same HTML tag. Since each input is on its own line/tag, we verify
    // that a combined pattern does not appear.
    expect($html)->not->toContain("{$path}.dash\" x-model=\"{$path}.color\"");
    expect($html)->not->toContain("{$path}.color\" x-model=\"{$path}.dash\"");
});

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

it('marker primitive emits bindings for color size symbol opacity only', function (): void {
    $path = "Alpine.store('chartBuilder').traces[0].marker";

    $html = Blade::render(
        '<x-plotly-chart-editor::primitives.marker :path="$path" />',
        ['path' => $path]
    );

    expect($html)
        ->toContain("x-model=\"{$path}.color\"")
        ->toContain("x-model.number=\"{$path}.size\"")
        ->toContain("x-model=\"{$path}.symbol\"")
        ->toContain("x-model.number=\"{$path}.opacity\"");

    // Must not bind line sub-attributes (that belongs to the line primitive)
    expect($html)->not->toContain("{$path}.line");
});
