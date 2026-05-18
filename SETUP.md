# SETUP — Pinned Environment

These versions are **non-negotiable** for the v1.3 build. If the agent encounters a constraint that requires changing them, STOP and ask the human first.

## Runtime versions

| Tool | Version | Notes |
|---|---|---|
| PHP | **8.4** | Use property hooks and asymmetric visibility where they clarify intent. |
| Composer | 2.x | |
| Laravel | **12.x** | The package's `composer.json` constrains `illuminate/contracts: ^12.0`. |
| Livewire | **3.x** (`livewire/livewire: ^3.5`) | Livewire 3 syntax everywhere; no v2 APIs. |
| Alpine.js | **3.x** | Use `Alpine.store()`, `$watch`, `x-model`. |
| Tailwind CSS | **v4** | CSS-first config. No `tailwind.config.js` — use `@theme` blocks in CSS. |
| Plotly.js | **peer dependency** | Consumer installs and exposes `window.Plotly`. Package does NOT ship it. |
| Node | 20 LTS or 22 LTS | |
| Package manager | npm (default) — pnpm and bun must work but are not the reference |
| Pest | **3.x** | Test runner. NOT phpunit directly. |
| Pint | latest | Code style fixer. Run before commits. NOT a test runner. |
| Laravel Boost | latest | Installed for AI-assisted Laravel development context. |

## Package identity

| Field | Value |
|---|---|
| Composer name | `uneca/plotly-chart-editor` |
| PHP namespace | `Uneca\PlotlyChartEditor` |
| Service provider | `Uneca\PlotlyChartEditor\PlotlyChartEditorServiceProvider` |
| Config key | `plotly-chart-editor` |
| Livewire component | `plotly-editor` (registered with full FQCN) |
| Blade component prefix | `plotly-chart-editor::` |
| Translation namespace | `plotly-chart-editor` |
| CSS class prefix | `chart-builder` (BEM) and `plotly-primitive` (primitives) |
| License | MIT |

## Repository layout (target)

```
.
├── composer.json
├── package.json
├── pint.json
├── phpunit.xml          # Pest uses this
├── tailwind.config.js   # OMIT — Tailwind v4 uses CSS @theme
├── README.md
├── LICENSE
├── AGENTS.md
├── SETUP.md
├── docs/
│   ├── PRD.md
│   └── phases/
├── examples/
│   └── demo.blade.php
├── fixtures/
│   └── african-countries.json
├── config/
│   └── plotly-chart-editor.php
├── lang/
│   └── en/
│       └── plotly-chart-editor.php
├── resources/
│   ├── views/
│   │   ├── livewire/
│   │   │   └── plotly-editor.blade.php
│   │   ├── components/
│   │   │   ├── primitives/
│   │   │   │   ├── font.blade.php
│   │   │   │   ├── line.blade.php
│   │   │   │   ├── marker.blade.php
│   │   │   │   └── margin.blade.php
│   │   │   ├── schema-field.blade.php
│   │   │   ├── fold.blade.php
│   │   │   └── ...
│   ├── css/
│   │   └── plotly-chart-editor.css
│   └── js/
│       └── plotly-chart-editor.js
├── src/
│   ├── PlotlyChartEditorServiceProvider.php
│   ├── Livewire/
│   │   └── PlotlyEditor.php
│   └── Support/
│       └── SchemaProfileLoader.php
└── tests/
    ├── Pest.php
    ├── TestCase.php
    ├── Unit/
    └── Feature/
```

## Install commands (reference)

```bash
# Inside the package directory after scaffolding
composer install
npm install
vendor/bin/pest
vendor/bin/pint --test
```

## Verification gates

Each phase ends with these passing:
1. `vendor/bin/pest` — all tests green.
2. `vendor/bin/pint --test` — no style violations.
3. `npm run build` (when JS assets exist) — clean build.
4. Manual smoke test of the relevant acceptance criteria (see `docs/PRD.md` §15).
