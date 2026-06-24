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
