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
        'bar_layout' => 'Bar Layout',
        'pie_layout' => 'Pie Layout',
        'stacking' => 'Stacking',
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

        // Fold titles
        'fold_traces' => 'Traces',
        'fold_axes' => 'Axes',
        'fold_canvas' => 'Canvas & Titles',

        // Axes fold
        'x_axis' => 'X Axis',
        'y_axis' => 'Y Axis',
        'axis_title' => 'Title',
        'axis_range_min' => 'Min',
        'axis_range_max' => 'Max',
        'gridlines' => 'Gridlines',
        'zeroline' => 'Zero line',
        'tick_angle' => 'Tick angle',
        'tick_format' => 'Tick format',
        'tick_font' => 'Tick font',
        'range' => 'Range',
        'axis_line' => 'Axis line',
        'tick_labels' => 'Tick labels',

        // Canvas & Titles fold
        'chart_title' => 'Chart title',
        'title_font' => 'Title font',
        'margins' => 'Margins',
        'bg_plot' => 'Plot background',
        'bg_paper' => 'Paper background',
        'legend' => 'Legend',
        'show_legend' => 'Show legend',
        'legend_position' => 'Position',
        'legend_orient' => 'Orientation',
    ],

    'viewport' => [
        'too_small' => 'This chart editor requires a screen at least 1024px wide.',
    ],

    'export' => [
        'button' => 'Export',
        'json' => 'JSON config',
        'png' => 'PNG image',
        'svg' => 'SVG image',
        'copy' => 'Copy to clipboard',
        'copied' => 'Copied ✓',
    ],

    'sync' => [
        'save_button' => 'Save',
        'saved' => 'Saved ✓',
        'saving' => 'Saving…',
    ],

    'warnings' => [
        'length_mismatch' => "Column ':field' has :columnLen values but trace expects :expectedLen. Showing first :shown.",
        'badge' => ':count warning|:count warnings',
    ],

    'fields' => [
        // font primitive
        'font_family' => 'Family',
        'font_size' => 'Size',
        'font_color' => 'Color',
        // margin primitive
        'margin_t' => 'Top',
        'margin_b' => 'Bottom',
        'margin_l' => 'Left',
        'margin_r' => 'Right',
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
        'barmode' => 'Bar mode',
        'barnorm' => 'Bar norm',
        'bargap' => 'Bar gap',
        'bargroupgap' => 'Bar group gap',
        'extendpiecolors' => 'Extend pie colors',
        'stackgroup' => 'Stack group',
        'groupnorm' => 'Group norm',
        'axis_auto_range' => 'Auto range',
        'show_line' => 'Show line',
        'axis_line_color' => 'Line color',
        'axis_line_width' => 'Line width',
        'mirror' => 'Mirror',
        'show_tick_labels' => 'Show labels',
        'tick_prefix' => 'Prefix',
        'tick_suffix' => 'Suffix',
        'tick_color' => 'Tick color',
        'tick_width' => 'Tick width',
        'tick_len' => 'Tick length',
        'ticks' => 'Ticks',
    ],

];
