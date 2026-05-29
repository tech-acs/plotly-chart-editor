@php
    $store    = "Alpine.store('chartBuilder')";
    $atrace   = "({$store}.traces[{$store}.activeTraceIndex] ?? {})"; // active trace object (safe empty fallback)

    $traceLabel = __('plotly-chart-editor::plotly-chart-editor.trace_label', ['n' => '%s']);
    if ($traceLabel === 'plotly-chart-editor::plotly-chart-editor.trace_label') {
        $traceLabel = 'Trace %s';
    }
@endphp

<div
    x-cloak
    id="plotly-editor-root"
    class="chart-builder"
    data-chart-builder-payload="{{ json_encode([
        'dataSources'    => $dataSources,
        'traces'         => $data,
        'layout'         => $layout,
        'config'         => array_merge(['locale' => app()->getLocale()], $config),
        'traceTypes'     => $traceTypes,
        'syncMode'       => $syncMode,
        'showExport'     => $showExport,
        'showDataViewer' => $showDataViewer,
        'schemaProfiles' => empty($schemaProfiles) ? (object) [] : $schemaProfiles,
    ]) }}"
    x-data
    x-init="
        (function () {
            var payload    = JSON.parse($el.dataset.chartBuilderPayload);
            var missingMsg = @js(__('plotly-chart-editor::plotly-chart-editor.errors.plotly_missing'));
            var deleteMsg  = @js(__('plotly-chart-editor::plotly-chart-editor.confirmations.delete_trace'));
            var deleteAnnMsg = @js(__('plotly-chart-editor::plotly-chart-editor.confirmations.delete_annotation'));
            var lengthMismatchMsg = @js(__('plotly-chart-editor::plotly-chart-editor.warnings.length_mismatch'));
            var profileLoadFailedMsg = @js(__('plotly-chart-editor::plotly-chart-editor.errors.profile_load_failed'));
            var clearAllMsg = @js(__('plotly-chart-editor::plotly-chart-editor.confirmations.clear_all'));
            var canvas     = $el.querySelector('[data-plotly-canvas]');
            window.bootChartBuilder(payload, missingMsg, deleteMsg, deleteAnnMsg, canvas, $wire, lengthMismatchMsg, profileLoadFailedMsg, clearAllMsg);
        })();
    "
