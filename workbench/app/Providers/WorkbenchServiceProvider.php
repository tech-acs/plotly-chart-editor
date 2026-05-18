<?php

namespace Workbench\App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class WorkbenchServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void {}

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Serve the package's compiled JS bundle directly from dist/
        // so the demo view can load it via <script src="/plotly-chart-editor.umd.js">
        Route::get('/plotly-chart-editor.umd.js', function () {
            // __DIR__ = workbench/app/Providers — go up 4 levels to package root
            $path = dirname(__DIR__, 3).'/dist/plotly-chart-editor.umd.js';

            if (! file_exists($path)) {
                abort(404, 'Package JS not built. Run: npm run build');
            }

            return response()->file($path, ['Content-Type' => 'application/javascript']);
        });
    }
}
