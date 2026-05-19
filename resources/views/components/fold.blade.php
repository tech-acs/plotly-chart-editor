@props([
    'title',
    'open' => true,
])

<div
    class="chart-builder__fold"
    x-data="{ open: @js($open) }"
    :class="{ 'chart-builder__fold--open': open }"
>
    <div
        class="chart-builder__fold-header"
        x-on:click="open = !open"
        role="button"
        :aria-expanded="open"
    >
        <span>{{ $title }}</span>
        <span x-text="open ? '▾' : '▸'" aria-hidden="true"></span>
    </div>

    <div
        class="chart-builder__fold-body"
        x-show="open"
    >
        {{ $slot }}
    </div>
</div>
