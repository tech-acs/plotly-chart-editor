<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Plotly Chart Editor Configuration
|--------------------------------------------------------------------------
|
| This file contains the configuration for the uneca/plotly-chart-editor
| package. Publish this file with:
|
|   php artisan vendor:publish --tag="plotly-chart-editor-config"
|
*/

return [

    /*
    |--------------------------------------------------------------------------
    | Schema Profiles (Phase 3)
    |--------------------------------------------------------------------------
    |
    | Define per-trace-type field groups here. Pre-loaded profiles (bar, scatter,
    | line, pie, histogram) are shipped in this config. Exotic types are lazy-
    | loaded on demand via Livewire.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Sync Mode Default (Phase 7)
    |--------------------------------------------------------------------------
    |
    | The default sync mode used when the :sync-mode prop is not passed.
    | Options: 'manual' | 'auto' | 'hybrid'
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Theming (Phase 8)
    |--------------------------------------------------------------------------
    |
    | CSS variable overrides and class hook configuration for consumers who
    | want to re-theme the editor without modifying package files.
    |
    */

];
