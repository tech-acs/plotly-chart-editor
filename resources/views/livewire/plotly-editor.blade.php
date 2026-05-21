@php
    $store    = "Alpine.store('chartBuilder')";
    $atrace   = "({$store}.traces[{$store}.activeTraceIndex] ?? {})"; // active trace object (safe empty fallback)
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
                        @click="{{ $store }}.addTrace()"
                    >+</button>
                    <button
                        type="button"
                        class="chart-builder__btn chart-builder__btn--icon"
                        title="{{ __('plotly-chart-editor::plotly-chart-editor.ui.duplicate_trace') }}"
                        @click="{{ $store }}.duplicateTrace()"
                        x-bind:disabled="{{ $store }}.traces.length === 0"
                    >⧉</button>
                    <button
                        type="button"
                        class="chart-builder__btn chart-builder__btn--icon chart-builder__btn--danger"
                        title="{{ __('plotly-chart-editor::plotly-chart-editor.ui.delete_trace') }}"
                        @click="{{ $store }}.removeTrace()"
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
                        @click="{{ $store }}.activeTraceIndex = index"
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
                                @click.stop="{{ $store }}.moveTraceUp(index)"
                                x-bind:disabled="index === 0"
                            >↑</button>
                            <button
                                type="button"
                                class="chart-builder__btn chart-builder__btn--xs"
                                title="{{ __('plotly-chart-editor::plotly-chart-editor.ui.move_down') }}"
                                @click.stop="{{ $store }}.moveTraceDown(index)"
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
            <template x-if="{{ $store }}.traces.length > 0">
            <div
                class="chart-builder__active-trace"
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

                {{-- Trace name (groupless, always visible) --}}
                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.name') }}
                    </label>
                    <input
                        type="text"
                        class="chart-builder__control chart-builder__control--text"
                        :value="{{ $atrace }}.name ?? ''"
                        @change="{{ $atrace }}.name = $event.target.value"
                    >
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
                                    x-show="{{ $store }}.evaluateXshow(group.xshow)"
                                >
                                    <div class="chart-builder__group-label" x-text="group.label"></div>

                                    <template x-for="field in group.fields" :key="field.key">
                                        <div
                                            class="chart-builder__field"
                                            x-show="{{ $store }}.evaluateXshow(field.xshow)"
                                        >
                                            <label class="chart-builder__field-label" x-text="field.label"></label>

                                            {{-- column --}}
                                            <template x-if="field.type === 'column'">
                                                <div>
                                                    <select
                                                        class="chart-builder__control chart-builder__control--select"
                                                        :value="{{ $atrace }}.meta?.columnNames?.[field.key]"
                                                        @change="{{ $store }}.setColumnName({{ $store }}.activeTraceIndex, field.key, $event.target.value)"
                                                    >
                                                        <option value="" :selected="!{{ $atrace }}.meta?.columnNames?.[field.key]">{{ __('plotly-chart-editor::plotly-chart-editor.fields.select_column') }}</option>
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
                                                    :checked="{{ $store }}.getPath({{ $atrace }}, field.key) ?? field.dflt ?? false"
                                                    @change="{{ $store }}.setPath({{ $atrace }}, field.key, $event.target.checked)"
                                                >
                                            </template>
                                        </div>
                                    </template>
                                </div>
                            </template>

                            {{-- layout_groups: trace-type-specific layout-level attributes --}}
                            <div class="chart-builder__layout-groups">
                            <template x-for="(group, groupKey) in _profile.layout_groups ?? {}" :key="'layout-'+groupKey">
                                <div
                                    class="chart-builder__group"
                                    x-show="{{ $store }}.evaluateXshow(group.xshow)"
                                >
                                    <div class="chart-builder__group-label" x-text="group.label"></div>

                                    <template x-for="field in group.fields" :key="'layout-'+field.key">
                                        <div
                                            class="chart-builder__field"
                                            x-show="{{ $store }}.evaluateXshow(field.xshow)"
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
                                                    :checked="{{ $store }}.getPath({{ $store }}.layout, field.key) ?? field.dflt ?? false"
                                                    @change="{{ $store }}.setPath({{ $store }}.layout, field.key, $event.target.checked)"
                                                >
                                            </template>
                                        </div>
                                    </template>
                                </div>
                            </template>
                            </div>
                        </div>
                    </template>
                </div>


            </div>
            </template>
        </x-plotly-chart-editor::fold>

        {{-- ══════════════════════════════════════════════════════
             FOLD 2 — AXES
        ═══════════════════════════════════════════════════════ --}}
        <x-plotly-chart-editor::fold
            :title="__('plotly-chart-editor::plotly-chart-editor.ui.fold_axes')"
            :open="false"
        >
            {{-- Axis tabs --}}
            <div class="chart-builder__tabs">
                <button
                    class="chart-builder__tab"
                    :class="{ 'chart-builder__tab--active': {{ $store }}.activeAxis === 'x' }"
                    @click="{{ $store }}.activeAxis = 'x'"
                >
                    {{ __('plotly-chart-editor::plotly-chart-editor.ui.x_axis') }}
                </button>
                <button
                    class="chart-builder__tab"
                    :class="{ 'chart-builder__tab--active': {{ $store }}.activeAxis === 'y' }"
                    @click="{{ $store }}.activeAxis = 'y'"
                >
                    {{ __('plotly-chart-editor::plotly-chart-editor.ui.y_axis') }}
                </button>
            </div>

            <div x-show="{{ $store }}.activeAxis === 'x'" x-cloak>
                <x-plotly-chart-editor::axis-panel axis-key="xaxis" :store="$store" />
            </div>

            <div x-show="{{ $store }}.activeAxis === 'y'" x-cloak>
                <x-plotly-chart-editor::axis-panel axis-key="yaxis" :store="$store" />
            </div>

        </x-plotly-chart-editor::fold>

        {{-- ══════════════════════════════════════════════════════
             FOLD 3 — CANVAS & TITLES
        ═══════════════════════════════════════════════════════ --}}
        <x-plotly-chart-editor::fold
            :title="__('plotly-chart-editor::plotly-chart-editor.ui.fold_canvas')"
            :open="false"
        >
            {{-- Title --}}
            <div class="chart-builder__group">
                <div class="chart-builder__group-label">
                    {{ __('plotly-chart-editor::plotly-chart-editor.ui.chart_title') }}
                </div>
                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.title') }}
                    </label>
                    <input
                        type="text"
                        class="chart-builder__control chart-builder__control--text"
                        x-model="{{ $store }}.layout.title.text"
                    >
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

                <div x-show="{{ $store }}.layout.showlegend" class="chart-builder__field" style="margin-top:0.25rem">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.legend_orient') }}
                    </label>
                    <select
                        class="chart-builder__control chart-builder__control--select"
                        x-model="{{ $store }}.layout.legend.orientation"
                    >
                        <option value="v">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_orient_v') }}</option>
                        <option value="h">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_orient_h') }}</option>
                    </select>
                </div>

                <div x-show="{{ $store }}.layout.showlegend" class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.legend_position_x') }}
                    </label>
                    <select
                        class="chart-builder__control chart-builder__control--select"
                        :value="{{ $store }}.layout.legend.xanchor || 'auto'"
                        @change="{{ $store }}.layout.legend.xanchor = $event.target.value"
                    >
                        <option value="auto">{{ __('plotly-chart-editor::plotly-chart-editor.ui.legend_anchor_auto') }}</option>
                        <option value="left">{{ __('plotly-chart-editor::plotly-chart-editor.ui.legend_anchor_left') }}</option>
                        <option value="center">{{ __('plotly-chart-editor::plotly-chart-editor.ui.legend_anchor_center') }}</option>
                        <option value="right">{{ __('plotly-chart-editor::plotly-chart-editor.ui.legend_anchor_right') }}</option>
                    </select>
                    <div class="chart-builder__control-row" style="margin-top:0.25rem">
                        <input
                            type="range"
                            class="chart-builder__control chart-builder__control--range"
                            min="0"
                            max="1"
                            step="0.01"
                            :value="{{ $store }}.layout.legend.x ?? 1"
                            @change="{{ $store }}.layout.legend.x = parseFloat($event.target.value)"
                        >
                        <span
                            class="chart-builder__control-value"
                            x-text="Math.round(({{ $store }}.layout.legend.x ?? 1) * 100) + '%'"
                        ></span>
                    </div>
                </div>

                <div x-show="{{ $store }}.layout.showlegend" class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.legend_position_y') }}
                    </label>
                    <select
                        class="chart-builder__control chart-builder__control--select"
                        :value="{{ $store }}.layout.legend.yanchor || 'auto'"
                        @change="{{ $store }}.layout.legend.yanchor = $event.target.value"
                    >
                        <option value="auto">{{ __('plotly-chart-editor::plotly-chart-editor.ui.legend_anchor_auto') }}</option>
                        <option value="top">{{ __('plotly-chart-editor::plotly-chart-editor.ui.legend_anchor_top') }}</option>
                        <option value="middle">{{ __('plotly-chart-editor::plotly-chart-editor.ui.legend_anchor_middle') }}</option>
                        <option value="bottom">{{ __('plotly-chart-editor::plotly-chart-editor.ui.legend_anchor_bottom') }}</option>
                    </select>
                    <div class="chart-builder__control-row" style="margin-top:0.25rem">
                        <input
                            type="range"
                            class="chart-builder__control chart-builder__control--range"
                            min="0"
                            max="1"
                            step="0.01"
                            :value="{{ $store }}.layout.legend.y ?? 1"
                            @change="{{ $store }}.layout.legend.y = parseFloat($event.target.value)"
                        >
                        <span
                            class="chart-builder__control-value"
                            x-text="Math.round(({{ $store }}.layout.legend.y ?? 1) * 100) + '%'"
                        ></span>
                    </div>
                </div>

                <div x-show="{{ $store }}.layout.showlegend" class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.legend_title') }}
                    </label>
                    <input
                        type="text"
                        class="chart-builder__control chart-builder__control--text"
                        :value="{{ $store }}.layout.legend.title?.text ?? ''"
                        @change="{{ $store }}.layout.legend.title.text = $event.target.value"
                    >
                </div>

                <div x-show="{{ $store }}.layout.showlegend" class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.legend_title_font') }}
                    </label>
                    <x-plotly-chart-editor::primitives.font
                        :path="$store . '.layout.legend.title.font'"
                    />
                </div>

                <div x-show="{{ $store }}.layout.showlegend" class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.legend_font') }}
                    </label>
                    <x-plotly-chart-editor::primitives.font
                        :path="$store . '.layout.legend.font'"
                    />
                </div>

                <div x-show="{{ $store }}.layout.showlegend" class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.bg_color') }}
                    </label>
                    <input
                        type="color"
                        class="chart-builder__control chart-builder__control--color"
                        :value="{{ $store }}.layout.legend.bgcolor || '#ffffff'"
                        @change="{{ $store }}.layout.legend.bgcolor = $event.target.value"
                    >
                </div>

                <div x-show="{{ $store }}.layout.showlegend" class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.border_color') }}
                    </label>
                    <input
                        type="color"
                        class="chart-builder__control chart-builder__control--color"
                        :value="{{ $store }}.layout.legend.bordercolor || '#444444'"
                        @change="{{ $store }}.layout.legend.bordercolor = $event.target.value"
                    >
                </div>

                <div x-show="{{ $store }}.layout.showlegend" class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.border_width') }}
                    </label>
                    <input
                        type="number"
                        class="chart-builder__control chart-builder__control--number"
                        min="0"
                        max="10"
                        :value="{{ $store }}.layout.legend.borderwidth ?? 0"
                        @change="{{ $store }}.layout.legend.borderwidth = parseFloat($event.target.value)"
                    >
                </div>
            </div>

            {{-- Hover --}}
            <div class="chart-builder__group">
                <div class="chart-builder__group-label">
                    {{ __('plotly-chart-editor::plotly-chart-editor.ui.hovermode') }}
                </div>
                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.hovermode') }}
                    </label>
                    <select
                        class="chart-builder__control chart-builder__control--select"
                        x-model="{{ $store }}.layout.hovermode"
                    >
                        <option value="x">{{ __('plotly-chart-editor::plotly-chart-editor.fields.hovermode_x') }}</option>
                        <option value="y">{{ __('plotly-chart-editor::plotly-chart-editor.fields.hovermode_y') }}</option>
                        <option value="closest">{{ __('plotly-chart-editor::plotly-chart-editor.fields.hovermode_closest') }}</option>
                        <option value="x unified">{{ __('plotly-chart-editor::plotly-chart-editor.fields.hovermode_x_unified') }}</option>
                        <option value="y unified">{{ __('plotly-chart-editor::plotly-chart-editor.fields.hovermode_y_unified') }}</option>
                        <option value="false">{{ __('plotly-chart-editor::plotly-chart-editor.fields.hovermode_false') }}</option>
                    </select>
                </div>
                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.hover_label') }}
                    </label>
                    <x-plotly-chart-editor::primitives.font
                        :path="$store . '.layout.hoverlabel.font'"
                    />
                </div>
                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.hover_bgcolor') }}
                    </label>
                    <input
                        type="color"
                        class="chart-builder__control chart-builder__control--color"
                        :value="{{ $store }}.layout.hoverlabel.bgcolor || '#ffffff'"
                        @change="{{ $store }}.layout.hoverlabel.bgcolor = $event.target.value"
                    >
                </div>
                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.hover_bordercolor') }}
                    </label>
                    <input
                        type="color"
                        class="chart-builder__control chart-builder__control--color"
                        :value="{{ $store }}.layout.hoverlabel.bordercolor || '#444444'"
                        @change="{{ $store }}.layout.hoverlabel.bordercolor = $event.target.value"
                    >
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
            @click.outside="open = false"
        >
            <button
                type="button"
                class="chart-builder__btn"
                @click="open = !open"
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
                    @click="{{ $store }}.exportJSON(); open = false"
                >{{ __('plotly-chart-editor::plotly-chart-editor.export.json') }}</button>

                <button
                    type="button"
                    class="chart-builder__export-item"
                    @click="{{ $store }}.exportImage('png'); open = false"
                >{{ __('plotly-chart-editor::plotly-chart-editor.export.png') }}</button>

                <button
                    type="button"
                    class="chart-builder__export-item"
                    @click="{{ $store }}.exportImage('svg'); open = false"
                >{{ __('plotly-chart-editor::plotly-chart-editor.export.svg') }}</button>

                <button
                    type="button"
                    class="chart-builder__export-item"
                    @click="{{ $store }}.copyConfig(); open = false"
                >{{ __('plotly-chart-editor::plotly-chart-editor.export.copy') }}</button>

            </div>
        </div>

        {{-- Save button: visible in manual + hybrid, hidden in auto --}}
        <button
            type="button"
            class="chart-builder__btn chart-builder__btn--save"
            x-show="{{ $store }}.syncMode !== 'auto'"
            x-bind:disabled="{{ $store }}.syncing || !{{ $store }}.dirty"
            @click="{{ $store }}.syncToBackend()"
            x-text="{{ $store }}.syncing
                ? @js(__('plotly-chart-editor::plotly-chart-editor.sync.saving'))
                : @js(__('plotly-chart-editor::plotly-chart-editor.sync.save_button'))"
        ></button>
    </div>

</div>
