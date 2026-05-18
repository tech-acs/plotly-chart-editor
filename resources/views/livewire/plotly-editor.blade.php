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
        'schemaProfiles' => [],
    ]) }}"
    x-data="{
        init() {
            const payload = JSON.parse(this.$el.dataset.chartBuilderPayload)
            const missingMsg = {{ Js::from(__('plotly-chart-editor.errors.plotly_missing')) }}
            initChartBuilder(payload, missingMsg)
            Alpine.store('chartBuilder').setWire(this.$wire)
            Alpine.store('chartBuilder').boot(this.$el.querySelector('[data-plotly-canvas]'))
        }
    }"
>
    {{-- Canvas area — Plotly mounts here --}}
    <div
        class="chart-builder__canvas"
        data-plotly-canvas
    >
        {{-- Plotly renders into this div; peer-dep guard message also appears here --}}
    </div>
</div>
