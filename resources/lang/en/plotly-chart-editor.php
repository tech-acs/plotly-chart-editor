<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Plotly Chart Editor Language Lines
|--------------------------------------------------------------------------
|
| All user-facing strings for the plotly-chart-editor package live here.
| Publish and modify this file to provide translations or overrides.
|
*/

return [

    'validation' => [
        'data_sources_required' => 'The dataSources property is required and must not be empty.',
    ],

    'errors' => [
        'plotly_missing' => 'Plotly.js is not loaded. See package README for installation instructions.',
        'profile_load_failed' => 'Failed to load profile for :type. Please try again.',
    ],

    'groups' => [
        'data' => 'Data',
        'bars' => 'Bars',
        'lines' => 'Lines',
        'markers' => 'Markers',
        'fill' => 'Fill',
        'sectors' => 'Sectors',
        'bins' => 'Bins',
    ],

    'confirmations' => [
        'delete_trace' => 'Delete this trace? This cannot be undone.',
    ],

    'ui' => [
        'add_trace' => 'Add trace',
        'duplicate_trace' => 'Duplicate',
        'delete_trace' => 'Delete',
        'move_up' => 'Move up',
        'move_down' => 'Move down',
        'trace_label' => 'Trace :n',
        'type_label' => 'Type',
        'traces_section' => 'Traces',
    ],

    'fields' => [
        'x' => 'X',
        'y' => 'Y',
        'labels' => 'Labels',
        'values' => 'Values',
        'mode' => 'Mode',
        'color' => 'Color',
        'colors' => 'Colors',
        'width' => 'Width',
        'dash' => 'Dash',
        'size' => 'Size',
        'symbol' => 'Symbol',
        'opacity' => 'Opacity',
        'fill' => 'Fill',
        'fillcolor' => 'Fill color',
        'orientation' => 'Orientation',
        'line_color' => 'Line color',
        'line_width' => 'Line width',
        'textinfo' => 'Text info',
        'pull' => 'Pull',
        'nbinsx' => 'Bin count',
        'histnorm' => 'Normalisation',
    ],

];
