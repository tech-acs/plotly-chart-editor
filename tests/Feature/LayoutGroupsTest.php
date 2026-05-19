<?php

declare(strict_types=1);

use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('bar profile includes layout_groups with BarLayout group', function (): void {
    $instance = new PlotlyEditor;
    $instance->mount(dataSources: ['x' => [1, 2, 3]], preloadSchema: false);

    $profile = $instance->getSchemaProfile('bar');

    expect($profile)->toHaveKey('layout_groups');
    expect(array_keys($profile['layout_groups']))->toContain('BarLayout');
    expect($profile['layout_groups']['BarLayout']['fields'])->toBeArray();
});

it('bar layout_groups contains expected layout fields', function (): void {
    $instance = new PlotlyEditor;
    $instance->mount(dataSources: ['x' => [1, 2, 3]], preloadSchema: false);

    $profile = $instance->getSchemaProfile('bar');
    $fields = $profile['layout_groups']['BarLayout']['fields'];
    $keys = array_map(fn ($f) => $f['key'], $fields);

    expect($keys)->toContain('barmode', 'barnorm', 'bargap', 'bargroupgap');
});

it('bar layout_groups bargroupgap defaults to 0', function (): void {
    $instance = new PlotlyEditor;
    $instance->mount(dataSources: ['x' => [1, 2, 3]], preloadSchema: false);

    $profile = $instance->getSchemaProfile('bar');
    $fields = $profile['layout_groups']['BarLayout']['fields'];
    $bargroupgap = current(array_filter($fields, fn ($f) => $f['key'] === 'bargroupgap'));

    expect($bargroupgap['dflt'])->toBe(0);
});

it('histogram profile includes layout_groups with bar_layout fields', function (): void {
    $instance = new PlotlyEditor;
    $instance->mount(dataSources: ['x' => [1, 2, 3]], preloadSchema: false);

    $profile = $instance->getSchemaProfile('histogram');

    expect($profile)->toHaveKey('layout_groups');
    $fields = $profile['layout_groups']['HistogramLayout']['fields'];
    $keys = array_map(fn ($f) => $f['key'], $fields);
    expect($keys)->toContain('barmode', 'barnorm', 'bargap', 'bargroupgap');
});

it('pie profile includes layout_groups with PieLayout group containing extendpiecolors', function (): void {
    $instance = new PlotlyEditor;
    $instance->mount(dataSources: ['x' => [1, 2, 3]], preloadSchema: false);

    $profile = $instance->getSchemaProfile('pie');

    expect($profile)->toHaveKey('layout_groups');
    expect(array_keys($profile['layout_groups']))->toContain('PieLayout');
    $fields = $profile['layout_groups']['PieLayout']['fields'];
    $keys = array_map(fn ($f) => $f['key'], $fields);
    expect($keys)->toContain('extendpiecolors');
});

it('scatter profile does NOT have layout_groups', function (): void {
    $instance = new PlotlyEditor;
    $instance->mount(dataSources: ['x' => [1, 2, 3]], preloadSchema: false);

    $profile = $instance->getSchemaProfile('scatter');

    expect($profile)->not->toHaveKey('layout_groups');
});

it('scatter profile has Stacking group with stackgroup and groupnorm', function (): void {
    $instance = new PlotlyEditor;
    $instance->mount(dataSources: ['x' => [1, 2, 3]], preloadSchema: false);

    $profile = $instance->getSchemaProfile('scatter');
    $groups = $profile['groups'];

    expect(array_keys($groups))->toContain('Stacking');
    $fields = $groups['Stacking']['fields'];
    $keys = array_map(fn ($f) => $f['key'], $fields);
    expect($keys)->toContain('stackgroup', 'groupnorm');
});

it('layout_groups labels are translated in the profile', function (): void {
    $instance = new PlotlyEditor;
    $instance->mount(dataSources: ['x' => [1, 2, 3]], preloadSchema: false);

    $profile = $instance->getSchemaProfile('bar');

    // The label should be translated (not the raw key)
    expect($profile['layout_groups']['BarLayout']['label'])
        ->toBe('Bar Layout')
        ->and($profile['layout_groups']['BarLayout']['fields'][0]['label'])
        ->toBe('Bar mode');
});

it('layout_groups are rendered in the component HTML', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
        'traceTypes' => ['bar'],
        'preloadSchema' => true,
    ])->html();

    // The translated layout group label should be present in the rendered output
    expect($html)->toContain('Bar Layout');
});

it('scatter Stacking group fields use trace-level binding', function (): void {
    $instance = new PlotlyEditor;
    $instance->mount(dataSources: ['x' => [1, 2, 3]], preloadSchema: false);

    $profile = $instance->getSchemaProfile('scatter');
    $stackingFields = $profile['groups']['Stacking']['fields'];

    // stackgroup is a text field, groupnorm is enumerated
    $stackgroup = current(array_filter($stackingFields, fn ($f) => $f['key'] === 'stackgroup'));
    expect($stackgroup['type'])->toBe('text');

    $groupnorm = current(array_filter($stackingFields, fn ($f) => $f['key'] === 'groupnorm'));
    expect($groupnorm['type'])->toBe('enumerated')
        ->and($groupnorm['values'])->toContain('fraction', 'percent');
});
