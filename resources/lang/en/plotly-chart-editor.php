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
        'hover' => 'Hover',
        'legend' => 'Legend',
        'bar_position' => 'Bar Position',
        'text' => 'Text',
        'cumulative' => 'Cumulative',
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
        'tick_angle' => 'Tick angle',
        'tick_format' => 'Tick format',
        'tick_font' => 'Tick font',
        'range' => 'Range',
        'axis_line' => 'Axis line',
        'tick_labels' => 'Tick labels',
        'tick_markers' => 'Tick markers',

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
        'legend_title' => 'Legend title',
        'legend_title_font' => 'Title font',
        'legend_font' => 'Item font',
        'hovermode' => 'Hover mode',
        'hover_label' => 'Hover label',

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
        'name' => 'Name',
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
        'showlegend' => 'Show in legend',
        'legendgroup' => 'Legend group',
        'valueformat' => 'Value format',
        'valuesuffix' => 'Value suffix',
        'base' => 'Base',
        'offset' => 'Offset',
        'shape' => 'Shape',
        'text' => 'Text',
        'textposition' => 'Text position',
        'cliponaxis' => 'Clip on axis',
        'direction' => 'Direction',
        'rotation' => 'Rotation',
        'hole' => 'Hole',
        'sort' => 'Sort',
        'cumulative' => 'Cumulative',
        'histfunc' => 'Histogram function',
        'cumulative_direction' => 'Direction',
        'cumulative_currentbin' => 'Current bin',
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
        'axis_type' => 'Type',
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
        'automargin' => 'Auto margins',
        'axis_side' => 'Position',
        'axis_side_top' => 'Top',
        'axis_side_bottom' => 'Bottom',
        'axis_side_left' => 'Left',
        'axis_side_right' => 'Right',
        'hoverinfo' => 'Info',
        'hovertemplate' => 'Template',
        'hover_bgcolor' => 'Label BG',
        'hover_bordercolor' => 'Label border',
        'bg_color' => 'BG color',
        'border_color' => 'Border color',
        'border_width' => 'Border width',
        'h_position' => 'Horizontal position',
        // axis types
        'axis_type_auto' => 'Auto',
        'axis_type_linear' => 'Linear',
        'axis_type_log' => 'Log',
        'axis_type_date' => 'Date',
        'axis_type_category' => 'Category',
        'axis_type_multicategory' => 'Multi-category',
        // mirror
        'mirror_false' => 'False',
        'mirror_true' => 'True',
        'mirror_ticks' => 'Ticks',
        'mirror_all' => 'All',
        'mirror_allticks' => 'All + Ticks',
        // tick position
        'tick_position_none' => 'None',
        'tick_position_outside' => 'Outside',
        'tick_position_inside' => 'Inside',
        // legend
        'legend_orient_v' => 'Vertical',
        'legend_orient_h' => 'Horizontal',
        'legend_pos_top_right' => 'Top right',
        'legend_pos_top_left' => 'Top left',
        'legend_pos_bottom_right' => 'Bottom right',
        'legend_pos_bottom_left' => 'Bottom left',
        'legend_pos_top_center' => 'Top center',
        'legend_pos_bottom_center' => 'Bottom center',
        'legend_pos_left_center' => 'Left center',
        'legend_pos_right_center' => 'Right center',
        // hover modes
        'hovermode_x' => 'X',
        'hovermode_y' => 'Y',
        'hovermode_closest' => 'Closest',
        'hovermode_x_unified' => 'X unified',
        'hovermode_y_unified' => 'Y unified',
        'hovermode_false' => 'False',
        // misc
        'select_column' => '— select column —',
    ],

];
