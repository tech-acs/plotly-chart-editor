@props(['path'])

{{--
    Line primitive — binds ONLY to <path>.color, <path>.width, <path>.dash
    Path example: "Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex].marker.line"
    Per PRD §7 C4: must not touch sibling attributes outside color/width/dash.
--}}
<div class="plotly-primitive line-primitive">
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.color') }}</label>
        <input
            type="color"
            class="chart-builder__control chart-builder__control--color"
            x-model="{!! $path !!}.color"
        >
    </div>

    <div class="chart-builder__field">
        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.width') }}</label>
        <div class="chart-builder__control-row">
            <input
                type="range"
                class="chart-builder__control chart-builder__control--range"
                min="0"
                max="10"
                step="0.5"
                x-model.number="{!! $path !!}.width"
            >
            <span class="chart-builder__control-value" x-text="{!! $path !!}.width ?? 1"></span>
        </div>
    </div>

    <div class="chart-builder__field">
        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.dash') }}</label>
        <select
            class="chart-builder__control chart-builder__control--select"
            x-model="{!! $path !!}.dash"
        >
            <option value="solid">Solid</option>
            <option value="dot">Dot</option>
            <option value="dash">Dash</option>
            <option value="longdash">Long dash</option>
            <option value="dashdot">Dash dot</option>
        </select>
    </div>
</div>
