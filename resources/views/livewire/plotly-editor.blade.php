@php
    $store    = "Alpine.store('chartBuilder')";
    $atrace   = "{$store}.traces[{$store}.activeTraceIndex]";   // active trace object
@endphp

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
            var deleteMsg  = @js(__('plotly-chart-editor::plotly-chart-editor.confirmations.delete_trace'));
            var canvas     = $el.querySelector('[data-plotly-canvas]');
            window.bootChartBuilder(payload, missingMsg, deleteMsg, canvas, $wire);
        })();
    "
>
    {{-- ── Viewport-too-small placeholder (PRD §13.3) ───────────────── --}}
    <div
        class="chart-builder__too-small-msg"
        x-show="{{ $store }}._tooSmall"
        style="padding:2rem;text-align:center;color:var(--plotly-editor-text-muted);"
    >
        {{ __('plotly-chart-editor::plotly-chart-editor.viewport.too_small') }}
    </div>

    {{-- ═══════════════════════════════════════════════════════════════
         SIDEBAR
    ══════════════════════════════════════════════════════════════════ --}}
    <div class="chart-builder__sidebar" x-show="!{{ $store }}._tooSmall">

        {{-- ══════════════════════════════════════════════════════
             FOLD 1 — TRACES
        ═══════════════════════════════════════════════════════ --}}
        <x-plotly-chart-editor::fold
            :title="__('plotly-chart-editor::plotly-chart-editor.ui.fold_traces')"
            :open="true"
        >
            {{-- ── Trace list toolbar ─────────────────────────────────── --}}
            <div class="chart-builder__section-header">
                <span class="chart-builder__section-title">
                    {{ __('plotly-chart-editor::plotly-chart-editor.ui.traces_section') }}
                </span>
                <div class="chart-builder__section-actions">
                    <button
                        type="button"
                        class="chart-builder__btn chart-builder__btn--icon"
                        title="{{ __('plotly-chart-editor::plotly-chart-editor.ui.add_trace') }}"
                        x-on:click="{{ $store }}.addTrace()"
                    >+</button>
                    <button
                        type="button"
                        class="chart-builder__btn chart-builder__btn--icon"
                        title="{{ __('plotly-chart-editor::plotly-chart-editor.ui.duplicate_trace') }}"
                        x-on:click="{{ $store }}.duplicateTrace()"
                        x-bind:disabled="{{ $store }}.traces.length === 0"
                    >⧉</button>
                    <button
                        type="button"
                        class="chart-builder__btn chart-builder__btn--icon chart-builder__btn--danger"
                        title="{{ __('plotly-chart-editor::plotly-chart-editor.ui.delete_trace') }}"
                        x-on:click="{{ $store }}.removeTrace()"
                        x-bind:disabled="{{ $store }}.traces.length === 0"
                    >×</button>
                </div>
            </div>

            {{-- ── Trace list ──────────────────────────────────────────── --}}
            <div class="chart-builder__trace-list">
                <template
                    x-for="(trace, index) in {{ $store }}.traces"
                    :key="index"
                >
                    <div
                        class="chart-builder__trace-row"
                        x-bind:class="{ 'chart-builder__trace-row--active': {{ $store }}.activeTraceIndex === index }"
                        x-on:click="{{ $store }}.activeTraceIndex = index"
                    >
                        <span
                            class="chart-builder__trace-name"
                            x-text="trace.name || ('Trace ' + (index + 1))"
                        ></span>
                        <div class="chart-builder__trace-actions">
                            <button
                                type="button"
                                class="chart-builder__btn chart-builder__btn--xs"
                                title="{{ __('plotly-chart-editor::plotly-chart-editor.ui.move_up') }}"
                                x-on:click.stop="{{ $store }}.moveTraceUp(index)"
                                x-bind:disabled="index === 0"
                            >↑</button>
                            <button
                                type="button"
                                class="chart-builder__btn chart-builder__btn--xs"
                                title="{{ __('plotly-chart-editor::plotly-chart-editor.ui.move_down') }}"
                                x-on:click.stop="{{ $store }}.moveTraceDown(index)"
                                x-bind:disabled="index === {{ $store }}.traces.length - 1"
                            >↓</button>
                        </div>
                    </div>
                </template>

                <template x-if="{{ $store }}.traces.length === 0">
                    <p class="chart-builder__no-profile">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.add_trace') }} →
                    </p>
                </template>
            </div>

            {{-- ── Active-trace panel ──────────────────────────────────── --}}
            <div
                class="chart-builder__active-trace"
                x-show="{{ $store }}.traces.length > 0"
            >
                {{-- Type selector --}}
                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.type_label') }}
                    </label>
                    <select
                        class="chart-builder__control chart-builder__control--select"
                        :value="{{ $atrace }}?.type"
                        @change="{{ $store }}.setTraceType({{ $store }}.activeTraceIndex, $event.target.value)"
                    >
                        <template
                            x-for="t in {{ $store }}.traceTypes"
                            :key="t"
                        >
                            <option
                                :value="t"
                                x-text="t"
                                :selected="{{ $atrace }}?.type === t"
                            ></option>
                        </template>
                    </select>
                </div>

                {{-- Schema-driven groups from active-trace profile --}}
                <div
                    x-data="{
                        get _profile() {
                            var s = {{ $store }};
                            var t = s.traces[s.activeTraceIndex]?.type ?? 'bar';
                            return s.schemaProfiles[t] ?? null;
                        }
                    }"
                >
                    <template x-if="_profile">
                        <div class="chart-builder__groups">
                            <template x-for="(group, groupKey) in _profile.groups" :key="groupKey">
                                <div
                                    class="chart-builder__group"
                                    x-show="group.xshow
                                        ? (new Function('store','trace','traceType','hasMarkerSupport','hasFillSupport','return ' + group.xshow))(
                                            {{ $store }},
                                            {{ $store }}.trace,
                                            {{ $store }}.traceType,
                                            {{ $store }}.hasMarkerSupport.bind({{ $store }}),
                                            {{ $store }}.hasFillSupport.bind({{ $store }})
                                          )
                                        : true"
                                >
                                    <div class="chart-builder__group-label" x-text="group.label"></div>

                                    <template x-for="field in group.fields" :key="field.key">
                                        <div
                                            class="chart-builder__field"
                                            x-show="field.xshow
                                                ? (new Function('store','trace','traceType','hasMarkerSupport','hasFillSupport','return ' + field.xshow))(
                                                    {{ $store }},
                                                    {{ $store }}.trace,
                                                    {{ $store }}.traceType,
                                                    {{ $store }}.hasMarkerSupport.bind({{ $store }}),
                                                    {{ $store }}.hasFillSupport.bind({{ $store }})
                                                  )
                                                : true"
                                        >
                                            <label class="chart-builder__field-label" x-text="field.label"></label>

                                            {{-- column --}}
                                            <template x-if="field.type === 'column'">
                                                <div>
                                                    <select
                                                        class="chart-builder__control chart-builder__control--select"
                                                        :value="{{ $atrace }}.meta?.columnNames?.[field.key]"
                                                        @change="{{ $atrace }}.meta.columnNames[field.key] = $event.target.value"
                                                    >
                                                        <option value="" :selected="!{{ $atrace }}.meta?.columnNames?.[field.key]">— select column —</option>
                                                        <template x-for="col in Object.keys({{ $store }}.dataSources)" :key="col">
                                                            <option
                                                                :value="col"
                                                                x-text="col"
                                                                :selected="{{ $atrace }}.meta?.columnNames?.[field.key] === col"
                                                            ></option>
                                                        </template>
                                                    </select>
                                                    {{-- Inline column-length mismatch warning --}}
                                                    <div
                                                        class="chart-builder__warning chart-builder__warning--inline"
                                                        x-show="{{ $store }}.warningFor({{ $store }}.activeTraceIndex, field.key) !== null"
                                                        x-text="{{ $store }}.warningFor({{ $store }}.activeTraceIndex, field.key)?.message ?? ''"
                                                    ></div>
                                                </div>
                                            </template>

                                            {{-- enumerated --}}
                                            {{-- Uses getPath/setPath to handle dot-notation keys like "marker.symbol" --}}
                                            <template x-if="field.type === 'enumerated'">
                                                <select
                                                    class="chart-builder__control chart-builder__control--select"
                                                    :value="{{ $store }}.getPath({{ $atrace }}, field.key)"
                                                    @change="{{ $store }}.setPath({{ $atrace }}, field.key, $event.target.value)"
                                                >
                                                    <template x-for="val in (field.values ?? [])" :key="val">
                                                        <option
                                                            :value="val"
                                                            x-text="val || '(none)'"
                                                            :selected="{{ $store }}.getPath({{ $atrace }}, field.key) === val"
                                                        ></option>
                                                    </template>
                                                </select>
                                            </template>

                                            {{-- color: use :value+@change so undefined shows field.dflt, not black --}}
                                            <template x-if="field.type === 'color'">
                                                <input
                                                    type="color"
                                                    class="chart-builder__control chart-builder__control--color"
                                                    :value="{{ $store }}.getPath({{ $atrace }}, field.key) || field.dflt || '#000000'"
                                                    @change="{{ $store }}.setPath({{ $atrace }}, field.key, $event.target.value)"
                                                >
                                            </template>

                                            {{-- range --}}
                                            <template x-if="field.type === 'range'">
                                                <div class="chart-builder__control-row">
                                                    <input
                                                        type="range"
                                                        class="chart-builder__control chart-builder__control--range"
                                                        :min="field.min ?? 0"
                                                        :max="field.max ?? 1"
                                                        :step="field.step ?? 0.05"
                                                        :value="{{ $store }}.getPath({{ $atrace }}, field.key) ?? field.dflt ?? 1"
                                                        @change="{{ $store }}.setPath({{ $atrace }}, field.key, parseFloat($event.target.value))"
                                                    >
                                                    <span
                                                        class="chart-builder__control-value"
                                                        x-text="{{ $store }}.getPath({{ $atrace }}, field.key) ?? field.dflt ?? ''"
                                                    ></span>
                                                </div>
                                            </template>

                                            {{-- number --}}
                                            <template x-if="field.type === 'number'">
                                                <input
                                                    type="number"
                                                    class="chart-builder__control chart-builder__control--number"
                                                    :min="field.min ?? undefined"
                                                    :max="field.max ?? undefined"
                                                    :value="{{ $store }}.getPath({{ $atrace }}, field.key) ?? field.dflt ?? ''"
                                                    @change="{{ $store }}.setPath({{ $atrace }}, field.key, $event.target.value === '' ? null : parseFloat($event.target.value))"
                                                >
                                            </template>

                                            {{-- text --}}
                                            <template x-if="field.type === 'text'">
                                                <input
                                                    type="text"
                                                    class="chart-builder__control chart-builder__control--text"
                                                    :value="{{ $store }}.getPath({{ $atrace }}, field.key) ?? ''"
                                                    @change="{{ $store }}.setPath({{ $atrace }}, field.key, $event.target.value)"
                                                >
                                            </template>

                                            {{-- boolean --}}
                                            <template x-if="field.type === 'boolean'">
                                                <input
                                                    type="checkbox"
                                                    class="chart-builder__control chart-builder__control--checkbox"
                                                    :checked="{{ $store }}.getPath({{ $atrace }}, field.key)"
                                                    @change="{{ $store }}.setPath({{ $atrace }}, field.key, $event.target.checked)"
                                                >
                                            </template>
                                        </div>
                                    </template>
                                </div>
                            </template>

                            {{-- layout_groups: trace-type-specific layout-level attributes --}}
                            <template x-for="(group, groupKey) in _profile.layout_groups ?? {}" :key="'layout-'+groupKey">
                                <div
                                    class="chart-builder__group"
                                    x-show="group.xshow
                                        ? (new Function('store','trace','traceType','hasMarkerSupport','hasFillSupport','return ' + group.xshow))(
                                            {{ $store }},
                                            {{ $store }}.trace,
                                            {{ $store }}.traceType,
                                            {{ $store }}.hasMarkerSupport.bind({{ $store }}),
                                            {{ $store }}.hasFillSupport.bind({{ $store }})
                                          )
                                        : true"
                                >
                                    <div class="chart-builder__group-label" x-text="group.label"></div>

                                    <template x-for="field in group.fields" :key="'layout-'+field.key">
                                        <div
                                            class="chart-builder__field"
                                            x-show="field.xshow
                                                ? (new Function('store','trace','traceType','hasMarkerSupport','hasFillSupport','return ' + field.xshow))(
                                                    {{ $store }},
                                                    {{ $store }}.trace,
                                                    {{ $store }}.traceType,
                                                    {{ $store }}.hasMarkerSupport.bind({{ $store }}),
                                                    {{ $store }}.hasFillSupport.bind({{ $store }})
                                                  )
                                                : true"
                                        >
                                            <label class="chart-builder__field-label" x-text="field.label"></label>

                                            {{-- enumerated --}}
                                            <template x-if="field.type === 'enumerated'">
                                                <select
                                                    class="chart-builder__control chart-builder__control--select"
                                                    :value="{{ $store }}.getPath({{ $store }}.layout, field.key)"
                                                    @change="{{ $store }}.setPath({{ $store }}.layout, field.key, $event.target.value)"
                                                >
                                                    <template x-for="val in (field.values ?? [])" :key="val">
                                                        <option
                                                            :value="val"
                                                            x-text="val || '(none)'"
                                                            :selected="{{ $store }}.getPath({{ $store }}.layout, field.key) === val"
                                                        ></option>
                                                    </template>
                                                </select>
                                            </template>

                                            {{-- range --}}
                                            <template x-if="field.type === 'range'">
                                                <div class="chart-builder__control-row">
                                                    <input
                                                        type="range"
                                                        class="chart-builder__control chart-builder__control--range"
                                                        :min="field.min ?? 0"
                                                        :max="field.max ?? 1"
                                                        :step="field.step ?? 0.05"
                                                        :value="{{ $store }}.getPath({{ $store }}.layout, field.key) ?? field.dflt ?? 1"
                                                        @change="{{ $store }}.setPath({{ $store }}.layout, field.key, parseFloat($event.target.value))"
                                                    >
                                                    <span
                                                        class="chart-builder__control-value"
                                                        x-text="{{ $store }}.getPath({{ $store }}.layout, field.key) ?? field.dflt ?? ''"
                                                    ></span>
                                                </div>
                                            </template>

                                            {{-- number --}}
                                            <template x-if="field.type === 'number'">
                                                <input
                                                    type="number"
                                                    class="chart-builder__control chart-builder__control--number"
                                                    :min="field.min ?? undefined"
                                                    :max="field.max ?? undefined"
                                                    :value="{{ $store }}.getPath({{ $store }}.layout, field.key) ?? field.dflt ?? ''"
                                                    @change="{{ $store }}.setPath({{ $store }}.layout, field.key, $event.target.value === '' ? null : parseFloat($event.target.value))"
                                                >
                                            </template>

                                            {{-- text --}}
                                            <template x-if="field.type === 'text'">
                                                <input
                                                    type="text"
                                                    class="chart-builder__control chart-builder__control--text"
                                                    :value="{{ $store }}.getPath({{ $store }}.layout, field.key) ?? ''"
                                                    @change="{{ $store }}.setPath({{ $store }}.layout, field.key, $event.target.value)"
                                                >
                                            </template>

                                            {{-- boolean --}}
                                            <template x-if="field.type === 'boolean'">
                                                <input
                                                    type="checkbox"
                                                    class="chart-builder__control chart-builder__control--checkbox"
                                                    :checked="{{ $store }}.getPath({{ $store }}.layout, field.key)"
                                                    @change="{{ $store }}.setPath({{ $store }}.layout, field.key, $event.target.checked)"
                                                >
                                            </template>
                                        </div>
                                    </template>
                                </div>
                            </template>
                        </div>
                    </template>
                </div>
            </div>
        </x-plotly-chart-editor::fold>

        {{-- ══════════════════════════════════════════════════════
             FOLD 2 — AXES
        ═══════════════════════════════════════════════════════ --}}
        <x-plotly-chart-editor::fold
            :title="__('plotly-chart-editor::plotly-chart-editor.ui.fold_axes')"
            :open="false"
        >
            {{-- X Axis --}}
            <div class="chart-builder__group">
                <div class="chart-builder__group-label">
                    {{ __('plotly-chart-editor::plotly-chart-editor.ui.x_axis') }}
                </div>

                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.axis_title') }}
                    </label>
                    <input
                        type="text"
                        class="chart-builder__control chart-builder__control--text"
                        x-model="{{ $store }}.layout.xaxis.title.text"
                    >
                </div>

                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.gridlines') }}
                    </label>
                    <input
                        type="checkbox"
                        class="chart-builder__control chart-builder__control--checkbox"
                        x-model="{{ $store }}.layout.xaxis.showgrid"
                    >
                </div>

                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.zeroline') }}
                    </label>
                    <input
                        type="checkbox"
                        class="chart-builder__control chart-builder__control--checkbox"
                        x-model="{{ $store }}.layout.xaxis.zeroline"
                    >
                </div>

                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.tick_angle') }}
                    </label>
                    <input
                        type="number"
                        class="chart-builder__control chart-builder__control--number"
                        min="-90"
                        max="90"
                        x-model.number="{{ $store }}.layout.xaxis.tickangle"
                    >
                </div>
            </div>

            {{-- Y Axis --}}
            <div class="chart-builder__group">
                <div class="chart-builder__group-label">
                    {{ __('plotly-chart-editor::plotly-chart-editor.ui.y_axis') }}
                </div>

                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.axis_title') }}
                    </label>
                    <input
                        type="text"
                        class="chart-builder__control chart-builder__control--text"
                        x-model="{{ $store }}.layout.yaxis.title.text"
                    >
                </div>

                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.gridlines') }}
                    </label>
                    <input
                        type="checkbox"
                        class="chart-builder__control chart-builder__control--checkbox"
                        x-model="{{ $store }}.layout.yaxis.showgrid"
                    >
                </div>

                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.zeroline') }}
                    </label>
                    <input
                        type="checkbox"
                        class="chart-builder__control chart-builder__control--checkbox"
                        x-model="{{ $store }}.layout.yaxis.zeroline"
                    >
                </div>

                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.tick_format') }}
                    </label>
                    <input
                        type="text"
                        class="chart-builder__control chart-builder__control--text"
                        x-model="{{ $store }}.layout.yaxis.tickformat"
                    >
                </div>
            </div>

            {{-- Tick Font (via primitive) --}}
            <div class="chart-builder__group">
                <div class="chart-builder__group-label">
                    {{ __('plotly-chart-editor::plotly-chart-editor.ui.tick_font') }}
                </div>
                <x-plotly-chart-editor::primitives.font
                    :path="$store . '.layout.xaxis.tickfont'"
                />
            </div>
        </x-plotly-chart-editor::fold>

        {{-- ══════════════════════════════════════════════════════
             FOLD 3 — CANVAS & TITLES
        ═══════════════════════════════════════════════════════ --}}
        <x-plotly-chart-editor::fold
            :title="__('plotly-chart-editor::plotly-chart-editor.ui.fold_canvas')"
            :open="false"
        >
            {{-- Chart title --}}
            <div class="chart-builder__group">
                <div class="chart-builder__group-label">
                    {{ __('plotly-chart-editor::plotly-chart-editor.ui.chart_title') }}
                </div>
                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.chart_title') }}
                    </label>
                    <input
                        type="text"
                        class="chart-builder__control chart-builder__control--text"
                        x-model="{{ $store }}.layout.title.text"
                    >
                </div>
            </div>

            {{-- Title font --}}
            <div class="chart-builder__group">
                <div class="chart-builder__group-label">
                    {{ __('plotly-chart-editor::plotly-chart-editor.ui.title_font') }}
                </div>
                <x-plotly-chart-editor::primitives.font
                    :path="$store . '.layout.title.font'"
                />
            </div>

            {{-- Margins --}}
            <div class="chart-builder__group">
                <div class="chart-builder__group-label">
                    {{ __('plotly-chart-editor::plotly-chart-editor.ui.margins') }}
                </div>
                <x-plotly-chart-editor::primitives.margin
                    :path="$store . '.layout.margin'"
                />
            </div>

            {{-- Backgrounds --}}
            <div class="chart-builder__group">
                <div class="chart-builder__group-label">
                    {{ __('plotly-chart-editor::plotly-chart-editor.ui.bg_plot') }}
                </div>
                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.bg_plot') }}
                    </label>
                    <input
                        type="color"
                        class="chart-builder__control chart-builder__control--color"
                        :value="{{ $store }}.layout.plot_bgcolor || '#ffffff'"
                        @change="{{ $store }}.layout.plot_bgcolor = $event.target.value"
                    >
                </div>
                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.bg_paper') }}
                    </label>
                    <input
                        type="color"
                        class="chart-builder__control chart-builder__control--color"
                        :value="{{ $store }}.layout.paper_bgcolor || '#ffffff'"
                        @change="{{ $store }}.layout.paper_bgcolor = $event.target.value"
                    >
                </div>
            </div>

            {{-- Legend --}}
            <div class="chart-builder__group">
                <div class="chart-builder__group-label">
                    {{ __('plotly-chart-editor::plotly-chart-editor.ui.legend') }}
                </div>
                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.show_legend') }}
                    </label>
                    <input
                        type="checkbox"
                        class="chart-builder__control chart-builder__control--checkbox"
                        x-model="{{ $store }}.layout.showlegend"
                    >
                </div>
                <div
                    class="chart-builder__field"
                    x-show="{{ $store }}.layout.showlegend"
                >
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.legend_orient') }}
                    </label>
                    <select
                        class="chart-builder__control chart-builder__control--select"
                        x-model="{{ $store }}.layout.legend.orientation"
                    >
                        <option value="v">Vertical</option>
                        <option value="h">Horizontal</option>
                    </select>
                </div>
            </div>
        </x-plotly-chart-editor::fold>

    </div>{{-- end sidebar --}}

    {{-- ═══════════════════════════════════════════════════════════════
         CANVAS
    ══════════════════════════════════════════════════════════════════ --}}
    <div
        class="chart-builder__canvas"
        data-plotly-canvas
        wire:ignore
        x-show="!{{ $store }}._tooSmall"
    ></div>

    {{-- ═══════════════════════════════════════════════════════════════
         FOOTER
    ══════════════════════════════════════════════════════════════════ --}}
    <div
        class="chart-builder__footer"
        x-show="!{{ $store }}._tooSmall"
    >
        {{-- Warning badge --}}
        <div
            class="chart-builder__warning"
            x-show="{{ $store }}.warnings.length > 0"
            x-text="'⚠ ' + {{ $store }}.warnings.length + ({{ $store }}.warnings.length === 1 ? ' warning' : ' warnings')"
        ></div>

        {{-- Dirty indicator --}}
        <span
            class="chart-builder__dirty-indicator"
            x-show="{{ $store }}.dirty && !{{ $store }}.syncing"
            title="{{ __('plotly-chart-editor::plotly-chart-editor.sync.save_button') }}"
        >●</span>

        {{-- "Saved ✓" transient message (auto mode) --}}
        <span
            class="chart-builder__saved-msg"
            x-show="{{ $store }}.savedAt !== null"
            x-text="@js(__('plotly-chart-editor::plotly-chart-editor.sync.saved'))"
        ></span>

        {{-- Export dropdown (shown when showExport is true) --}}
        <div
            class="chart-builder__export-wrap"
            x-show="{{ $store }}.showExport"
            x-data="{ open: false }"
            x-on:click.outside="open = false"
        >
            <button
                type="button"
                class="chart-builder__btn"
                x-on:click="open = !open"
                :aria-expanded="open"
            >{{ __('plotly-chart-editor::plotly-chart-editor.export.button') }} ▾</button>

            <div class="chart-builder__export-menu" x-show="open" x-cloak>

                {{-- "Copied ✓" transient --}}
                <span
                    class="chart-builder__export-copied"
                    x-show="{{ $store }}.copiedAt !== null"
                    x-text="@js(__('plotly-chart-editor::plotly-chart-editor.export.copied'))"
                ></span>

                <button
                    type="button"
                    class="chart-builder__export-item"
                    x-on:click="{{ $store }}.exportJSON(); open = false"
                >{{ __('plotly-chart-editor::plotly-chart-editor.export.json') }}</button>

                <button
                    type="button"
                    class="chart-builder__export-item"
                    x-on:click="{{ $store }}.exportImage('png'); open = false"
                >{{ __('plotly-chart-editor::plotly-chart-editor.export.png') }}</button>

                <button
                    type="button"
                    class="chart-builder__export-item"
                    x-on:click="{{ $store }}.exportImage('svg'); open = false"
                >{{ __('plotly-chart-editor::plotly-chart-editor.export.svg') }}</button>

                <button
                    type="button"
                    class="chart-builder__export-item"
                    x-on:click="{{ $store }}.copyConfig(); open = false"
                >{{ __('plotly-chart-editor::plotly-chart-editor.export.copy') }}</button>

            </div>
        </div>

        {{-- Save button: visible in manual + hybrid, hidden in auto --}}
        <button
            type="button"
            class="chart-builder__btn chart-builder__btn--save"
            x-show="{{ $store }}.syncMode !== 'auto'"
            x-bind:disabled="{{ $store }}.syncing || !{{ $store }}.dirty"
            x-on:click="{{ $store }}.syncToBackend()"
            x-text="{{ $store }}.syncing
                ? @js(__('plotly-chart-editor::plotly-chart-editor.sync.saving'))
                : @js(__('plotly-chart-editor::plotly-chart-editor.sync.save_button'))"
        ></button>
    </div>

</div>
