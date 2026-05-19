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
    {{-- ═══════════════════════════════════════════════════════════════
         SIDEBAR
    ══════════════════════════════════════════════════════════════════ --}}
    <div class="chart-builder__sidebar">

        {{-- ── Traces section header ───────────────────────────────── --}}
        <div class="chart-builder__section-header">
            <span class="chart-builder__section-title">
                {{ __('plotly-chart-editor::plotly-chart-editor.ui.traces_section') }}
            </span>
            <div class="chart-builder__section-actions">
                {{-- Add Trace --}}
                <button
                    type="button"
                    class="chart-builder__btn chart-builder__btn--icon"
                    title="{{ __('plotly-chart-editor::plotly-chart-editor.ui.add_trace') }}"
                    x-on:click="Alpine.store('chartBuilder').addTrace()"
                >+</button>

                {{-- Duplicate active trace --}}
                <button
                    type="button"
                    class="chart-builder__btn chart-builder__btn--icon"
                    title="{{ __('plotly-chart-editor::plotly-chart-editor.ui.duplicate_trace') }}"
                    x-on:click="Alpine.store('chartBuilder').duplicateTrace()"
                    x-bind:disabled="Alpine.store('chartBuilder').traces.length === 0"
                >⧉</button>

                {{-- Delete active trace --}}
                <button
                    type="button"
                    class="chart-builder__btn chart-builder__btn--icon chart-builder__btn--danger"
                    title="{{ __('plotly-chart-editor::plotly-chart-editor.ui.delete_trace') }}"
                    x-on:click="Alpine.store('chartBuilder').removeTrace()"
                    x-bind:disabled="Alpine.store('chartBuilder').traces.length === 0"
                >×</button>
            </div>
        </div>

        {{-- ── Trace list ──────────────────────────────────────────── --}}
        <div class="chart-builder__trace-list">
            <template
                x-for="(trace, index) in Alpine.store('chartBuilder').traces"
                :key="index"
            >
                <div
                    class="chart-builder__trace-row"
                    x-bind:class="{ 'chart-builder__trace-row--active': Alpine.store('chartBuilder').activeTraceIndex === index }"
                    x-on:click="Alpine.store('chartBuilder').activeTraceIndex = index"
                >
                    {{-- Trace name --}}
                    <span
                        class="chart-builder__trace-name"
                        x-text="trace.name || ('Trace ' + (index + 1))"
                    ></span>

                    {{-- Reorder arrows --}}
                    <div class="chart-builder__trace-actions">
                        <button
                            type="button"
                            class="chart-builder__btn chart-builder__btn--xs"
                            title="{{ __('plotly-chart-editor::plotly-chart-editor.ui.move_up') }}"
                            x-on:click.stop="Alpine.store('chartBuilder').moveTraceUp(index)"
                            x-bind:disabled="index === 0"
                        >↑</button>
                        <button
                            type="button"
                            class="chart-builder__btn chart-builder__btn--xs"
                            title="{{ __('plotly-chart-editor::plotly-chart-editor.ui.move_down') }}"
                            x-on:click.stop="Alpine.store('chartBuilder').moveTraceDown(index)"
                            x-bind:disabled="index === Alpine.store('chartBuilder').traces.length - 1"
                        >↓</button>
                    </div>
                </div>
            </template>

            <template x-if="Alpine.store('chartBuilder').traces.length === 0">
                <p class="chart-builder__no-profile">No traces yet. Click + to add one.</p>
            </template>
        </div>

        {{-- ── Active trace fields ─────────────────────────────────── --}}
        <div
            class="chart-builder__active-trace"
            x-show="Alpine.store('chartBuilder').traces.length > 0"
        >
            {{-- Type selector --}}
            <div class="chart-builder__field">
                <label class="chart-builder__field-label">
                    {{ __('plotly-chart-editor::plotly-chart-editor.ui.type_label') }}
                </label>
                <select
                    class="chart-builder__control chart-builder__control--select"
                    :value="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex]?.type"
                    @change="Alpine.store('chartBuilder').setTraceType(Alpine.store('chartBuilder').activeTraceIndex, $event.target.value)"
                >
                    <template
                        x-for="t in Alpine.store('chartBuilder').traceTypes"
                        :key="t"
                    >
                        <option
                            :value="t"
                            x-text="t"
                            :selected="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex]?.type === t"
                        ></option>
                    </template>
                </select>
            </div>

            {{-- Data group fields from schema profile --}}
            <div
                class="chart-builder__group"
                x-data="{
                    get profile() {
                        var store = Alpine.store('chartBuilder');
                        var type  = store.traces[store.activeTraceIndex]?.type ?? 'bar';
                        return store.schemaProfiles[type] ?? null;
                    },
                    get dataGroup() {
                        return this.profile?.groups?.Data ?? null;
                    }
                }"
            >
                <template x-if="dataGroup">
                    <div>
                        <template x-for="field in dataGroup.fields" :key="field.key">
                            <div
                                class="chart-builder__field"
                                x-show="field.xshow
                                    ? (new Function('trace','traceType','return ' + field.xshow))(
                                        Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex],
                                        Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex]?.type
                                      )
                                    : true"
                            >
                                <label class="chart-builder__field-label" x-text="field.label"></label>

                                {{-- column: use :value + @change + :selected per option
                                     to avoid x-model timing bug when options are
                                     populated via x-for after x-model first evaluates --}}
                                <template x-if="field.type === 'column'">
                                    <select
                                        class="chart-builder__control chart-builder__control--select"
                                        :value="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex].meta.columnNames[field.key]"
                                        @change="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex].meta.columnNames[field.key] = $event.target.value"
                                    >
                                        <option value="" :selected="!Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex].meta.columnNames[field.key]">— select column —</option>
                                        <template x-for="col in Object.keys(Alpine.store('chartBuilder').dataSources)" :key="col">
                                            <option
                                                :value="col"
                                                x-text="col"
                                                :selected="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex].meta.columnNames[field.key] === col"
                                            ></option>
                                        </template>
                                    </select>
                                </template>

                                {{-- enumerated: same pattern --}}
                                <template x-if="field.type === 'enumerated'">
                                    <select
                                        class="chart-builder__control chart-builder__control--select"
                                        :value="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex][field.key]"
                                        @change="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex][field.key] = $event.target.value"
                                    >
                                        <template x-for="val in (field.values ?? [])" :key="val">
                                            <option
                                                :value="val"
                                                x-text="val || '(none)'"
                                                :selected="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex][field.key] === val"
                                            ></option>
                                        </template>
                                    </select>
                                </template>

                                {{-- color --}}
                                <template x-if="field.type === 'color'">
                                    <input
                                        type="color"
                                        class="chart-builder__control chart-builder__control--color"
                                        x-model="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex][field.key]"
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
                                            x-model.number="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex][field.key]"
                                        >
                                        <span
                                            class="chart-builder__control-value"
                                            x-text="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex][field.key]"
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
                                        x-model.number="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex][field.key]"
                                    >
                                </template>

                                {{-- text --}}
                                <template x-if="field.type === 'text'">
                                    <input
                                        type="text"
                                        class="chart-builder__control chart-builder__control--text"
                                        x-model="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex][field.key]"
                                    >
                                </template>

                                {{-- boolean --}}
                                <template x-if="field.type === 'boolean'">
                                    <input
                                        type="checkbox"
                                        class="chart-builder__control chart-builder__control--checkbox"
                                        x-model="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex][field.key]"
                                    >
                                </template>
                            </div>
                        </template>
                    </div>
                </template>
            </div>
        </div>

    </div>{{-- end sidebar --}}

    {{-- ═══════════════════════════════════════════════════════════════
         CANVAS
    ══════════════════════════════════════════════════════════════════ --}}
    <div
        class="chart-builder__canvas"
        data-plotly-canvas
        wire:ignore
    ></div>

</div>
