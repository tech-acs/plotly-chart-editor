<?php

declare(strict_types=1);

namespace Uneca\PlotlyChartEditor;

use Livewire\Livewire;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;
use Uneca\PlotlyChartEditor\Livewire\PlotlyEditor;

class PlotlyChartEditorServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        $package
            ->name('plotly-chart-editor')
            ->hasConfigFile()
            ->hasViews()
            ->hasTranslations();
    }

    public function packageBooted(): void
    {
        Livewire::component('plotly-editor', PlotlyEditor::class);
    }
}
