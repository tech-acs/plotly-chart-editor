<?php

declare(strict_types=1);

use Illuminate\Support\Facades\View;
use Livewire\Attributes\On;
use Livewire\Component;
use Livewire\Livewire;

/**
 * A minimal host component that wraps plotly-editor and listens for
 * chart-synced. In a real app this would be the user's own Livewire
 * component as described in Option A of the README.
 */
class ChartSyncedHost extends Component
{
    public array $dataSources = ['X' => [1, 2, 3]];

    public ?array $syncedData = null;

    public ?array $syncedLayout = null;

    #[On('chart-synced')]
    public function onChartSynced(array $data, array $layout): void
    {
        $this->syncedData = $data;
        $this->syncedLayout = $layout;
    }

    public function render(): Illuminate\View\View
    {
        return View::file(__DIR__.'/stubs/chart-synced-host.blade.php');
    }
}

beforeEach(function (): void {
    Livewire::component('chart-synced-host', ChartSyncedHost::class);
});

it('receives chart-synced event dispatched from syncFromAlpine', function (): void {
    $host = Livewire::test('chart-synced-host');

    $host->dispatch('chart-synced', data: [['type' => 'bar', 'name' => 'T1']], layout: ['title' => 'Test']);

    expect($host->get('syncedData'))->toHaveCount(1)
        ->and($host->get('syncedData')[0]['name'])->toBe('T1')
        ->and($host->get('syncedLayout')['title'])->toBe('Test');
});

it('receives meta.columnNames through chart-synced', function (): void {
    $host = Livewire::test('chart-synced-host');

    $host->dispatch('chart-synced', data: [
        ['type' => 'bar', 'name' => 'Pop', 'meta' => ['columnNames' => ['x' => 'Country']]],
    ], layout: []);

    expect($host->get('syncedData')[0]['meta']['columnNames']['x'])->toBe('Country');
});

it('receives empty traces array', function (): void {
    $host = Livewire::test('chart-synced-host');

    $host->dispatch('chart-synced', data: [], layout: []);

    expect($host->get('syncedData'))->toBe([]);
});
