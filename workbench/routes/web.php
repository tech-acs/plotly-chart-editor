<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $raw = json_decode(
        file_get_contents(__DIR__.'/../fixtures/african-countries.json'),
        true
    );

    // Strip the _meta key — it is not a data column
    $dataSources = collect($raw)->except('_meta')->toArray();

    // Hierarchical columns for the sunburst trace demo.
    // Labels and parents define a continent → country hierarchy.
    $dataSources['SunburstLabel'] = [
        'World', 'Africa', 'Europe', 'Asia', 'Americas', 'Oceania',
        'Nigeria', 'Egypt', 'Kenya', 'Morocco',
        'Germany', 'France', 'UK',
        'China', 'India', 'Japan',
        'USA', 'Brazil', 'Canada',
        'Australia',
    ];
    $dataSources['SunburstParent'] = [
        '', 'World', 'World', 'World', 'World', 'World',
        'Africa', 'Africa', 'Africa', 'Africa',
        'Europe', 'Europe', 'Europe',
        'Asia', 'Asia', 'Asia',
        'Americas', 'Americas', 'Americas',
        'Oceania',
    ];
    $dataSources['SunburstValue'] = [
        8000, 1400, 750, 4700, 1100, 45,
        223, 112, 55, 37,
        83, 65, 67,
        1400, 1400, 125,
        340, 215, 40,
        26,
    ];

    // Cache-bust the package assets on every rebuild during development
    $pkgRoot = realpath(__DIR__.'/../..');
    $assetVersion = max(
        (int) @filemtime($pkgRoot.'/dist/plotly-chart-editor.umd.js'),
        (int) @filemtime($pkgRoot.'/resources/css/plotly-chart-editor.css')
    );

    // App::setLocale('fr');

    return view('demo', [
        'dataSources' => $dataSources,
        'assetVersion' => $assetVersion,
    ]);
});
