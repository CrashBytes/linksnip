---
schema_version: 1
program_id: 00000000000000000000000000
mode: greenfield-system           # greenfield-system | greenfield-mobile | brownfield-upgrade | brownfield-extension
intent: ""                        # one-paragraph user statement
status: pending                   # pending | program_plan | audit | migration_plan | design_system | iterate | program_verify | complete | failed
phase: program_init
started: ""
updated: ""
default_base: main
branch_strategy: stacked          # stacked | program-branch
parallelism: 2
pr_draft: true
allow_big_bang: false             # brownfield-upgrade: hard refusal of unflagged behavior changes by default
deprecation_policy:
  notice_days: 90
  dual_availability_days: 180
stories_total: 0
stories_complete: 0
stories_in_progress: 0
stories_pending: 0
stories_blocked: 0
stories_failed: 0
last_completed_story: ""
last_completed_at: ""
escalations: []
---

# Pipemason Program

Top-level state file for a multi-story Pipemason program. The runner and the
program-level agents (`program-architect`, `system-auditor`, `migration-architect`,
`design-system-architect`, `story-orchestrator`, `stack-manager`,
`program-verifier`) all read and update this file.

## Sections (filled in by the agents)

### 1. Intent (filled at `program init`)

> What is the user trying to accomplish? Pasted from the user's input verbatim,
> with any clarifying notes the runner gathered during `program init`.

### 2. Audit summary (brownfield only — filled by system-auditor)

> Headline numbers from `AUDIT.md`. Full audit lives in that file.

### 3. Roadmap summary (filled by program-architect)

> Epic count, story count, longest chain, parallelizable arms. Full DAG lives
> in `ROADMAP.md`.

### 4. Migration summary (brownfield-upgrade only — filled by migration-architect)

> Strategy, cutover phases, rollback drills planned. Full plan lives in
> `MIGRATIONS.md`.

### 5. Design system summary (greenfield only — filled by design-system-architect)

> Platforms targeted, components planned, AA-valid color pairs. Full spec
> lives in `DESIGN-SYSTEM.md`.

### 6. Iteration log (appended by story-orchestrator)

> Compact one-line entries: timestamp, story id, action (start | complete |
> failed | gated), branch, PR url. Full per-story detail in
> `.pipeline/program-runs/<story-id>/`.

### 7. Verification report (filled by program-verifier)

> Verdict + checks summary. Full report in
> `.pipeline/program-runs/program-verify-report.md`.
