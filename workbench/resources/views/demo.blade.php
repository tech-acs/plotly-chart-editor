<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Plotly Chart Editor — Workbench Demo</title>

    {{--
        Peer dependency: Plotly.js MUST load before Alpine boots.
        Livewire 4 boots Alpine on DOMContentLoaded, so a blocking <script>
        in <head> is the safest way to ensure window.Plotly exists first.
    --}}
    <script src="https://cdn.plot.ly/plotly-3.5.0.min.js" charset="utf-8"></script>

    {{-- Package CSS --}}
    <link rel="stylesheet" href="/plotly-chart-editor.css?v={{ $assetVersion }}">

    {{--
        Package UMD bundle — exposes window.initChartBuilder.
        Must load before @livewireScripts (which boots Alpine).
        DO NOT load a second Alpine here — Livewire 4 bundles Alpine internally.
    --}}
    <script src="/plotly-chart-editor.umd.js?v={{ $assetVersion }}"></script>

    @livewireStyles

    <style>
        * { box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #f1f5f9; }
        h1 { font-size: 1.25rem; font-weight: 600; color: #0f172a; margin-bottom: 1rem; }
        /* Give the editor a fixed height so both columns fill the viewport */
        #plotly-editor-root { height: calc(100vh - 100px); }
    </style>
</head>
<body>
    <h1>Plotly Chart Editor — Workbench Demo</h1>

    <livewire:plotly-editor
        :data-sources="$dataSources"
        :data="[
            [
                'type'   => 'bar',
                'name'   => 'Population (millions)',
                'meta'   => ['columnNames' => ['x' => 'Country', 'y' => 'Population']],
                'marker' => ['color' => '#1f77b4'],
            ],
        ]"
        :layout="[
            'title'  => ['text' => 'African Countries — Population'],
            'xaxis'  => ['title' => ['text' => 'Country']],
            'yaxis'  => ['title' => ['text' => 'Population (millions)']],
            'margin' => ['t' => 60, 'b' => 80, 'l' => 70, 'r' => 30],
        ]"
        :trace-types="['bar', 'scatter', 'line', 'pie', 'histogram']"
        sync-mode="hybrid"
        :show-export="false"
    />

    @livewireScripts

    <script>
        document.addEventListener('livewire:init', () => {
            Livewire.on('chart-synced', (event) => {
                console.log('[chart-synced]', event);
            });
        });
    </script>
</body>
</html>
