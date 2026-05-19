@props(['path'])

{{--
    Marker primitive — binds to <path>.color, <path>.size, <path>.symbol, <path>.opacity
    Path example: "Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex].marker"
--}}
<div class="plotly-primitive marker-primitive">
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.color') }}</label>
        <input
            type="color"
            class="chart-builder__control chart-builder__control--color"
            x-model="{!! $path !!}.color"
        >
    </div>

    <div class="chart-builder__field">
        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.size') }}</label>
        <input
            type="number"
            class="chart-builder__control chart-builder__control--number"
            min="1"
            max="50"
            x-model.number="{!! $path !!}.size"
        >
    </div>

    <div class="chart-builder__field">
        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.symbol') }}</label>
        <select
            class="chart-builder__control chart-builder__control--select"
            x-model="{!! $path !!}.symbol"
        >
            <option value="circle">Circle</option>
            <option value="square">Square</option>
            <option value="diamond">Diamond</option>
            <option value="cross">Cross</option>
            <option value="x">X</option>
            <option value="triangle-up">Triangle up</option>
        </select>
    </div>

    <div class="chart-builder__field">
        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.opacity') }}</label>
        <div class="chart-builder__control-row">
            <input
                type="range"
                class="chart-builder__control chart-builder__control--range"
                min="0"
                max="1"
                step="0.05"
                x-model.number="{!! $path !!}.opacity"
            >
            <span class="chart-builder__control-value" x-text="{!! $path !!}.opacity ?? 1"></span>
        </div>
    </div>
</div>
