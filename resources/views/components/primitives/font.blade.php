@props(['path'])

{{--
    Font primitive — binds to <path>.family, <path>.size, <path>.color
    Path example: "layout.title.font"  →  binds layout.title.font.family etc.
--}}
<div class="plotly-primitive font-primitive">
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.font_family') }}</label>
        <select
            class="chart-builder__control chart-builder__control--select"
            x-model="{!! $path !!}.family"
        >
            <option value="Arial">Arial</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
            <option value="system-ui">System UI</option>
        </select>
    </div>

    <div class="chart-builder__field">
        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.font_size') }}</label>
        <input
            type="number"
            class="chart-builder__control chart-builder__control--number"
            min="8"
            max="48"
            x-model.number="{!! $path !!}.size"
        >
    </div>

    <div class="chart-builder__field">
        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.font_color') }}</label>
        <input
            type="color"
            class="chart-builder__control chart-builder__control--color"
            x-model="{!! $path !!}.color"
        >
    </div>
</div>
