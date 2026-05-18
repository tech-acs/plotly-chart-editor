<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Plotly Chart Editor — Workbench Demo</title>

    {{-- Peer dependency: Plotly.js must load BEFORE Alpine boots --}}
    <script src="https://cdn.plot.ly/plotly-2.35.2.min.js" charset="utf-8"></script>

    {{-- Alpine.js CDN --}}
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    {{-- Package JS: served directly from dist/ via a symlink in public/ --}}
    <script src="/plotly-chart-editor.umd.js"></script>

    @livewireStyles

    <style>
        * { box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #f1f5f9; }
        h1 { font-size: 1.25rem; font-weight: 600; color: #0f172a; margin-bottom: 1rem; }
        .chart-builder { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 1rem; }
        .chart-builder__canvas { min-height: 400px; }
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
        :show-export="true"
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
