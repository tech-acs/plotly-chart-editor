<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $raw = json_decode(
        file_get_contents(__DIR__.'/../../fixtures/african-countries.json'),
        true
    );

    // Strip the _meta key — it is not a data column
    $dataSources = collect($raw)->except('_meta')->toArray();

    return view('demo', ['dataSources' => $dataSources]);
});
