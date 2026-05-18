<?php

declare(strict_types=1);

use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('returns a profile for a known type via getSchemaProfile', function (): void {
    $component = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
    ]);

    $profile = $component->call('getSchemaProfile', 'bar')->get('__actionReturn');

    // Livewire::call() doesn't easily capture return values;
    // call it directly on the component instance instead
    $instance = new PlotlyEditor;

    // Manually boot via mount
    $instance->mount(dataSources: ['x' => [1, 2, 3]], preloadSchema: false);

    $profile = $instance->getSchemaProfile('bar');

    expect($profile)->toBeArray()
        ->and($profile['groups'])->toBeArray()
        ->and(array_keys($profile['groups']))->toContain('Data')
        ->and(array_keys($profile['groups']))->toContain('Bars');
});

it('throws for an unknown type', function (): void {
    $instance = new PlotlyEditor;
    $instance->mount(dataSources: ['x' => [1, 2, 3]], preloadSchema: false);

    $instance->getSchemaProfile('nonexistent_type');
})->throws(InvalidArgumentException::class);
