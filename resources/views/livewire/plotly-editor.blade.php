<div
    id="plotly-editor-root"
    class="chart-builder"
    data-chart-builder-payload="{{ json_encode([
        'dataSources'    => $dataSources,
        'traces'         => $data,
        'layout'         => $layout,
        'config'         => $config,
        'traceTypes'     => $traceTypes,
        'syncMode'       => $syncMode,
        'showExport'     => $showExport,
        'schemaProfiles' => (object) [],
    ]) }}"
    x-data
    x-init="
        (function () {
            var payload    = JSON.parse($el.dataset.chartBuilderPayload);
            var missingMsg = @js(__('plotly-chart-editor::plotly-chart-editor.errors.plotly_missing'));
            window.initChartBuilder(payload, missingMsg);
            Alpine.store('chartBuilder').setWire($wire);
            Alpine.store('chartBuilder').boot($el.querySelector('[data-plotly-canvas]'));
        })();
    "
>
    {{-- Canvas area — Plotly mounts here --}}
    <div
        class="chart-builder__canvas"
        data-plotly-canvas
    >
        {{-- Plotly renders into this div; peer-dep guard message also appears here --}}
    </div>
</div>
