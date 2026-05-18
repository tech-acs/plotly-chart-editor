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
            ->hasViews();
    }

    public function packageBooted(): void
    {
        Livewire::component('plotly-editor', PlotlyEditor::class);

        // Register translations as a flat publishable file so consumers can use
        // __('plotly-chart-editor.key') without the :: namespace separator.
        // The package ships the file at resources/lang/en/plotly-chart-editor.php;
        // after publishing it lands at lang/plotly-chart-editor.php in the app.
        $this->loadTranslationsFrom(
            __DIR__.'/../resources/lang',
            'plotly-chart-editor'
        );

        $this->publishes([
            __DIR__.'/../resources/lang' => $this->app->langPath(),
        ], 'plotly-chart-editor-translations');
    }
}
