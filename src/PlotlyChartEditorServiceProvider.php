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

        // Translations — flat publishable file so consumers use
        // __('plotly-chart-editor::plotly-chart-editor.key')
        $this->loadTranslationsFrom(
            __DIR__.'/../resources/lang',
            'plotly-chart-editor'
        );

        $this->publishes([
            __DIR__.'/../resources/lang' => $this->app->langPath(),
        ], 'plotly-chart-editor-translations');

        // CSS asset — publish to public/vendor/plotly-chart-editor/
        $this->publishes([
            __DIR__.'/../resources/css/plotly-chart-editor.css' => public_path('vendor/plotly-chart-editor/plotly-chart-editor.css'),
        ], 'plotly-chart-editor-assets');

        // JS asset — publish alongside CSS
        $this->publishes([
            __DIR__.'/../dist/plotly-chart-editor.umd.js' => public_path('vendor/plotly-chart-editor/plotly-chart-editor.js'),
        ], 'plotly-chart-editor-assets');
    }
}
