# HANDOFF — Opening Prompt for the Coding Agent

Copy the text in the fenced block below as your first message to the coding agent (Claude Sonnet 4.6).

---

```
You are building a Laravel package called uneca/plotly-chart-editor. Before doing anything else, read these files in order and confirm you understand them:

1. AGENTS.md  ← operating instructions; this governs HOW you work
2. SETUP.md   ← pinned versions and package identity
3. docs/PRD.md ← full product requirements (v1.3.0)
4. docs/phases/00-overview.md ← the 8-phase implementation plan
5. docs/phases/01-skeleton.md ← what you'll build first

After reading, reply with:
- A 5-bullet summary of the overall product.
- The exact pinned versions for PHP, Laravel, Livewire, Alpine, Tailwind, Plotly, and the test runner.
- Any ambiguity, contradiction, or open question you noticed across the documents. Do NOT guess answers — list them and wait.
- A one-paragraph plan for Phase 1, in your own words.

Do NOT write any code yet. Do NOT install anything yet. Wait for me to confirm before proceeding.

If you find that the working directory is empty (only docs and config artifacts exist), that is correct. Your first task in Phase 1 will be to scaffold the package skeleton. Install Laravel Boost as part of that scaffolding.

When I reply "proceed with phase 1", begin work.
```

---

## After the agent confirms understanding

Reply with: `proceed with phase 1`

## Between phases

When the agent reports completion of a phase, you have three useful follow-ups:

1. **Verify before approving.** Open the repo, run `vendor/bin/pest`, glance at `git diff`, try the demo. Don't rubber-stamp.
2. **Approve and proceed:** `Phase N looks good. Proceed to phase N+1.`
3. **Request fixes:** Quote the specific issue and the file. Keep the agent in the current phase until it's right.

## Useful slash-prompts during work

- "Show me a list of files you've changed in this phase and a one-line summary of each change."
- "Run the test suite and paste the output."
- "Quote the PRD section governing this decision."
- "Stop. Re-read PRD §X.Y. Does your implementation match?"

## Red flags to watch for

- Agent skips writing tests "to save time."
- Agent invents UX copy instead of using `__()`.
- Agent bumps a dependency version without asking.
- Agent says "I noticed an issue with the PRD" and then fixes it silently — push back, the PRD is the contract.
- Agent claims a phase is done while tests are skipped or failing.
- Agent extends the work into the next phase without explicit approval.
