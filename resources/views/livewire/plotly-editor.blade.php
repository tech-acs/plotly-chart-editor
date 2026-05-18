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
        'schemaProfiles' => empty($schemaProfiles) ? (object) [] : $schemaProfiles,
    ]) }}"
    x-data
    x-init="
        (function () {
            var payload    = JSON.parse($el.dataset.chartBuilderPayload);
            var missingMsg = @js(__('plotly-chart-editor::plotly-chart-editor.errors.plotly_missing'));
            var canvas     = $el.querySelector('[data-plotly-canvas]');
            window.bootChartBuilder(payload, missingMsg, canvas, $wire);
        })();
    "
>
    {{-- Canvas area — Plotly mounts here.
         wire:ignore prevents Livewire's morphdom from wiping Plotly's injected SVG
         when the component re-renders after a syncFromAlpine call. --}}
    <div
        class="chart-builder__canvas"
        data-plotly-canvas
        wire:ignore
    >
        {{-- Plotly renders into this div; peer-dep guard message also appears here --}}
    </div>
</div>
