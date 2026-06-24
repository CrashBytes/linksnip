# `.pipeline/` — workspace contract

This directory is the **shared filesystem-based memory** for a single pipeline run.
Every agent in the chain reads from and writes to it. The chat context of any one
agent is ephemeral; this directory persists.

```
.pipeline/
├── config.yml          # repo-level config (checked in, hand-edited)
├── STATE.md            # current run state + phase log (monitor owns)
├── spec.md             # parsed inputs → unified spec (analyst writes, then frozen)
├── contracts/          # frozen interfaces between domains (architects write, then frozen)
│   └── README.md       # what belongs here + validation rules
├── test-plan.md        # test inventory + AC → test traceability (TDD/E2E own)
├── decisions.md        # ADR log (architects append)
├── iterations.log      # JSONL — every retry, every failure (everyone appends)
└── artifacts/          # build outputs, screenshots, coverage reports, attached images
```

## Ownership rules

| File                       | Writer                            | Readers              | Frozen after      |
|----------------------------|-----------------------------------|----------------------|-------------------|
| `config.yml`               | human                             | all agents           | n/a (always r/o)  |
| `STATE.md`                 | monitor (only)                    | all agents           | never (live state)|
| `spec.md`                  | analyst                           | all agents           | end of analyze    |
| `contracts/*`              | contracts-architect, then per-domain architects | all agents | end of contracts |
| `test-plan.md`             | TDD agents, e2e-tech-lead         | leads, monitor       | never (live)      |
| `decisions.md`             | architects (append)               | all agents           | never (append-only) |
| `iterations.log`           | all agents (append)               | monitor, verify      | never (append-only) |
| `artifacts/expected/`      | analyst (Figma export) / human    | screenshot-agent     | end of analyze    |
| `artifacts/screenshots/`   | screenshot-agent                  | monitor, UI lead     | never (live)      |
| `artifacts/diffs/`         | screenshot-agent                  | monitor, UI lead     | never (live)      |
| `artifacts/`               | any (general bucket)              | any                  | never             |

## Hard rules

1. **Only monitor advances `STATE.md.phase`.** Subagents propose transitions by
   marking their domain status, but the canonical `phase` field is monitor-only.
2. **Frozen means frozen.** A subagent attempting to write to a frozen artifact is
   a pipeline bug — fail loud, escalate, do not silently overwrite.
3. **Append, don't rewrite.** `decisions.md` and `iterations.log` are append-only.
   This preserves the audit trail for code review and post-mortems.
4. **No secrets.** `.pipeline/` is committed in some workflows. Never write API keys,
   tokens, or PII here. The `secret_scan` gate catches this; don't rely on it.
5. **Path stability.** Paths in this contract are part of the API. Renaming a file
   here is a breaking change to every agent prompt. Bump `schema_version` if you do.

## Lifecycle

A run begins when monitor:
1. Validates `config.yml` exists and parses.
2. Generates a `run_id` and writes the YAML header of `STATE.md`.
3. Copies the rest of these templates if missing.
4. Stamps `started` timestamp and sets `phase: init`.

A run ends (in `phase: done`) when monitor:
1. Confirms `verify` and `runtime_check` passed post-rebase.
2. Opens the PR.
3. Writes a final entry to `iterations.log` summarizing token usage and wall time.

A run ends (in `phase: failed`) when:
1. Any phase exhausts `max_retries_per_failure_class`, OR
2. `total_iterations` exceeds `max_total_iterations`, OR
3. A user explicitly aborts.

In both terminal states, `.pipeline/` is preserved as-is for forensics.

## Reset

To re-run a phase:
- **Re-analyze**: monitor unfreezes `spec.md`, sets `phase: analyze`, clears all
  domain state. This invalidates everything downstream — equivalent to starting over.
- **Re-contract**: monitor unfreezes `contracts/`, resets domains affected by the
  contract change to `architect` phase, preserves spec.
- **Re-tdd / re-implement**: per-domain. Monitor resets that domain's status only;
  other domains continue.

These are deliberate, logged operations — not silent overwrites.
