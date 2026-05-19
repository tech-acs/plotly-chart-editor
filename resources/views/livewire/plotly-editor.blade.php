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
    x-data="{ _tooSmall: window.innerWidth < 1024 }"
    x-init="
        if (!_tooSmall) {
            (function () {
                var payload    = JSON.parse($el.dataset.chartBuilderPayload);
                var missingMsg = @js(__('plotly-chart-editor::plotly-chart-editor.errors.plotly_missing'));
                var deleteMsg  = @js(__('plotly-chart-editor::plotly-chart-editor.confirmations.delete_trace'));
                var canvas     = $el.querySelector('[data-plotly-canvas]');
                window.bootChartBuilder(payload, missingMsg, deleteMsg, canvas, $wire);
            })();
        }
    "
>
    {{-- ── Viewport-too-small placeholder (PRD §13.3) ───────────────── --}}
    <div
        class="chart-builder__too-small-msg"
        x-show="_tooSmall"
        style="padding:2rem;text-align:center;color:var(--plotly-editor-text-muted);"
    >
        {{ __('plotly-chart-editor::plotly-chart-editor.viewport.too_small') }}
    </div>

    {{-- ═══════════════════════════════════════════════════════════════
         SIDEBAR
    ══════════════════════════════════════════════════════════════════ --}}
    <div class="chart-builder__sidebar" x-show="!_tooSmall">

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
                                            </template>

                                            {{-- enumerated --}}
                                            <template x-if="field.type === 'enumerated'">
                                                <select
                                                    class="chart-builder__control chart-builder__control--select"
                                                    :value="{{ $atrace }}[field.key]"
                                                    @change="{{ $atrace }}[field.key] = $event.target.value"
                                                >
                                                    <template x-for="val in (field.values ?? [])" :key="val">
                                                        <option
                                                            :value="val"
                                                            x-text="val || '(none)'"
                                                            :selected="{{ $atrace }}[field.key] === val"
                                                        ></option>
                                                    </template>
                                                </select>
                                            </template>

                                            {{-- color --}}
                                            <template x-if="field.type === 'color'">
                                                <input
                                                    type="color"
                                                    class="chart-builder__control chart-builder__control--color"
                                                    x-model="{{ $atrace }}[field.key]"
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
                                                        x-model.number="{{ $atrace }}[field.key]"
                                                    >
                                                    <span
                                                        class="chart-builder__control-value"
                                                        x-text="{{ $atrace }}[field.key]"
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
                                                    x-model.number="{{ $atrace }}[field.key]"
                                                >
                                            </template>

                                            {{-- text --}}
                                            <template x-if="field.type === 'text'">
                                                <input
                                                    type="text"
                                                    class="chart-builder__control chart-builder__control--text"
                                                    x-model="{{ $atrace }}[field.key]"
                                                >
                                            </template>

                                            {{-- boolean --}}
                                            <template x-if="field.type === 'boolean'">
                                                <input
                                                    type="checkbox"
                                                    class="chart-builder__control chart-builder__control--checkbox"
                                                    x-model="{{ $atrace }}[field.key]"
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
        x-show="!_tooSmall"
    ></div>

</div>