>
    {{-- ── Viewport-too-small placeholder ── --}}
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
                            x-text="trace.name || @js($traceLabel).replace('%s', index + 1)"
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
                                                        x-show="{{ $store }}.warnings.some(w => w.traceIndex === {{ $store }}.activeTraceIndex && w.field === field.key)"
                                                        x-text="({{ $store }}.warnings.find(w => w.traceIndex === {{ $store }}.activeTraceIndex && w.field === field.key)?.message) ?? ''"
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
                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.title_automargin') }}
                    </label>
                    <input
                        type="checkbox"
                        class="chart-builder__control chart-builder__control--checkbox"
                        x-model="{{ $store }}.layout.title.automargin"
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

            {{-- Defaults --}}
            <div class="chart-builder__group">
                <div class="chart-builder__group-label">
                    {{ __('plotly-chart-editor::plotly-chart-editor.ui.defaults') }}
                </div>
                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.global_font') }}
                    </label>
                    <x-plotly-chart-editor::primitives.font
                        :path="$store . '.layout.font'"
                    />
                </div>
                <div class="chart-builder__field" style="margin-top:0.5rem">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.uniformtext') }}
                    </label>
                </div>
                <div class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.mode') }}
                    </label>
                    <select
                        class="chart-builder__control chart-builder__control--select"
                        x-model="{{ $store }}.layout.uniformtext.mode"
                    >
                        <option x-bind:value="false">{{ __('plotly-chart-editor::plotly-chart-editor.fields.off') }}</option>
                        <option value="hide">{{ __('plotly-chart-editor::plotly-chart-editor.fields.uniformtext_hide') }}</option>
                        <option value="show">{{ __('plotly-chart-editor::plotly-chart-editor.fields.uniformtext_show') }}</option>
                    </select>
                    <label class="chart-builder__field-label" style="margin-left:0.25rem">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.uniformtext_minsize') }}
                    </label>
                    <input
                        type="number"
                        class="chart-builder__control chart-builder__control--number"
                        style="max-width:5rem"
                        min="0"
                        max="48"
                        :value="{{ $store }}.layout.uniformtext.minsize ?? 0"
                        @change="{{ $store }}.layout.uniformtext.minsize = parseFloat($event.target.value)"
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

                <div x-show="{{ $store }}.layout.showlegend" class="chart-builder__field" style="margin-top:0.5rem">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_h_positioning') }}
                    </label>
                </div>
                <div x-show="{{ $store }}.layout.showlegend" class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor') }}
                    </label>
                    <select
                        class="chart-builder__control chart-builder__control--select"
                        x-model="{{ $store }}.layout.legend.xanchor"
                    >
                        <option value="auto">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_auto') }}</option>
                        <option value="left">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_left') }}</option>
                        <option value="center">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_center') }}</option>
                        <option value="right">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_right') }}</option>
                    </select>
                </div>
                <div x-show="{{ $store }}.layout.showlegend" class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.position') }}
                    </label>
                    <div class="chart-builder__control-row">
                        <input
                            type="range"
                            class="chart-builder__control chart-builder__control--range"
                            min="-2"
                            max="3"
                            step="0.05"
                            :value="{{ $store }}.layout.legend.x ?? 1"
                            @change="{{ $store }}.layout.legend.x = parseFloat($event.target.value)"
                        >
                        <span class="chart-builder__control-value" x-text="{{ $store }}.layout.legend.x ?? 1"></span>
                    </div>
                </div>

                <div x-show="{{ $store }}.layout.showlegend" class="chart-builder__field" style="margin-top:0.5rem">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_v_positioning') }}
                    </label>
                </div>
                <div x-show="{{ $store }}.layout.showlegend" class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor') }}
                    </label>
                    <select
                        class="chart-builder__control chart-builder__control--select"
                        x-model="{{ $store }}.layout.legend.yanchor"
                    >
                        <option value="auto">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_auto') }}</option>
                        <option value="top">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_top') }}</option>
                        <option value="middle">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_middle') }}</option>
                        <option value="bottom">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_bottom') }}</option>
                    </select>
                </div>
                <div x-show="{{ $store }}.layout.showlegend" class="chart-builder__field">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.position') }}
                    </label>
                    <div class="chart-builder__control-row">
                        <input
                            type="range"
                            class="chart-builder__control chart-builder__control--range"
                            min="-2"
                            max="3"
                            step="0.05"
                            :value="{{ $store }}.layout.legend.y ?? 1"
                            @change="{{ $store }}.layout.legend.y = parseFloat($event.target.value)"
                        >
                        <span class="chart-builder__control-value" x-text="{{ $store }}.layout.legend.y ?? 1"></span>
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

            {{-- Hover & Interaction --}}
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
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.hoverlabel_align') }}
                    </label>
                    <select
                        class="chart-builder__control chart-builder__control--select"
                        x-model="{{ $store }}.layout.hoverlabel.align"
                    >
                        <option value="auto">{{ __('plotly-chart-editor::plotly-chart-editor.fields.align_auto') }}</option>
                        <option value="left">{{ __('plotly-chart-editor::plotly-chart-editor.fields.align_left') }}</option>
                        <option value="right">{{ __('plotly-chart-editor::plotly-chart-editor.fields.align_right') }}</option>
                    </select>
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
                <div class="chart-builder__field" style="margin-top:0.5rem">
                    <label class="chart-builder__field-label">
                        {{ __('plotly-chart-editor::plotly-chart-editor.fields.dragmode') }}
                    </label>
                    <select
                        class="chart-builder__control chart-builder__control--select"
                        x-model="{{ $store }}.layout.dragmode"
                    >
                        <option value="zoom">{{ __('plotly-chart-editor::plotly-chart-editor.fields.dragmode_zoom') }}</option>
                        <option value="pan">{{ __('plotly-chart-editor::plotly-chart-editor.fields.dragmode_pan') }}</option>
                        <option value="select">{{ __('plotly-chart-editor::plotly-chart-editor.fields.dragmode_select') }}</option>
                        <option value="lasso">{{ __('plotly-chart-editor::plotly-chart-editor.fields.dragmode_lasso') }}</option>
                        <option x-bind:value="false">{{ __('plotly-chart-editor::plotly-chart-editor.fields.off') }}</option>
                    </select>
                </div>
            </div>
        </x-plotly-chart-editor::fold>

        {{-- ══════════════════════════════════════════════════════
             FOLD 4 — ANNOTATIONS
        ═══════════════════════════════════════════════════════ --}}
        <x-plotly-chart-editor::fold
            :title="__('plotly-chart-editor::plotly-chart-editor.ui.fold_annotations')"
            :open="false"
        >
            <div
                x-data="{
                    _annotationToAdd: '',
                    _shapeLabels: {
                        rect: @js(__('plotly-chart-editor::plotly-chart-editor.annotations.annotation_shape_type_rect')),
                        circle: @js(__('plotly-chart-editor::plotly-chart-editor.annotations.annotation_shape_type_circle')),
                        line: @js(__('plotly-chart-editor::plotly-chart-editor.annotations.annotation_shape_type_line')),
                    }
                }"
            >
                {{-- Add annotation button + type selector --}}
                <div class="chart-builder__section-header">
                    <span class="chart-builder__section-title">
                        {{ __('plotly-chart-editor::plotly-chart-editor.ui.add_annotation') }}
                    </span>
                    <div class="chart-builder__section-actions">
                        <select
                            class="chart-builder__control chart-builder__control--select"
                            style="width:auto;min-width:80px"
                            x-model="_annotationToAdd"
                            @change="if (_annotationToAdd) { {{ $store }}.addAnnotation(_annotationToAdd); _annotationToAdd = '' }"
                        >
                            <option value="">{{ __('plotly-chart-editor::plotly-chart-editor.ui.select_type') }}</option>
                            <option value="text">{{ __('plotly-chart-editor::plotly-chart-editor.ui.annotation_text') }}</option>
                            <option value="shape">{{ __('plotly-chart-editor::plotly-chart-editor.ui.annotation_shape') }}</option>
                            <option value="image">{{ __('plotly-chart-editor::plotly-chart-editor.ui.annotation_image') }}</option>
                        </select>
                    </div>
                </div>

                {{-- Annotation cards --}}
                <template
                    x-for="(ann, idx) in {{ $store }}.layout._annotations"
                    :key="idx"
                >
                    <div
                        class="chart-builder__annotation-card"
                        x-data="{ open: true }"
                        :class="{ 'chart-builder__annotation-card--open': open }"
                    >
                        {{-- Card header (clickable to toggle body) --}}
                        <div
                            class="chart-builder__annotation-card__header"
                            @click="open = !open"
                            role="button"
                            :aria-expanded="open"
                        >
                            <span class="chart-builder__annotation-card__arrow" x-text="open ? '▾' : '▸'" aria-hidden="true"></span>
                            <span class="chart-builder__annotation-card__title" x-text="ann._plotlyType === 'text' ? ann.text : (ann._plotlyType === 'shape' ? 'Shape: ' + (_shapeLabels[ann.type] || ann.type) : 'Image')"></span>
                        <div class="chart-builder__annotation-card__actions">
                            <button
                                type="button"
                                class="chart-builder__btn chart-builder__btn--xs"
                                title="{{ __('plotly-chart-editor::plotly-chart-editor.ui.move_up') }}"
                                @click.stop="{{ $store }}.moveAnnotationUp(idx)"
                                x-bind:disabled="idx === 0"
                            >↑</button>
                            <button
                                type="button"
                                class="chart-builder__btn chart-builder__btn--xs"
                                title="{{ __('plotly-chart-editor::plotly-chart-editor.ui.move_down') }}"
                                @click.stop="{{ $store }}.moveAnnotationDown(idx)"
                                x-bind:disabled="idx === {{ $store }}.layout._annotations.length - 1"
                            >↓</button>
                            <button
                                type="button"
                                class="chart-builder__btn chart-builder__btn--xs chart-builder__btn--danger"
                                title="{{ __('plotly-chart-editor::plotly-chart-editor.ui.delete_annotation') }}"
                                @click.stop="{{ $store }}.removeAnnotation(idx)"
                            >×</button>
                        </div>
                        </div>

                        {{-- Card body --}}
                        <div
                            class="chart-builder__annotation-card__fields"
                            x-show="open"
                        >

                        {{-- ═══ TEXT TYPE ═══ --}}
                        <template x-if="ann._plotlyType === 'text'">
                            <div>
                                {{-- Text section --}}
                                <div class="chart-builder__group">
                                    <div class="chart-builder__group-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_text_section') }}</div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_text') }}</label>
                                        <input type="text" class="chart-builder__control chart-builder__control--text" x-model="ann.text">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.font_family') }}</label>
                                        <input type="text" class="chart-builder__control chart-builder__control--text" x-model="ann.font.family">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.font_size') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" min="1" max="72" x-model="ann.font.size">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.font_color') }}</label>
                                        <input type="color" class="chart-builder__control chart-builder__control--color" x-model="ann.font.color">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_textangle') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" min="-360" max="360" x-model="ann.textangle">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_align') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.align">
                                            <option value="left">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_align_left') }}</option>
                                            <option value="center">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_align_center') }}</option>
                                            <option value="right">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_align_right') }}</option>
                                        </select>
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_valign') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.valign">
                                            <option value="top">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_valign_top') }}</option>
                                            <option value="middle">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_valign_middle') }}</option>
                                            <option value="bottom">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_valign_bottom') }}</option>
                                        </select>
                                    </div>
                                </div>

                                {{-- Arrow section --}}
                                <div class="chart-builder__group">
                                    <div class="chart-builder__group-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_arrow') }}</div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_showarrow') }}</label>
                                        <input type="checkbox" class="chart-builder__control chart-builder__control--checkbox" x-model="ann.showarrow">
                                    </div>
                                    <div class="chart-builder__field" x-show="ann.showarrow">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_arrowcolor') }}</label>
                                        <input type="color" class="chart-builder__control chart-builder__control--color" x-model="ann.arrowcolor">
                                    </div>
                                    <div class="chart-builder__field" x-show="ann.showarrow">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_arrowhead') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.arrowhead">
                                            <option value="0">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_arrowhead_0') }}</option>
                                            <option value="1">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_arrowhead_1') }}</option>
                                            <option value="2">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_arrowhead_2') }}</option>
                                            <option value="3">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_arrowhead_3') }}</option>
                                            <option value="4">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_arrowhead_4') }}</option>
                                            <option value="5">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_arrowhead_5') }}</option>
                                            <option value="6">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_arrowhead_6') }}</option>
                                            <option value="7">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_arrowhead_7') }}</option>
                                        </select>
                                    </div>
                                    <div class="chart-builder__field" x-show="ann.showarrow">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_arrowwidth') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" min="0" max="10" step="0.5" x-model="ann.arrowwidth">
                                    </div>
                                    <div class="chart-builder__field" x-show="ann.showarrow">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_arrowsize') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" min="0" max="5" step="0.1" x-model="ann.arrowsize">
                                    </div>
                                    <div class="chart-builder__field" x-show="ann.showarrow">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_ax') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" x-model="ann.ax">
                                    </div>
                                    <div class="chart-builder__field" x-show="ann.showarrow">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_ay') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" x-model="ann.ay">
                                    </div>
                                </div>

                                {{-- H. position --}}
                                <div class="chart-builder__group">
                                    <div class="chart-builder__group-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_h_position') }}</div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_x') }}</label>
                                        <div class="chart-builder__control-row">
                                            <input type="range" class="chart-builder__control chart-builder__control--range" min="-2" max="3" step="0.05" x-model="ann.x">
                                            <span class="chart-builder__control-value" x-text="ann.x"></span>
                                        </div>
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_xanchor') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.xanchor">
                                            <option value="auto">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_anchor_auto') }}</option>
                                            <option value="left">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_left') }}</option>
                                            <option value="center">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_center') }}</option>
                                            <option value="right">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_right') }}</option>
                                        </select>
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_xref') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.xref">
                                            <option value="paper">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_ref_paper') }}</option>
                                            <option value="x">x</option>
                                        </select>
                                    </div>
                                </div>

                                {{-- V. position --}}
                                <div class="chart-builder__group">
                                    <div class="chart-builder__group-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_v_position') }}</div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_y') }}</label>
                                        <div class="chart-builder__control-row">
                                            <input type="range" class="chart-builder__control chart-builder__control--range" min="-2" max="3" step="0.05" x-model="ann.y">
                                            <span class="chart-builder__control-value" x-text="ann.y"></span>
                                        </div>
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_yanchor') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.yanchor">
                                            <option value="auto">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_anchor_auto') }}</option>
                                            <option value="top">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_top') }}</option>
                                            <option value="middle">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_middle') }}</option>
                                            <option value="bottom">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_bottom') }}</option>
                                        </select>
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_yref') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.yref">
                                            <option value="paper">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_ref_paper') }}</option>
                                            <option value="y">y</option>
                                        </select>
                                    </div>
                                </div>

                                {{-- Box section --}}
                                <div class="chart-builder__group">
                                    <div class="chart-builder__group-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_box') }}</div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_bgcolor') }}</label>
                                        <input type="color" class="chart-builder__control chart-builder__control--color" x-model="ann.bgcolor">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_bordercolor') }}</label>
                                        <input type="color" class="chart-builder__control chart-builder__control--color" x-model="ann.bordercolor">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_borderwidth') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" min="0" max="20" x-model="ann.borderwidth">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_borderpad') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" min="0" max="20" x-model="ann.borderpad">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_opacity') }}</label>
                                        <div class="chart-builder__control-row">
                                            <input type="range" class="chart-builder__control chart-builder__control--range" min="0" max="1" step="0.05" x-model="ann.opacity">
                                            <span class="chart-builder__control-value" x-text="ann.opacity"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>

                        {{-- ═══ SHAPE TYPE ═══ --}}
                        <template x-if="ann._plotlyType === 'shape'">
                            <div>
                                <div class="chart-builder__group">
                                    <div class="chart-builder__group-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_shape_section') }}</div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_shape_type') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.type">
                                            <option value="rect">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_shape_type_rect') }}</option>
                                            <option value="circle">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_shape_type_circle') }}</option>
                                            <option value="line">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_shape_type_line') }}</option>
                                        </select>
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_x0') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" x-model="ann.x0">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_y0') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" x-model="ann.y0">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_x1') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" x-model="ann.x1">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_y1') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" x-model="ann.y1">
                                    </div>
                                </div>
                                <div class="chart-builder__group">
                                    <div class="chart-builder__group-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_shape_line') }}</div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.line_color') }}</label>
                                        <input type="color" class="chart-builder__control chart-builder__control--color" x-model="ann.line.color">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.line_width') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" min="0" max="20" x-model="ann.line.width">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_dash') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.line.dash">
                                            <option value="solid">{{ __('plotly-chart-editor::plotly-chart-editor.fields.dash') }}</option>
                                            <option value="dot">dot</option>
                                            <option value="dash">dash</option>
                                            <option value="longdash">longdash</option>
                                            <option value="dashdot">dashdot</option>
                                            <option value="longdashdot">longdashdot</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="chart-builder__group">
                                    <div class="chart-builder__group-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_shape_fill') }}</div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.fields.fillcolor') }}</label>
                                        <input type="color" class="chart-builder__control chart-builder__control--color" x-model="ann.fillcolor">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_opacity') }}</label>
                                        <div class="chart-builder__control-row">
                                            <input type="range" class="chart-builder__control chart-builder__control--range" min="0" max="1" step="0.05" x-model="ann.opacity">
                                            <span class="chart-builder__control-value" x-text="ann.opacity"></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="chart-builder__group">
                                    <div class="chart-builder__group-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_layer') }}</div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_layer') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.layer">
                                            <option value="above">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_layer_above') }}</option>
                                            <option value="below">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_layer_below') }}</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="chart-builder__group">
                                    <div class="chart-builder__group-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_reference') }}</div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_xref') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.xref">
                                            <option value="paper">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_ref_paper') }}</option>
                                            <option value="x">x</option>
                                        </select>
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_yref') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.yref">
                                            <option value="paper">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_ref_paper') }}</option>
                                            <option value="y">y</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </template>

                        {{-- ═══ IMAGE TYPE ═══ --}}
                        <template x-if="ann._plotlyType === 'image'">
                            <div>
                                <div class="chart-builder__group">
                                    <div class="chart-builder__group-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_source') }}</div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_source') }}</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            class="chart-builder__control chart-builder__control--text"
                                            @click="$event.target.value = null"
                                            @change="const f = $event.target.files[0]; if (f) { const r = new FileReader(); r.onload = e => ann.source = e.target.result; r.readAsDataURL(f) }"
                                        >
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_x') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" x-model="ann.x">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_y') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" x-model="ann.y">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_sizex') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" min="0" step="0.05" x-model="ann.sizex">
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_sizey') }}</label>
                                        <input type="number" class="chart-builder__control chart-builder__control--number" min="0" step="0.05" x-model="ann.sizey">
                                    </div>
                                </div>
                                <div class="chart-builder__group">
                                    <div class="chart-builder__group-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_display') }}</div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_sizing') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.sizing">
                                            <option value="fill">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_sizing_fill') }}</option>
                                            <option value="contain">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_sizing_contain') }}</option>
                                            <option value="stretch">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_sizing_stretch') }}</option>
                                        </select>
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_xanchor') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.xanchor">
                                            <option value="left">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_left') }}</option>
                                            <option value="center">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_center') }}</option>
                                            <option value="right">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_right') }}</option>
                                        </select>
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_yanchor') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.yanchor">
                                            <option value="top">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_top') }}</option>
                                            <option value="middle">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_middle') }}</option>
                                            <option value="bottom">{{ __('plotly-chart-editor::plotly-chart-editor.fields.legend_anchor_bottom') }}</option>
                                        </select>
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_layer') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.layer">
                                            <option value="above">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_layer_above') }}</option>
                                            <option value="below">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_layer_below') }}</option>
                                        </select>
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_opacity') }}</label>
                                        <div class="chart-builder__control-row">
                                            <input type="range" class="chart-builder__control chart-builder__control--range" min="0" max="1" step="0.05" x-model="ann.opacity">
                                            <span class="chart-builder__control-value" x-text="ann.opacity"></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="chart-builder__group">
                                    <div class="chart-builder__group-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_reference') }}</div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_xref') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.xref">
                                            <option value="paper">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_ref_paper') }}</option>
                                            <option value="x">x</option>
                                        </select>
                                    </div>
                                    <div class="chart-builder__field">
                                        <label class="chart-builder__field-label">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_yref') }}</label>
                                        <select class="chart-builder__control chart-builder__control--select" x-model="ann.yref">
                                            <option value="paper">{{ __('plotly-chart-editor::plotly-chart-editor.annotations.annotation_ref_paper') }}</option>
                                            <option value="y">y</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </template>

                    </div>
                </div>
            </template>

            {{-- Empty state --}}
            <template x-if="!{{ $store }}.layout._annotations || {{ $store }}.layout._annotations.length === 0">
                <p class="chart-builder__no-profile">
                    {{ __('plotly-chart-editor::plotly-chart-editor.ui.add_annotation') }} →
                </p>
            </template>
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
        @php
            $warnSingular = preg_replace('/^\d+\s+/', '', trans_choice('plotly-chart-editor::plotly-chart-editor.warnings.badge', 1));
            $warnPlural   = preg_replace('/^\d+\s+/', '', trans_choice('plotly-chart-editor::plotly-chart-editor.warnings.badge', 2));
        @endphp
        {{-- Warning badge --}}
        <div
            class="chart-builder__warning"
            x-show="{{ $store }}.warnings.length > 0"
            x-text="'⚠ ' + {{ $store }}.warnings.length + ' ' + ({{ $store }}.warnings.length === 1 ? '{{ $warnSingular }}' : '{{ $warnPlural }}')"
        ></div>

        {{-- Dirty indicator --}}
        <span
            class="chart-builder__dirty-indicator"
            x-show="{{ $store }}.dirty && !{{ $store }}.syncing"
            title="{{ __('plotly-chart-editor::plotly-chart-editor.sync.save_button') }}"
        >●</span>

        {{-- "Synced ✓" transient message (auto mode) --}}
        <span
            class="chart-builder__saved-msg"
            x-show="{{ $store }}.savedAt !== null"
            x-text="@js(__('plotly-chart-editor::plotly-chart-editor.sync.saved'))"
        ></span>

        {{-- Clear All button --}}
        <button
            type="button"
            class="chart-builder__btn chart-builder__btn--danger"
            @click="{{ $store }}.clearAll()"
        ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75V4H2.75a.75.75 0 000 1.5h.97l.721 11.653A1.75 1.75 0 006.183 18.5h7.634a1.75 1.75 0 001.741-1.347L16.28 5.5h.97a.75.75 0 000-1.5H14V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25V4h5zM5.265 5.5l.66 10.652a.25.25 0 00.249.348h7.634a.25.25 0 00.249-.348l.66-10.652H5.265z" clip-rule="evenodd"/></svg>{{ __('plotly-chart-editor::plotly-chart-editor.ui.clear_all') }}</button>

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
            ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z"/><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z"/></svg>{{ __('plotly-chart-editor::plotly-chart-editor.export.button') }} ▾</button>

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

        {{-- View Data button — opens data viewer modal --}}
        <button
            type="button"
            class="chart-builder__btn"
            x-show="{{ $store }}.showDataViewer"
            @click="$dispatch('open-data-viewer')"
        ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M4.5 2A2.5 2.5 0 002 4.5v11A2.5 2.5 0 004.5 18h11a2.5 2.5 0 002.5-2.5v-11A2.5 2.5 0 0015.5 2h-11zM4 4.5a.5.5 0 01.5-.5h11a.5.5 0 01.5.5V6H4V4.5zm0 2.5h4v4H4V7zm0 6h4v4H4v-4zm6-6h4v4h-4V7zm0 6h4v4h-4v-4z" clip-rule="evenodd"/></svg>{{ __('plotly-chart-editor::plotly-chart-editor.export.view_data') }}</button>

        {{-- Save button: visible in manual + hybrid, hidden in auto --}}
        <button
            type="button"
            class="chart-builder__btn chart-builder__btn--save"
            x-show="{{ $store }}.syncMode !== 'auto'"
            x-bind:disabled="{{ $store }}.syncing || !{{ $store }}.dirty"
            @click="{{ $store }}.syncToBackend()"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/></svg>
            <span
                x-text="{{ $store }}.syncing
                    ? @js(__('plotly-chart-editor::plotly-chart-editor.sync.saving'))
                    : @js(__('plotly-chart-editor::plotly-chart-editor.sync.save_button'))"
            ></span>
        </button>

    {{-- ═══ DATA VIEWER MODAL ═══ --}}
    <div
        x-data="{ open: false }"
        x-on:open-data-viewer.window="open = true"
        x-show="open"
        x-cloak
        class="chart-builder__modal-overlay"
        @click.self="open = false"
        @keydown.escape.window="open = false"
    >
        <div class="chart-builder__modal">
            <div class="chart-builder__modal-header">
                <span class="chart-builder__modal-title">
                    {{ __('plotly-chart-editor::plotly-chart-editor.export.view_data_title') }}
                </span>
                <button
                    type="button"
                    class="chart-builder__btn chart-builder__btn--icon"
                    @click="open = false"
                >×</button>
            </div>
            <div class="chart-builder__modal-body">
                {{-- Empty state --}}
                <p
                    class="chart-builder__no-profile"
                    x-show="Object.keys({{ $store }}.dataSources).length === 0"
                >{{ __('plotly-chart-editor::plotly-chart-editor.export.view_data_empty') }}</p>

                {{-- Data table --}}
                <table
                    class="chart-builder__data-table"
                    x-show="Object.keys({{ $store }}.dataSources).length > 0"
                >
                    <thead>
                        <tr>
                            <template x-for="col in Object.keys({{ $store }}.dataSources)" :key="col">
                                <th x-text="col"></th>
                            </template>
                        </tr>
                    </thead>
                    <tbody>
                        <template
                            x-for="(_, rowIdx) in (Object.values({{ $store }}.dataSources)[0] ?? [])"
                            :key="rowIdx"
                        >
                            <tr>
                                <template x-for="col in Object.keys({{ $store }}.dataSources)" :key="col">
                                    <td x-text="{{ $store }}.dataSources[col]?.[rowIdx] ?? ''"></td>
                                </template>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    </div>

</div>
