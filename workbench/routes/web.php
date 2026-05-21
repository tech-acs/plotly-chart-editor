<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $raw = json_decode(
        file_get_contents(__DIR__.'/../../fixtures/african-countries.json'),
        true
    );

    // Strip the _meta key — it is not a data column
    $dataSources = collect($raw)->except('_meta')->toArray();

    // Cache-bust the package assets on every rebuild during development
    $pkgRoot = realpath(__DIR__.'/../..');
    $assetVersion = max(
        (int) @filemtime($pkgRoot.'/dist/plotly-chart-editor.umd.js'),
        (int) @filemtime($pkgRoot.'/resources/css/plotly-chart-editor.css')
    );

    App::setLocale('es');

    return view('demo', [
        'dataSources' => $dataSources,
        'assetVersion' => $assetVersion,
    ]);
});
