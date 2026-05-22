<?php

declare(strict_types=1);

use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('renders the annotations fold with correct title', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
    ])->html();

    expect($html)->toContain('Annotations');
});

it('renders the add annotation dropdown with type options', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
    ])->html();

    expect($html)->toContain('addAnnotation')
        ->and($html)->toContain('value="text"')
        ->and($html)->toContain('value="shape"')
        ->and($html)->toContain('value="image"');
});

it('shows empty state when no annotations exist', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
    ])->html();

    expect($html)->toContain('+ Add annotation');
});

it('renders annotation cards container with x-for directive', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
    ])->html();

    expect($html)->toContain('chart-builder__annotation-card')
        ->and($html)->toContain('x-for="(ann, idx) in');
});

it('renders per-type template blocks for text annotations', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
    ])->html();

    expect($html)->toContain("ann._plotlyType === 'text'")
        ->and($html)->toContain('x-model="ann.text"')
        ->and($html)->toContain('x-model="ann.showarrow"');
});

it('renders per-type template blocks for shape annotations', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
    ])->html();

    expect($html)->toContain("ann._plotlyType === 'shape'")
        ->and($html)->toContain('x-model="ann.type"')
        ->and($html)->toContain('x-model="ann.x0"');
});

it('renders per-type template blocks for image annotations', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
    ])->html();

    expect($html)->toContain("ann._plotlyType === 'image'")
        ->and($html)->toContain('type="file"')
        ->and($html)->toContain('accept="image/*"')
        ->and($html)->toContain('x-model="ann.sizing"');
});

it('annotation translation keys load correctly', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
    ])->html();

    expect($html)->toContain('Show arrow')
        ->and($html)->toContain('Arrowhead')
        ->and($html)->toContain('X anchor')
        ->and($html)->toContain('Y anchor')
        ->and($html)->toContain('Source')
        ->and($html)->toContain('Sizing');
});

it('annotation card has move up and move down buttons', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
    ])->html();

    expect($html)->toContain('moveAnnotationUp')
        ->and($html)->toContain('moveAnnotationDown')
        ->and($html)->toContain('removeAnnotation');
});

it('renders the delete annotation confirm message in the script', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
    ])->html();

    expect($html)->toContain('Delete this annotation?');
});
