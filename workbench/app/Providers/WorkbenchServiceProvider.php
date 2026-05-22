<?php

namespace Workbench\App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class WorkbenchServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Use in-memory drivers so the workbench needs no database tables for
        // cache or sessions. Livewire 4 uses the cache for checksum rate-limiting.
        config(['cache.default' => 'array']);
        config(['session.driver' => 'array']);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $packageRoot = dirname(__DIR__, 3);

        // Serve compiled JS
        Route::get('/plotly-chart-editor.umd.js', function () use ($packageRoot) {
            $path = $packageRoot.'/dist/plotly-chart-editor.umd.js';

            if (! file_exists($path)) {
                abort(404, 'Package JS not built. Run: npm run build');
            }

            return response()->file($path, ['Content-Type' => 'application/javascript']);
        });

        // Serve CSS
        Route::get('/plotly-chart-editor.css', function () use ($packageRoot) {
            $path = $packageRoot.'/resources/css/plotly-chart-editor.css';

            if (! file_exists($path)) {
                abort(404, 'Package CSS not found.');
            }

            return response()->file($path, ['Content-Type' => 'text/css']);
        });

        // Serve Plotly locale files from node_modules (installed by the host app).
        // These are CommonJS modules; we wrap them in an IIFE that provides
        // a mock module.exports and auto-registers the locale with Plotly.
        Route::get('/plotly-locale/{code}.js', function ($code) use ($packageRoot) {
            $path = $packageRoot.'/node_modules/plotly.js-locales/'.$code.'.js';

            if (! file_exists($path)) {
                abort(404);
            }

            $content = file_get_contents($path);

            $js = "(function() {
    var module = { exports: {} };
    {$content}

    if (module.exports && typeof window !== 'undefined' && window.Plotly) {
        window.Plotly.register(module.exports);
    }
})();
";

            return response($js, 200, ['Content-Type' => 'application/javascript']);
        });
    }
}
