---
schema_version: 1
program_id: 00000000000000000000000000
generated: ""
total: 0
---

# Follow-ups

Backlog of work that came out of this program but wasn't in scope. Filled
by the `program-verifier` at the end of `phase: program_verify` (and
optionally appended-to by leads during stories when they spot issues
adjacent to their work).

Each entry is independently triagable — pick one, scope it as the intent
of a future Pipemason program, and run `pipemason program start` against it.

## Format

Each follow-up uses the YAML block below. New follow-ups append to the end
of the file under `## Items`.

```yaml
- id: F-001
  source: program-verifier      # program-verifier | <story-id> | manual
  raised_at: 2026-05-09T12:00:00Z
  severity: low                 # low | med | high
  category: design-token-drift  # short tag — design-token-drift | tech-debt | a11y | perf | security | docs | infra | ux | other
  title: One-line headline
  description: |
    A few sentences explaining what was observed, where, and why it
    couldn't be fixed within the original program's scope.
  evidence:
    - path/to/file.swift:123
    - .pipeline/program-runs/program-verify-report.md#section
  suggested_action: |
    Concrete next step. Often: "open a follow-up program with mode
    brownfield-extension and intent '...'".
  status: open                  # open | in_progress | done | wont_fix
```

## Items

> The program-verifier writes new entries below this line. Don't move
> entries above it.

- id: F-001
  source: linksnip
  raised_at: 2026-06-26T15:05:00Z
  severity: low
  category: tech-debt
  title: Dead web view modules — src/views/form.ts and src/views/page.ts unused at runtime
  description: |
    During implement, api-lead created src/views/{form,page,linksTable}.ts to satisfy
    the web-unit tests (WEB-U-1, WEB-U-4). In the ui phase, web-tech-lead implemented
    src/routes/web.ts rendering its own inline form/page markup (input type="text" to
    permit server-side URL validation, since type="url"+required blocks native no-JS
    submission of invalid input). Result: web.ts only imports renderLinksTable; form.ts
    and page.ts are dead code, and the web-unit tests now cover renderers the live page
    does not use.
  evidence:
    - src/routes/web.ts (imports only views/linksTable)
    - src/views/form.ts (no importers in src/)
    - src/views/page.ts (no importers in src/)
    - tests/unit/form.view.test.ts
  suggested_action: |
    Either delete the unused view modules and retarget the web-unit tests at the real
    web.ts renderer, or refactor web.ts to compose the shared view helpers (form/page)
    so unit and e2e coverage align. Consider a single source for the form markup.
  status: open

- id: F-002
  source: linksnip
  raised_at: 2026-06-26T15:05:00Z
  severity: low
  category: ux
  title: Success banner (role=status) from ADR-007 dropped during ui implementation
  description: |
    ADR-007 specified PRG to /?created=<code> showing a role=status success banner after
    a successful shorten. web-tech-lead instead redirects to plain / (the new link still
    appears because the table is re-read from SQLite on every GET /). AC-13 is satisfied,
    axe-core is clean, but the a11y nicety A11Y-WEB-019 (success live region) is not present.
  evidence:
    - src/routes/web.ts (POST /shorten redirects to '/')
    - .pipeline/decisions.md (ADR-007)
    - .pipeline/artifacts/a11y/linksnip/web-criteria.md (A11Y-WEB-019)
  suggested_action: |
    Add the ?created=<code> branch with a role=status banner to confirm success to
    screen-reader users, per ADR-007.

- id: F-003
  source: linksnip
  raised_at: 2026-06-26T15:05:00Z
  severity: low
  category: tech-debt
  title: src/ imports shared types from inside .pipeline/contracts
  description: |
    src/routes/web.ts imports the Link type from ../../.pipeline/contracts/shared-types.js.
    Coupling runtime source to a path inside .pipeline/ is fragile (the pipeline workspace
    is not normally a source dependency root). Typecheck passes today.
  evidence:
    - src/routes/web.ts (import type Link from ../../.pipeline/contracts/shared-types.js)
  suggested_action: |
    Vendor the shared contract types into src/ (e.g. src/types.ts generated from
    contracts) or add a path alias, so src does not reach into .pipeline at runtime/build.
  status: open
