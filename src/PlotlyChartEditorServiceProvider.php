<?php

declare(strict_types=1);

namespace Uneca\PlotlyChartEditor;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
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

        // Blade anonymous components — make them available as
        // <x-plotly-chart-editor::fold> etc. Laravel resolves anonymous
        // components from the view namespace automatically once the
        // view path is registered, but we also register the component
        // namespace so dot-notation paths resolve correctly.
        Blade::anonymousComponentNamespace('plotly-chart-editor::components', 'plotly-chart-editor');

        // Translations — flat publishable file so consumers use
        // __('plotly-chart-editor::plotly-chart-editor.key')
        $this->loadTranslationsFrom(
            __DIR__.'/../resources/lang',
            'plotly-chart-editor'
        );

        $this->publishes([
            __DIR__.'/../resources/lang' => $this->app->langPath(),
        ], 'plotly-chart-editor-translations');

        // Routes — serve JS/CSS from the package directory (no vendor:publish required)
        Route::get('vendor/plotly-chart-editor/plotly-chart-editor.css', function () {
            $file = __DIR__.'/../resources/css/plotly-chart-editor.css';
            $lastModified = filemtime($file);

            return response()->file($file, [
                'Content-Type' => 'text/css',
                'Cache-Control' => 'public, max-age=31536000',
                'Last-Modified' => gmdate('D, d M Y H:i:s', $lastModified).' GMT',
            ]);
        });

        Route::get('vendor/plotly-chart-editor/plotly-chart-editor.js', function () {
            $file = __DIR__.'/../dist/plotly-chart-editor.umd.js';
            $lastModified = filemtime($file);

            return response()->file($file, [
                'Content-Type' => 'application/javascript',
                'Cache-Control' => 'public, max-age=31536000',
                'Last-Modified' => gmdate('D, d M Y H:i:s', $lastModified).' GMT',
            ]);
        });

        // Blade directives for explicit asset placement
        Blade::directive('plotlyChartEditorStyles', function () {
            $link = '<link rel="stylesheet" href="/vendor/plotly-chart-editor/plotly-chart-editor.css">';
            // Auto-flex: when .chart-builder lives inside a [wire:id] wrapper
            // (e.g. nested inside another Livewire component), make the wrapper
            // a column flex container and give .chart-builder flex-1 to fill
            // the available height.  The :has() approach handles this without
            // any per-page CSS from the consumer.
            // Falls back to height:100% for explicit-height parents.
            $inline = '<style>
[wire\\:id]:has(> .chart-builder){flex:1;min-height:0;display:flex;flex-direction:column}
[wire\\:id]:has(> .chart-builder)>.chart-builder{flex:1;min-height:0;height:auto}
</style>';

            return $link.$inline;
        });

        Blade::directive('plotlyChartEditorScripts', function () {
            return '<script src="/vendor/plotly-chart-editor/plotly-chart-editor.js" defer></script>';
        });

        // Public assets — optional vendor:publish for production
        $this->publishes([
            __DIR__.'/../resources/css/plotly-chart-editor.css' => public_path('vendor/plotly-chart-editor/plotly-chart-editor.css'),
        ], 'plotly-chart-editor-assets');

        $this->publishes([
            __DIR__.'/../dist/plotly-chart-editor.umd.js' => public_path('vendor/plotly-chart-editor/plotly-chart-editor.js'),
        ], 'plotly-chart-editor-assets');
    }
}
