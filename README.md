# Plotly Chart Editor

> **Status:** Planning artifact. The package itself has not been built yet — this folder contains the PRD, phase plan, and scaffolding inputs for a coding agent to implement.

A reusable Laravel package providing a reactive visual chart builder Livewire component that produces valid Plotly.js configurations.

- **Composer:** `uneca/plotly-chart-editor`
- **License:** MIT
- **Target stack:** PHP 8.4 · Laravel 12 · Livewire 3 · Alpine 3 · Tailwind v4 · Plotly.js (peer dep)

## Repository contents

| Path | Purpose |
|---|---|
| `AGENTS.md` | Operating instructions for the coding agent. **Read first.** |
| `SETUP.md` | Pinned versions and package identity. Non-negotiable. |
| `docs/PRD.md` | Full product requirements (v1.3.0). |
| `docs/phases/` | 8-phase implementation plan. One file per phase. |
| `examples/demo.blade.php` | Consumer-perspective reference of how to mount the component. |
| `fixtures/african-countries.json` | Sample `dataSources` payload for tests and demos. |
| `HANDOFF.md` | The opening prompt to give the coding agent. |

## How to use this folder

1. Read `AGENTS.md`.
2. Read `SETUP.md`.
3. Read `docs/PRD.md` end-to-end.
4. Read `docs/phases/00-overview.md`.
5. Start with `HANDOFF.md` — copy its contents to the coding agent.

## Key constraints summary

- Plotly.js is a **peer dependency**. The package assumes `window.Plotly` exists at boot.
- Editor is **desktop-only** (≥1024px viewport).
- **No undo/redo** in v1.3.
- `dataSources` is **immutable after mount**; consumers re-mount via `wire:key` to swap data.
- All user-facing strings go through Laravel's `__()` translation helper.
