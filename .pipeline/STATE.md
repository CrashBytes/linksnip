---
# Machine-readable header. Monitor reads/writes this on every transition.
# All timestamps are ISO-8601 UTC. All IDs are stable across the run.
schema_version: 1
run_id: ""                  # ULID, set at init
ticket: ""                  # e.g. "ABC-1234"
branch: ""                  # e.g. "feature/ABC-1234-add-oauth"
base_branch: ""             # resolved at init (no "auto")
started: ""
updated: ""

# Pipeline phase (single source of truth — agents may not advance this; only monitor does).
# See docs/state-machine.md for the full diagram and transitions.
phase: "init"               # init | analyze | contracts | architect | tdd | implement | e2e | ui | verify | runtime_check | rebase | finalize | done | failed
status: "pending"           # pending | running | complete | failed | escalated

# Domain tracking — independent slots so phases can fan out.
domains_active: []          # list of {name, agent, started}
domains_complete: []        # list of {name, agent, ended, artifacts}
domains_failed: []          # list of {name, agent, ended, reason, retry_count}

# Escalations — anything monitor can't auto-resolve.
escalations: []             # list of {ts, phase, reason, awaiting}

# Iteration accounting — protects against infinite loops.
total_iterations: 0
retries_by_failure_class: {}
---

# Pipeline run

> Human-readable summary. Agents append; monitor compacts on phase transitions.
> The YAML header is authoritative. If the table and header disagree, header wins.

## Phase log

| #  | Phase     | Domain | Status   | Agent              | Started | Ended | Artifacts | Notes |
|----|-----------|--------|----------|--------------------|---------|-------|-----------|-------|
|    |           |        |          |                    |         |       |           |       |

## Current escalations

_(none)_

## Recent activity

_(rolling window — last 10 entries from iterations.log, refreshed by monitor)_
