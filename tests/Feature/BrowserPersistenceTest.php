<?php

declare(strict_types=1);

/**
 * The persistence methods below require a browser environment (JavaScript)
 * and cannot be tested with Pest's PHP test runner.
 *
 * They are documented here for manual verification. Marked with
 * ->group('browser') and skipped per AGENTS.md convention.
 *
 * ─── Option B — JS bridge to a sibling Livewire component ───
 *
 * Listens to the chart-synced event via Livewire.on() and forwards
 * the payload to another Livewire component on the same page.
 *
 *   Livewire.on('chart-synced', (event) => {
 *       Livewire.dispatchTo('save-button', 'chart-synced', event);
 *   });
 *
 * Verification: Open browser console, make an edit, confirm the
 * sibling component's #[On('chart-synced')] handler fires.
 *
 * ─── Option C — Plain JS + HTTP request ───
 *
 * Listens to chart-synced and sends the payload to a server endpoint
 * via fetch(), no host Livewire component needed.
 *
 *   Livewire.on('chart-synced', ({ data, layout }) => {
 *       fetch('/save', { method: 'POST', body: JSON.stringify({ traces: data, layout }) });
 *   });
 *
 * Verification: Edit a chart, confirm the network request contains
 * { traces: [...], layout: {...} } with meta.columnNames intact.
 *
 * ─── Option E — JS CustomEvent ───
 *
 * The package dispatches plotly-chart-editor:synced on window.
 * Framework-agnostic — works with React, Vue, vanilla JS.
 *
 *   window.addEventListener('plotly-chart-editor:synced', (e) => {
 *       const { traces, layout } = e.detail;
 *   });
 *
 * Verification: Register the listener, edit a chart, confirm e.detail
 * contains traces (with meta.columnNames) and layout.
 *
 * ─── Option F — Alpine store direct read ───
 *
 * Read chart state directly from Alpine.store('chartBuilder') at any
 * time. No event wiring needed.
 *
 *   Alpine.store('chartBuilder').traces
 *   Alpine.store('chartBuilder').layout
 *
 * Verification: Open Alpine devtools, confirm traces and layout reflect
 * the current editor state.
 */
it('requires a browser — skip', function (): void {
    // This is a placeholder. Run `npx playwright test` when browser
    // tests are set up (not yet available in this package).
})->group('browser')->skip('Browser test infrastructure not yet set up.');
