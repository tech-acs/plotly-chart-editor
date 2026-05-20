@props(['axisKey', 'store'])
@php $axisPath = $store . '.layout.' . $axisKey; @endphp

{{-- Title --}}
<div class="chart-builder__group">
    <div class="chart-builder__group-label">
        {{ __('plotly-chart-editor::plotly-chart-editor.ui.axis_title') }}
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.ui.axis_title') }}
        </label>
        <input
            type="text"
            class="chart-builder__control chart-builder__control--text"
            x-model="{!! $axisPath !!}.title.text"
        >
    </div>
    <x-plotly-chart-editor::primitives.font
        :path="$axisPath . '.title.font'"
    />
</div>

{{-- Range --}}
<div class="chart-builder__group">
    <div class="chart-builder__group-label">
        {{ __('plotly-chart-editor::plotly-chart-editor.ui.range') }}
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.fields.axis_type') }}
        </label>
        <select
            class="chart-builder__control chart-builder__control--select"
            x-model="{!! $axisPath !!}.type"
        >
            <option value="-">{{ __('plotly-chart-editor::plotly-chart-editor.fields.axis_type_auto') }}</option>
            <option value="linear">{{ __('plotly-chart-editor::plotly-chart-editor.fields.axis_type_linear') }}</option>
            <option value="log">{{ __('plotly-chart-editor::plotly-chart-editor.fields.axis_type_log') }}</option>
            <option value="date">{{ __('plotly-chart-editor::plotly-chart-editor.fields.axis_type_date') }}</option>
            <option value="category">{{ __('plotly-chart-editor::plotly-chart-editor.fields.axis_type_category') }}</option>
            <option value="multicategory">{{ __('plotly-chart-editor::plotly-chart-editor.fields.axis_type_multicategory') }}</option>
        </select>
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.fields.axis_auto_range') }}
        </label>
        <input
            type="checkbox"
            class="chart-builder__control chart-builder__control--checkbox"
            x-model="{!! $axisPath !!}.autorange"
        >
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.ui.axis_range_min') }}
        </label>
        <input
            type="number"
            class="chart-builder__control chart-builder__control--number"
            :value="{!! $axisPath !!}.range?.[0] ?? ''"
            @change="{!! $store !!}.setPath({!! $axisPath !!}, 'range', [$event.target.value === '' ? null : parseFloat($event.target.value), {!! $axisPath !!}.range?.[1] ?? null])"
        >
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.ui.axis_range_max') }}
        </label>
        <input
            type="number"
            class="chart-builder__control chart-builder__control--number"
            :value="{!! $axisPath !!}.range?.[1] ?? ''"
            @change="{!! $store !!}.setPath({!! $axisPath !!}, 'range', [{!! $axisPath !!}.range?.[0] ?? null, $event.target.value === '' ? null : parseFloat($event.target.value)])"
        >
    </div>
</div>

{{-- Lines --}}
<div class="chart-builder__group">
    <div class="chart-builder__group-label">
        {{ __('plotly-chart-editor::plotly-chart-editor.groups.lines') }}
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.ui.gridlines') }}
        </label>
        <input
            type="checkbox"
            class="chart-builder__control chart-builder__control--checkbox"
            x-model="{!! $axisPath !!}.showgrid"
        >
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.fields.show_line') }}
        </label>
        <input
            type="checkbox"
            class="chart-builder__control chart-builder__control--checkbox"
            x-model="{!! $axisPath !!}.showline"
        >
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.fields.axis_line_color') }}
        </label>
        <input
            type="color"
            class="chart-builder__control chart-builder__control--color"
            :value="{!! $axisPath !!}.linecolor || '#444444'"
            @change="{!! $axisPath !!}.linecolor = $event.target.value"
        >
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.fields.axis_line_width') }}
        </label>
        <input
            type="number"
            class="chart-builder__control chart-builder__control--number"
            min="0"
            max="10"
            :value="{!! $axisPath !!}.linewidth ?? 1"
            @change="{!! $axisPath !!}.linewidth = parseFloat($event.target.value)"
        >
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.fields.mirror') }}
        </label>
        <select
            class="chart-builder__control chart-builder__control--select"
            :value="{!! $store !!}.getPath({!! $axisPath !!}, 'mirror')"
            @change="{!! $store !!}.setPath({!! $axisPath !!}, 'mirror', $event.target.value === 'true' ? true : $event.target.value === 'false' ? false : $event.target.value)"
        >
            <option value="false">{{ __('plotly-chart-editor::plotly-chart-editor.fields.mirror_false') }}</option>
            <option value="true">{{ __('plotly-chart-editor::plotly-chart-editor.fields.mirror_true') }}</option>
            <option value="ticks">{{ __('plotly-chart-editor::plotly-chart-editor.fields.mirror_ticks') }}</option>
            <option value="all">{{ __('plotly-chart-editor::plotly-chart-editor.fields.mirror_all') }}</option>
            <option value="allticks">{{ __('plotly-chart-editor::plotly-chart-editor.fields.mirror_allticks') }}</option>
        </select>
    </div>
