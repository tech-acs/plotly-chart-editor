<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Plotly Chart Editor Configuration
|--------------------------------------------------------------------------
|
| Publish with:  php artisan vendor:publish --tag="plotly-chart-editor-config"
|
*/

return [

    /*
    |--------------------------------------------------------------------------
    | Schema Profiles
    |--------------------------------------------------------------------------
    |
    | Each top-level key is a trace type name. The structure is:
    |
    |   'type' => [
    |       'groups' => [
    |           'GroupKey' => [
    |               'label'  => __('plotly-chart-editor.groups.key'),
    |               'xshow'  => 'optional Alpine expression',
    |               'fields' => [ [...], ... ],
    |           ],
    |       ],
    |   ]
    |
    | Field types: column | color | range | number | text | boolean | enumerated
    | Aliases map one type to another profile (e.g. 'line' reuses scatter).
    |
    */

    'profiles' => [

        // ── bar ──────────────────────────────────────────────────────────────
        'bar' => [
            'groups' => [
                'Data' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.data',
                    'fields' => [
                        [
                            'key' => 'x',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.x',
                            'type' => 'column',
                        ],
                        [
                            'key' => 'y',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.y',
                            'type' => 'column',
                        ],
                        [
                            'key' => 'orientation',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.orientation',
                            'type' => 'enumerated',
                            'values' => ['v', 'h'],
                            'dflt' => 'v',
                        ],
                    ],
                ],
                'Legend' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.legend',
                    'fields' => [
                        [
                            'key' => 'showlegend',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.showlegend',
                            'type' => 'boolean',
                            'dflt' => true,
                        ],
                        [
                            'key' => 'legendgroup',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.legendgroup',
                            'type' => 'text',
                        ],
                    ],
                ],
                'Bars' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.bars',
                    'fields' => [
                        [
                            'key' => 'marker.color',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.color',
                            'type' => 'color',
                            'dflt' => '#1f77b4',
                        ],
                        [
                            'key' => 'marker.line.color',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.line_color',
                            'type' => 'color',
                            'dflt' => '#444444',
                        ],
                        [
                            'key' => 'marker.line.width',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.line_width',
                            'type' => 'number',
                            'min' => 0,
                            'max' => 20,
                            'dflt' => 0,
                        ],
                        [
                            'key' => 'opacity',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.opacity',
                            'type' => 'range',
                            'min' => 0,
                            'max' => 1,
                            'dflt' => 1,
                        ],
                    ],
                ],
                'Hover' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.hover',
                    'fields' => [
                        [
                            'key' => 'hoverinfo',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hoverinfo',
                            'type' => 'enumerated',
                            'values' => ['all', 'x', 'y', 'x+y', 'text', 'name', 'skip', 'none'],
                            'dflt' => 'all',
                        ],
                        [
                            'key' => 'hovertemplate',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hovertemplate',
                            'type' => 'text',
                        ],
                        [
                            'key' => 'hoverlabel.bgcolor',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hover_bgcolor',
                            'type' => 'color',
                            'dflt' => '#ffffff',
                        ],
                        [
                            'key' => 'hoverlabel.bordercolor',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hover_bordercolor',
                            'type' => 'color',
                            'dflt' => '#444444',
                        ],
                        [
                            'key' => 'valueformat',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.valueformat',
                            'type' => 'text',
                        ],
                        [
                            'key' => 'valuesuffix',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.valuesuffix',
                            'type' => 'text',
                        ],
                    ],
                ],
                'BarPosition' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.bar_position',
                    'fields' => [
                        [
                            'key' => 'base',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.base',
                            'type' => 'number',
                        ],
                        [
                            'key' => 'offset',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.offset',
                            'type' => 'number',
                        ],
                        [
                            'key' => 'width',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.width',
                            'type' => 'number',
                            'min' => 0,
                        ],
                    ],
                ],
            ],
            'layout_groups' => [
                'BarLayout' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.bar_layout',
                    'fields' => [
                        [
                            'key' => 'barmode',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.barmode',
                            'type' => 'enumerated',
                            'values' => ['group', 'stack', 'overlay', 'relative'],
                            'dflt' => 'group',
                        ],
                        [
                            'key' => 'barnorm',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.barnorm',
                            'type' => 'enumerated',
                            'values' => ['', 'fraction', 'percent'],
                            'dflt' => '',
                        ],
                        [
                            'key' => 'bargap',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.bargap',
                            'type' => 'range',
                            'min' => 0,
                            'max' => 1,
                            'dflt' => 0.2,
                        ],
                        [
                            'key' => 'bargroupgap',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.bargroupgap',
                            'type' => 'range',
                            'min' => 0,
                            'max' => 1,
                            'dflt' => 0,
                        ],
                    ],
                ],
            ],
        ],

        // ── scatter ───────────────────────────────────────────────────────────
        'scatter' => [
            'groups' => [
                'Data' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.data',
                    'fields' => [
                        [
                            'key' => 'x',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.x',
                            'type' => 'column',
                        ],
                        [
                            'key' => 'y',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.y',
                            'type' => 'column',
                        ],
                        [
                            'key' => 'mode',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.mode',
                            'type' => 'enumerated',
                            'values' => ['none', 'lines', 'markers', 'text', 'lines+markers', 'lines+text', 'markers+text', 'lines+markers+text'],
                            'dflt' => 'lines+markers',
                        ],
                    ],
                ],
                'Lines' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.lines',
                    'xshow' => "trace.mode && trace.mode.includes('lines')",
                    'fields' => [
                        [
                            'key' => 'line.color',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.color',
                            'type' => 'color',
                            'dflt' => '#1f77b4',
                        ],
                        [
                            'key' => 'line.width',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.width',
                            'type' => 'number',
                            'min' => 0,
                            'max' => 20,
                            'dflt' => 2,
                        ],
                        [
                            'key' => 'line.dash',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.dash',
                            'type' => 'enumerated',
                            'values' => ['solid', 'dot', 'dash', 'longdash', 'dashdot'],
                            'dflt' => 'solid',
                        ],
                        [
                            'key' => 'line.shape',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.shape',
                            'type' => 'enumerated',
                            'values' => ['linear', 'spline', 'hv', 'vh', 'hvh', 'vhv'],
                            'dflt' => 'linear',
                        ],
                    ],
                ],
                'Markers' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.markers',
                    'xshow' => "trace.mode && trace.mode.includes('markers')",
                    'fields' => [
                        [
                            'key' => 'marker.color',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.color',
                            'type' => 'color',
                            'dflt' => '#1f77b4',
                        ],
                        [
                            'key' => 'marker.size',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.size',
                            'type' => 'number',
                            'min' => 1,
                            'max' => 50,
                            'dflt' => 8,
                        ],
                        [
                            'key' => 'marker.symbol',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.symbol',
                            'type' => 'enumerated',
                            'values' => ['circle', 'square', 'diamond', 'cross', 'x', 'triangle-up'],
                            'dflt' => 'circle',
                        ],
                        [
                            'key' => 'marker.opacity',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.opacity',
                            'type' => 'range',
                            'min' => 0,
                            'max' => 1,
                            'dflt' => 1,
                        ],
                    ],
                ],
                'Text' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.text',
                    'fields' => [
                        [
                            'key' => 'text',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.text',
                            'type' => 'column',
                        ],
                        [
                            'key' => 'textposition',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.textposition',
                            'type' => 'enumerated',
                            'values' => ['top left', 'top center', 'top right', 'middle left', 'middle center', 'middle right', 'bottom left', 'bottom center', 'bottom right'],
                            'dflt' => 'middle center',
                        ],
                        [
                            'key' => 'textfont.family',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.font_family',
                            'type' => 'enumerated',
                            'values' => ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana', 'system-ui'],
                            'dflt' => 'Arial',
                        ],
                        [
                            'key' => 'textfont.size',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.font_size',
                            'type' => 'number',
                            'min' => 8,
                            'max' => 48,
                            'dflt' => 12,
                        ],
                        [
                            'key' => 'textfont.color',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.font_color',
                            'type' => 'color',
                            'dflt' => '#444444',
                        ],
                        [
                            'key' => 'textangle',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.textangle',
                            'type' => 'enumerated',
                            'values' => ['auto', '0', '45', '-45', '90', '-90'],
                            'dflt' => 'auto',
                        ],
                        [
                            'key' => 'constraintext',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.constraintext',
                            'type' => 'enumerated',
                            'values' => ['inside', 'outside', 'both', 'none'],
                            'dflt' => 'none',
                        ],
                        [
                            'key' => 'cliponaxis',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.cliponaxis',
                            'type' => 'boolean',
                            'dflt' => true,
                        ],
                    ],
                ],
                'Legend' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.legend',
                    'fields' => [
                        [
                            'key' => 'showlegend',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.showlegend',
                            'type' => 'boolean',
                            'dflt' => true,
                        ],
                        [
                            'key' => 'legendgroup',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.legendgroup',
                            'type' => 'text',
                        ],
                    ],
                ],
                'Fill' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.fill',
                    'fields' => [
                        [
                            'key' => 'fill',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.fill',
                            'type' => 'enumerated',
                            'values' => ['none', 'tozeroy', 'tozerox', 'tonexty', 'tonextx', 'toself'],
                            'dflt' => 'none',
                        ],
                        [
                            'key' => 'fillcolor',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.fillcolor',
                            'type' => 'color',
                            'dflt' => '#1f77b4',
                            'xshow' => "trace.fill && trace.fill !== 'none'",
                        ],
                    ],
                ],
                'Stacking' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.stacking',
                    'fields' => [
                        [
                            'key' => 'stackgroup',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.stackgroup',
                            'type' => 'text',
                        ],
                        [
                            'key' => 'groupnorm',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.groupnorm',
                            'type' => 'enumerated',
                            'values' => ['', 'fraction', 'percent'],
                            'dflt' => '',
                        ],
                    ],
                ],
                'Hover' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.hover',
                    'fields' => [
                        [
                            'key' => 'hoverinfo',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hoverinfo',
                            'type' => 'enumerated',
                            'values' => ['all', 'x', 'y', 'x+y', 'text', 'name', 'skip', 'none'],
                            'dflt' => 'all',
                        ],
                        [
                            'key' => 'hovertemplate',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hovertemplate',
                            'type' => 'text',
                        ],
                        [
                            'key' => 'hoverlabel.bgcolor',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hover_bgcolor',
                            'type' => 'color',
                            'dflt' => '#ffffff',
                        ],
                        [
                            'key' => 'hoverlabel.bordercolor',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hover_bordercolor',
                            'type' => 'color',
                            'dflt' => '#444444',
                        ],
                        [
                            'key' => 'valueformat',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.valueformat',
                            'type' => 'text',
                        ],
                        [
                            'key' => 'valuesuffix',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.valuesuffix',
                            'type' => 'text',
                        ],
                    ],
                ],
            ],
        ],

        // ── pie ───────────────────────────────────────────────────────────────
        'pie' => [
            'groups' => [
                'Data' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.data',
                    'fields' => [
                        [
                            'key' => 'labels',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.labels',
                            'type' => 'column',
                        ],
                        [
                            'key' => 'values',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.values',
                            'type' => 'column',
                        ],
                    ],
                ],
                'Legend' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.legend',
                    'fields' => [
                        [
                            'key' => 'showlegend',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.showlegend',
                            'type' => 'boolean',
                            'dflt' => true,
                        ],
                        [
                            'key' => 'legendgroup',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.legendgroup',
                            'type' => 'text',
                        ],
                    ],
                ],
                'Sectors' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.sectors',
                    'fields' => [
                        [
                            'key' => 'sort',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.sort',
                            'type' => 'boolean',
                            'dflt' => true,
                        ],
                        [
                            'key' => 'direction',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.direction',
                            'type' => 'enumerated',
                            'values' => ['clockwise', 'counterclockwise'],
                            'dflt' => 'clockwise',
                        ],
                        [
                            'key' => 'rotation',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.rotation',
                            'type' => 'number',
                            'min' => -360,
                            'max' => 360,
                            'dflt' => 0,
                        ],
                        [
                            'key' => 'hole',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hole',
                            'type' => 'range',
                            'min' => 0,
                            'max' => 1,
                            'dflt' => 0,
                        ],
                        [
                            'key' => 'textinfo',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.textinfo',
                            'type' => 'enumerated',
                            'values' => ['label', 'value', 'percent', 'label+value', 'label+percent', 'none'],
                            'dflt' => 'percent',
                        ],
                        [
                            'key' => 'textfont.family',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.font_family',
                            'type' => 'enumerated',
                            'values' => ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana', 'system-ui'],
                            'dflt' => 'Arial',
                        ],
                        [
                            'key' => 'textfont.size',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.font_size',
                            'type' => 'number',
                            'min' => 8,
                            'max' => 48,
                            'dflt' => 12,
                        ],
                        [
                            'key' => 'textfont.color',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.font_color',
                            'type' => 'color',
                            'dflt' => '#444444',
                        ],
                        [
                            'key' => 'pull',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.pull',
                            'type' => 'range',
                            'min' => 0,
                            'max' => 0.5,
                            'dflt' => 0,
                        ],
                        [
                            'key' => 'opacity',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.opacity',
                            'type' => 'range',
                            'min' => 0,
                            'max' => 1,
                            'dflt' => 1,
                        ],
                    ],
                ],
                'Hover' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.hover',
                    'fields' => [
                        [
                            'key' => 'hoverinfo',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hoverinfo',
                            'type' => 'enumerated',
                            'values' => ['all', 'x', 'y', 'x+y', 'text', 'name', 'skip', 'none'],
                            'dflt' => 'all',
                        ],
                        [
                            'key' => 'hovertemplate',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hovertemplate',
                            'type' => 'text',
                        ],
                        [
                            'key' => 'hoverlabel.bgcolor',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hover_bgcolor',
                            'type' => 'color',
                            'dflt' => '#ffffff',
                        ],
                        [
                            'key' => 'hoverlabel.bordercolor',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hover_bordercolor',
                            'type' => 'color',
                            'dflt' => '#444444',
                        ],
                        [
                            'key' => 'valueformat',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.valueformat',
                            'type' => 'text',
                        ],
                        [
                            'key' => 'valuesuffix',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.valuesuffix',
                            'type' => 'text',
                        ],
                    ],
                ],
            ],
            'layout_groups' => [
                'PieLayout' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.pie_layout',
                    'fields' => [
                        [
                            'key' => 'extendpiecolors',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.extendpiecolors',
                            'type' => 'boolean',
                            'dflt' => true,
                        ],
                    ],
                ],
            ],
        ],

        // ── histogram ─────────────────────────────────────────────────────────
        'histogram' => [
            'groups' => [
                'Data' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.data',
                    'fields' => [
                        [
                            'key' => 'x',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.x',
                            'type' => 'column',
                        ],
                    ],
                ],
                'Legend' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.legend',
                    'fields' => [
                        [
                            'key' => 'showlegend',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.showlegend',
                            'type' => 'boolean',
                            'dflt' => true,
                        ],
                        [
                            'key' => 'legendgroup',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.legendgroup',
                            'type' => 'text',
                        ],
                    ],
                ],
                'Bins' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.bins',
                    'fields' => [
                        [
                            'key' => 'nbinsx',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.nbinsx',
                            'type' => 'number',
                            'min' => 1,
                            'max' => 200,
                            'dflt' => 0,
                        ],
                        [
                            'key' => 'histnorm',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.histnorm',
                            'type' => 'enumerated',
                            'values' => ['', 'percent', 'probability', 'density', 'probability density'],
                            'dflt' => '',
                        ],
                        [
                            'key' => 'histfunc',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.histfunc',
                            'type' => 'enumerated',
                            'values' => ['count', 'sum', 'avg', 'min', 'max'],
                            'dflt' => 'count',
                        ],
                        [
                            'key' => 'marker.color',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.color',
                            'type' => 'color',
                            'dflt' => '#1f77b4',
                        ],
                        [
                            'key' => 'marker.line.color',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.line_color',
                            'type' => 'color',
                            'dflt' => '#444444',
                        ],
                        [
                            'key' => 'marker.line.width',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.line_width',
                            'type' => 'number',
                            'min' => 0,
                            'max' => 10,
                            'dflt' => 0,
                        ],
                        [
                            'key' => 'opacity',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.opacity',
                            'type' => 'range',
                            'min' => 0,
                            'max' => 1,
                            'dflt' => 1,
                        ],
                    ],
                ],
                'Cumulative' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.cumulative',
                    'fields' => [
                        [
                            'key' => 'cumulative.enabled',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.cumulative',
                            'type' => 'boolean',
                            'dflt' => false,
                        ],
                        [
                            'key' => 'cumulative.direction',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.cumulative_direction',
                            'type' => 'enumerated',
                            'values' => ['increasing', 'decreasing'],
                            'dflt' => 'increasing',
                        ],
                        [
                            'key' => 'cumulative.currentbin',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.cumulative_currentbin',
                            'type' => 'enumerated',
                            'values' => ['include', 'exclude', 'half'],
                            'dflt' => 'include',
                        ],
                    ],
                ],
                'Hover' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.hover',
                    'fields' => [
                        [
                            'key' => 'hoverinfo',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hoverinfo',
                            'type' => 'enumerated',
                            'values' => ['all', 'x', 'y', 'x+y', 'text', 'name', 'skip', 'none'],
                            'dflt' => 'all',
                        ],
                        [
                            'key' => 'hovertemplate',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hovertemplate',
                            'type' => 'text',
                        ],
                        [
                            'key' => 'hoverlabel.bgcolor',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hover_bgcolor',
                            'type' => 'color',
                            'dflt' => '#ffffff',
                        ],
                        [
                            'key' => 'hoverlabel.bordercolor',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.hover_bordercolor',
                            'type' => 'color',
                            'dflt' => '#444444',
                        ],
                        [
                            'key' => 'valueformat',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.valueformat',
                            'type' => 'text',
                        ],
                        [
                            'key' => 'valuesuffix',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.valuesuffix',
                            'type' => 'text',
                        ],
                    ],
                ],
            ],
            'layout_groups' => [
                'HistogramLayout' => [
                    'label' => 'plotly-chart-editor::plotly-chart-editor.groups.bar_layout',
                    'fields' => [
                        [
                            'key' => 'barmode',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.barmode',
                            'type' => 'enumerated',
                            'values' => ['group', 'stack', 'overlay', 'relative'],
                            'dflt' => 'group',
                        ],
                        [
                            'key' => 'barnorm',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.barnorm',
                            'type' => 'enumerated',
                            'values' => ['', 'fraction', 'percent'],
                            'dflt' => '',
                        ],
                        [
                            'key' => 'bargap',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.bargap',
                            'type' => 'range',
                            'min' => 0,
                            'max' => 1,
                            'dflt' => 0.2,
                        ],
                        [
                            'key' => 'bargroupgap',
                            'label' => 'plotly-chart-editor::plotly-chart-editor.fields.bargroupgap',
                            'type' => 'range',
                            'min' => 0,
                            'max' => 1,
                            'dflt' => 0,
                        ],
                    ],
                ],
            ],
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Profile Aliases
    |--------------------------------------------------------------------------
    |
    | Maps a trace type name to another type whose profile it reuses.
    | e.g. 'line' uses the scatter profile but defaults mode to 'lines'.
    |
    */

    'aliases' => [
        'line' => 'scatter',
        'area' => 'scatter',
    ],

    /*
    |--------------------------------------------------------------------------
    | Sync Mode Default
    |--------------------------------------------------------------------------
    |
    | The default sync mode used when the :sync-mode prop is not passed.
    | Options: 'manual' | 'auto' | 'hybrid'
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Theming
    |--------------------------------------------------------------------------
    |
    | CSS variable overrides for consumers who want to re-theme the editor
    | without modifying package files.
    |
    */

];
