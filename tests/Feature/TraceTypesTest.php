<?php

declare(strict_types=1);

use Livewire\Livewire;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

it('renders all 6 default trace types in the type dropdown', function (): void {
    $html = Livewire::test(PlotlyEditor::class, [
        'dataSources' => ['x' => [1, 2, 3]],
    ])->html();

    expect($html)
        ->toContain('&quot;bar&quot;')
        ->toContain('&quot;scatter&quot;')
        ->toContain('&quot;pie&quot;')
        ->toContain('&quot;histogram&quot;')
        ->toContain('&quot;line&quot;')
        ->toContain('&quot;area&quot;');
});
