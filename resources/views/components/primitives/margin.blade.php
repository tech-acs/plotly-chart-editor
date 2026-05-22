@props(['path'])

{{--
    Margin primitive — binds to <path>.t, <path>.b, <path>.l, <path>.r
    Path example: "Alpine.store('chartBuilder').layout.margin"
--}}
<div class="plotly-primitive margin-primitive">
    <div class="margin-primitive__grid">
        <div class="chart-builder__field">
            <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.margin_t') }}</label>
            <input
                type="number"
                class="chart-builder__control chart-builder__control--number"
                min="0"
                max="200"
                x-model.number="{!! $path !!}.t"
            >
        </div>

        <div class="chart-builder__field">
            <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.margin_b') }}</label>
            <input
                type="number"
                class="chart-builder__control chart-builder__control--number"
                min="0"
                max="200"
                x-model.number="{!! $path !!}.b"
            >
        </div>

        <div class="chart-builder__field">
            <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.margin_l') }}</label>
            <input
                type="number"
                class="chart-builder__control chart-builder__control--number"
                min="0"
                max="200"
                x-model.number="{!! $path !!}.l"
            >
        </div>

        <div class="chart-builder__field">
            <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.margin_r') }}</label>
            <input
                type="number"
                class="chart-builder__control chart-builder__control--number"
                min="0"
                max="200"
                x-model.number="{!! $path !!}.r"
            >
        </div>
    </div>
    <div class="chart-builder__field" style="margin-top:0.4rem">
        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.margin_pad') }}</label>
        <input
            type="number"
            class="chart-builder__control chart-builder__control--number"
            min="0"
            max="100"
            x-model.number="{!! $path !!}.pad"
        >
    </div>
</div>
