# AGENTS.md — Operating Instructions for Coding Agents

Read this **first**, before reading the PRD. This file tells you HOW to work. The PRD tells you WHAT to build.

## The golden rules

1. **Work in phases.** The work is split into 8 phases under `docs/phases/`. Complete one phase at a time. After each phase, STOP and report status. Do not silently roll into the next phase.
2. **The PRD is the source of truth.** When `docs/PRD.md` and any other document disagree, the PRD wins. If the PRD is ambiguous, STOP and ask — do not guess.
3. **SETUP.md is non-negotiable.** Versions are pinned. If a dependency conflict forces a change, STOP and ask.
4. **Never invent UX strings.** All user-facing strings come from `lang/en/plotly-chart-editor.php`. Hardcoded English in Blade or JS is a bug.
5. **Tests are part of "done".** A phase is not complete until `vendor/bin/pest` passes for the work introduced in that phase. No exceptions.

## How to start any session

1. Read this file (`AGENTS.md`).
2. Read `SETUP.md`.
3. Read `docs/PRD.md` — the full thing, once. Treat it as a contract.
4. Read `docs/phases/00-overview.md`.
5. Read the specific phase file you've been asked to work on.
6. Run `git status` and `vendor/bin/pest` to know the current state.
7. Only then start coding.

## How to finish any phase

1. All tests for the phase pass: `vendor/bin/pest`.
2. Code style clean: `vendor/bin/pint --test`.
3. Build succeeds (if JS changed): `npm run build`.
4. Update `docs/phases/<phase>.md` — check off the boxes that are actually done.
5. Commit all changes with a message starting with `Phase N:` (where N is the phase number), e.g. `git commit -m "Phase 1: ..."`.
6. Write a phase-completion summary (3-5 bullets) of what was built and any decisions taken.
7. List anything you skipped or deferred and why.
8. STOP. Do not start the next phase.

## Commands cheat sheet

| Need | Command |
|---|---|
| Run tests | `vendor/bin/pest` |
| Run one test file | `vendor/bin/pest tests/Feature/MountTest.php` |
| Filter tests | `vendor/bin/pest --filter="syncs from alpine"` |
| Fix code style | `vendor/bin/pint` |
| Check code style only | `vendor/bin/pint --test` |
| Build assets | `npm run build` |
| Dev assets watch | `npm run dev` |
| Install deps | `composer install && npm install` |

## Code conventions

### PHP
- PHP 8.4. Use typed properties, constructor promotion, readonly where appropriate.
- Strict types: every file starts with `declare(strict_types=1);`.
- No facades inside the Livewire component for things that have constructor-injectable services.
- Wrap user-facing strings with `__('plotly-chart-editor.…')`.
- Pint config: defaults; do not customize unless the human asks.

### Blade
- Use `<x-plotly-chart-editor::name>` for the package's components.
- Use `@props([...])` at the top of every component.
- All `x-show` / `x-bind` / `x-model` go on dedicated wrapping elements when readability suffers otherwise.
- No inline `<style>` in Blade.

### JavaScript / Alpine
- Single Alpine store: `Alpine.store('chartBuilder', { … })`.
- All state mutations go through store methods, not direct property assignment from Blade. Exception: `x-model` two-way binding is allowed and expected.
- Use `structuredClone()` for deep copies. Not `JSON.parse(JSON.stringify(...))`.
- Debounce render with a 50ms timer using a captured `setTimeout`/`clearTimeout`. No `lodash`.
- All sync calls go through `syncToBackend()` — never inline `$wire.method(...)` calls scattered around.

### CSS
- Tailwind v4 with `@theme` block in `resources/css/plotly-chart-editor.css`.
- Theme tokens use `--plotly-editor-*` prefix. See PRD §13.1 for the canonical list.
- BEM class names: `chart-builder__fold`, `plotly-primitive`, etc.
- No `!important` unless commented with rationale.

### Tests
- Pest 3 syntax. Use `it('does X', ...)` not `test('it does X', ...)`.
- Feature tests live in `tests/Feature/`. Unit tests in `tests/Unit/`.
- Livewire tests: `Livewire::test(PlotlyEditor::class, [...])`.
- A test that depends on browser behavior (sliders, Plotly canvas) should be marked with `->group('browser')` and skipped by default.

## When you're stuck

- **Ambiguity in the PRD?** Quote the line, state your two interpretations, ask which.
- **A tool fails repeatedly?** Stop. Report the exact error. Don't keep retrying.
- **Test failures you can't fix in 3 attempts?** Report them. Don't comment them out. Don't `markTestSkipped`.
- **Version conflict?** Stop. Don't downgrade or bump anything in `composer.json` without permission.

## What you may NOT do without asking

- Add a new composer or npm dependency that isn't already in `composer.json` / `package.json`.
- Change PHP, Laravel, Livewire, Alpine, Tailwind, or Plotly versions.
- Modify files outside the package (`.git/`, `node_modules/`, `vendor/` are obviously off-limits — but also be careful with `.github/` workflows).
- Use `dd()`, `dump()`, `var_dump()`, or `console.log()` in committed code. They're fine while debugging; remove before reporting "done".
- Skip writing tests because "it's a UI thing."
- Mark a phase complete when tests are failing or skipped.

## What you SHOULD do proactively

- Run `vendor/bin/pest` after any non-trivial change, not just at phase end.
- Run `vendor/bin/pint` before declaring done.
- Re-read the relevant PRD section before implementing — not just at the start of the phase.
- Use the fixture in `fixtures/african-countries.json` for any demo / test data needs.
- Look at `examples/demo.blade.php` to understand the consumer perspective.

## Reporting format at end of phase

```markdown
## Phase N complete

**Built:**
- ...
- ...

**Decisions made (not in PRD):**
- ...

**Skipped / deferred:**
- ...

**Test results:**
- Pest: X passed, Y failed, Z skipped
- Pint: clean / N violations
- Build: succeeded / failed

**Files changed:**
- src/...
- resources/...
```