</div>

{{-- Tick labels --}}
<div class="chart-builder__group">
    <div class="chart-builder__group-label">
        {{ __('plotly-chart-editor::plotly-chart-editor.ui.tick_labels') }}
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.fields.show_tick_labels') }}
        </label>
        <input
            type="checkbox"
            class="chart-builder__control chart-builder__control--checkbox"
            x-model="{!! $axisPath !!}.showticklabels"
        >
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.fields.automargin') }}
        </label>
        <input
            type="checkbox"
            class="chart-builder__control chart-builder__control--checkbox"
            x-model="{!! $axisPath !!}.automargin"
        >
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.fields.axis_side') }}
        </label>
        <select
            class="chart-builder__control chart-builder__control--select"
            x-model="{!! $axisPath !!}.side"
        >
            @if ($axisKey === 'xaxis')
                <option value="bottom">{{ __('plotly-chart-editor::plotly-chart-editor.fields.axis_side_bottom') }}</option>
                <option value="top">{{ __('plotly-chart-editor::plotly-chart-editor.fields.axis_side_top') }}</option>
            @else
                <option value="left">{{ __('plotly-chart-editor::plotly-chart-editor.fields.axis_side_left') }}</option>
                <option value="right">{{ __('plotly-chart-editor::plotly-chart-editor.fields.axis_side_right') }}</option>
            @endif
        </select>
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.ui.tick_format') }}
        </label>
        <input
            type="text"
            class="chart-builder__control chart-builder__control--text"
            x-model="{!! $axisPath !!}.tickformat"
        >
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.ui.tick_angle') }}
        </label>
        <select
            class="chart-builder__control chart-builder__control--select"
            x-model="{!! $axisPath !!}.tickangle"
        >
            <option value="auto">{{ __('plotly-chart-editor::plotly-chart-editor.fields.axis_type_auto') }}</option>
            <option value="0">0</option>
            <option value="45">45</option>
            <option value="90">90</option>
            <option value="135">135</option>
            <option value="180">180</option>
        </select>
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.ui.tick_font') }}
        </label>
        <x-plotly-chart-editor::primitives.font
            :path="$axisPath . '.tickfont'"
        />
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.fields.tick_prefix') }}
        </label>
        <input
            type="text"
            class="chart-builder__control chart-builder__control--text"
            :value="{!! $axisPath !!}.tickprefix ?? ''"
            @change="{!! $axisPath !!}.tickprefix = $event.target.value"
        >
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.fields.tick_suffix') }}
        </label>
        <input
            type="text"
            class="chart-builder__control chart-builder__control--text"
            :value="{!! $axisPath !!}.ticksuffix ?? ''"
            @change="{!! $axisPath !!}.ticksuffix = $event.target.value"
        >
    </div>
</div>

{{-- Tick markers --}}
<div class="chart-builder__group">
    <div class="chart-builder__group-label">
        {{ __('plotly-chart-editor::plotly-chart-editor.ui.tick_markers') }}
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.fields.ticks') }}
        </label>
        <select
            class="chart-builder__control chart-builder__control--select"
            :value="{!! $store !!}.getPath({!! $axisPath !!}, 'ticks')"
            @change="{!! $store !!}.setPath({!! $axisPath !!}, 'ticks', $event.target.value)"
        >
            <option value="">{{ __('plotly-chart-editor::plotly-chart-editor.fields.tick_position_none') }}</option>
            <option value="outside">{{ __('plotly-chart-editor::plotly-chart-editor.fields.tick_position_outside') }}</option>
            <option value="inside">{{ __('plotly-chart-editor::plotly-chart-editor.fields.tick_position_inside') }}</option>
        </select>
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.fields.tick_len') }}
        </label>
        <input
            type="number"
            class="chart-builder__control chart-builder__control--number"
            min="0"
            max="50"
            :value="{!! $axisPath !!}.ticklen ?? 5"
            @change="{!! $axisPath !!}.ticklen = parseFloat($event.target.value)"
        >
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.fields.tick_width') }}
        </label>
        <input
            type="number"
            class="chart-builder__control chart-builder__control--number"
            min="0"
            max="10"
            :value="{!! $axisPath !!}.tickwidth ?? 1"
            @change="{!! $axisPath !!}.tickwidth = parseFloat($event.target.value)"
        >
    </div>
    <div class="chart-builder__field">
        <label class="chart-builder__field-label">
            {{ __('plotly-chart-editor::plotly-chart-editor.fields.tick_color') }}
        </label>
        <input
            type="color"
            class="chart-builder__control chart-builder__control--color"
            :value="{!! $axisPath !!}.tickcolor || '#444444'"
            @change="{!! $axisPath !!}.tickcolor = $event.target.value"
        >
    </div>
</div>
