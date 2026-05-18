<?php

namespace Uneca\PlotlyChartEditor;

use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;
use Uneca\PlotlyChartEditor\Commands\PlotlyChartEditorCommand;

class PlotlyChartEditorServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        /*
         * This class is a Package Service Provider
         *
         * More info: https://github.com/spatie/laravel-package-tools
         */
        $package
            ->name('plotly-chart-editor')
            ->hasConfigFile()
            ->hasViews()
            ->hasMigration('create_plotly_chart_editor_table')
            ->hasCommand(PlotlyChartEditorCommand::class);
    }
}
