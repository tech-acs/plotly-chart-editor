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
            var canvas     = $el.querySelector('[data-plotly-canvas]');
            window.bootChartBuilder(payload, missingMsg, canvas, $wire);
        })();
    "
>
    {{-- ── Sidebar ──────────────────────────────────────────────────── --}}
    <div class="chart-builder__sidebar">

        {{-- Active trace fields (Data group only — folds come in Phase 6) --}}
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
                            x-show="field.xshow ? (new Function('trace', 'traceType', 'return ' + field.xshow))(
                                Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex],
                                Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex]?.type
                            ) : true"
                        >
                            <label
                                class="chart-builder__field-label"
                                x-text="field.label"
                            ></label>

                            {{-- column type --}}
                            <template x-if="field.type === 'column'">
                                <select
                                    class="chart-builder__control chart-builder__control--select"
                                    x-model="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex].meta.columnNames[field.key]"
                                >
                                    <option value="">— select column —</option>
                                    <template
                                        x-for="col in Object.keys(Alpine.store('chartBuilder').dataSources)"
                                        :key="col"
                                    >
                                        <option :value="col" x-text="col"></option>
                                    </template>
                                </select>
                            </template>

                            {{-- enumerated type --}}
                            <template x-if="field.type === 'enumerated'">
                                <select
                                    class="chart-builder__control chart-builder__control--select"
                                    x-model="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex][field.key]"
                                >
                                    <template x-for="val in (field.values ?? [])" :key="val">
                                        <option :value="val" x-text="val || '(none)'"></option>
                                    </template>
                                </select>
                            </template>

                            {{-- color type --}}
                            <template x-if="field.type === 'color'">
                                <input
                                    type="color"
                                    class="chart-builder__control chart-builder__control--color"
                                    x-model="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex][field.key]"
                                >
                            </template>

                            {{-- range type --}}
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

                            {{-- number type --}}
                            <template x-if="field.type === 'number'">
                                <input
                                    type="number"
                                    class="chart-builder__control chart-builder__control--number"
                                    :min="field.min ?? undefined"
                                    :max="field.max ?? undefined"
                                    x-model.number="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex][field.key]"
                                >
                            </template>

                            {{-- text type --}}
                            <template x-if="field.type === 'text'">
                                <input
                                    type="text"
                                    class="chart-builder__control chart-builder__control--text"
                                    x-model="Alpine.store('chartBuilder').traces[Alpine.store('chartBuilder').activeTraceIndex][field.key]"
                                >
                            </template>

                            {{-- boolean type --}}
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

            {{-- Fallback when no profile loaded yet --}}
            <template x-if="!dataGroup">
                <p class="chart-builder__no-profile">
                    {{ __('plotly-chart-editor::plotly-chart-editor.errors.plotly_missing') }}
                </p>
            </template>
        </div>

    </div>

    {{-- ── Canvas ────────────────────────────────────────────────────── --}}
    <div
        class="chart-builder__canvas"
        data-plotly-canvas
        wire:ignore
    >
        {{-- Plotly renders here; wire:ignore prevents morphdom wiping it --}}
    </div>

</div>
