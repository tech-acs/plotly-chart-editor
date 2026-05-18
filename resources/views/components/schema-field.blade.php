@props(['field'])

@php
    $key   = $field['key'];
    $type  = $field['type'];
    $label = $field['label'];
    $dflt  = $field['dflt'] ?? null;

    // For column fields, x-model targets the meta.columnNames map.
    // For all others, x-model targets the resolved dot-path on the trace.
    // Alpine dot-path accessor: $store.traces[i].a.b.c → use a JS getter expression.
    // We build the Alpine expressions as strings for x-model.
    $store = "Alpine.store('chartBuilder')";

    if ($type === 'column') {
        // Bind to  traces[activeTraceIndex].meta.columnNames.<key>
        $xmodel = "\$store('chartBuilder').traces[\$store('chartBuilder').activeTraceIndex].meta.columnNames.{$key}";
    } else {
        // Convert dot.key  →  traces[activeTraceIndex].dot.key
        $xmodel = "\$store('chartBuilder').traces[\$store('chartBuilder').activeTraceIndex].{$key}";
    }
@endphp

<div class="chart-builder__field">
    <label class="chart-builder__field-label">{{ $label }}</label>

    @switch($type)

        {{-- ── column ─────────────────────────────────────────────── --}}
        @case('column')
            <select
                class="chart-builder__control chart-builder__control--select"
                x-model="{{ $xmodel }}"
            >
                <option value="">— select column —</option>
                <template x-for="col in Object.keys($store('chartBuilder').dataSources)" :key="col">
                    <option :value="col" x-text="col"></option>
                </template>
            </select>
        @break

        {{-- ── color ──────────────────────────────────────────────── --}}
        @case('color')
            <input
                type="color"
                class="chart-builder__control chart-builder__control--color"
                x-model="{{ $xmodel }}"
                @if($dflt) value="{{ $dflt }}" @endif
            >
        @break

        {{-- ── range ──────────────────────────────────────────────── --}}
        @case('range')
            <div class="chart-builder__control-row">
                <input
                    type="range"
                    class="chart-builder__control chart-builder__control--range"
                    min="{{ $field['min'] ?? 0 }}"
                    max="{{ $field['max'] ?? 1 }}"
                    step="{{ $field['step'] ?? 0.05 }}"
                    x-model.number="{{ $xmodel }}"
                >
                <span
                    class="chart-builder__control-value"
                    x-text="{{ $xmodel }}"
                ></span>
            </div>
        @break

        {{-- ── number ─────────────────────────────────────────────── --}}
        @case('number')
            <input
                type="number"
                class="chart-builder__control chart-builder__control--number"
                @if(isset($field['min'])) min="{{ $field['min'] }}" @endif
                @if(isset($field['max'])) max="{{ $field['max'] }}" @endif
                x-model.number="{{ $xmodel }}"
                @if($dflt !== null) :value="{{ $xmodel }} ?? {{ json_encode($dflt) }}" @endif
            >
        @break

        {{-- ── text ───────────────────────────────────────────────── --}}
        @case('text')
            <input
                type="text"
                class="chart-builder__control chart-builder__control--text"
                x-model="{{ $xmodel }}"
            >
        @break

        {{-- ── boolean ────────────────────────────────────────────── --}}
        @case('boolean')
            <input
                type="checkbox"
                class="chart-builder__control chart-builder__control--checkbox"
                x-model="{{ $xmodel }}"
            >
        @break

        {{-- ── enumerated ─────────────────────────────────────────── --}}
        @case('enumerated')
            <select
                class="chart-builder__control chart-builder__control--select"
                x-model="{{ $xmodel }}"
            >
                @foreach($field['values'] ?? [] as $value)
                    <option value="{{ $value }}">{{ $value ?: '(none)' }}</option>
                @endforeach
            </select>
        @break

        {{-- ── fallback ────────────────────────────────────────────── --}}
        @default
            <span class="chart-builder__field-unknown">Unknown field type: {{ $type }}</span>

    @endswitch
</div>
