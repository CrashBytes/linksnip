---
schema_version: 1
last_updated: ""
generated_by: []           # list of agents that have written here
---

# Test plan

> Single source of truth for what tests exist, what they cover, and their state.
> Every test row maps back to ≥1 acceptance criterion. ACs without test rows
> are unimplemented and block phase completion.

## Coverage matrix (AC → tests)

| AC    | Unit                       | Integration       | E2E               | Status   |
|-------|----------------------------|-------------------|-------------------|----------|
| AC-1  |                            |                   |                   | uncovered |
| AC-2  |                            |                   |                   | uncovered |

## Test inventory

> **AC column convention**: Every row's `AC` cell must reference the acceptance
> criterion ID from `spec.md` (e.g. `AC-3`). Rows without an `AC` value are
> grouped into a per-domain `AC-misc` shard at fan-out time. Architects are
> responsible for populating this column when they plan the test surface.

> **Polyglot mode** (when `commands.<domain>.services` is set in config.yml):
> section headers gain a service segment — `### api · auth-svc · unit`,
> `### api · orders-svc · unit`, etc. Each row's `File` path is relative to
> the service's `path` from config.yml. tdd/lead agents only process rows
> for the service they were briefed on.

### api · unit
| ID    | AC    | Test                                       | Status | File                              |
|-------|-------|--------------------------------------------|--------|-----------------------------------|
|       | AC-?  |                                            |        |                                   |

### api · integration
| ID    | AC    | Test                                       | Status | File                              |
|-------|-------|--------------------------------------------|--------|-----------------------------------|

### mobile · unit
| ID    | AC    | Test                                       | Status | File                              |
|-------|-------|--------------------------------------------|--------|-----------------------------------|

### web · unit
| ID    | AC    | Test                                       | Status | File                              |
|-------|-------|--------------------------------------------|--------|-----------------------------------|

### db
| ID    | AC    | Test                                       | Status | File                              |
|-------|-------|--------------------------------------------|--------|-----------------------------------|

### cloud
| ID    | AC    | Test                                       | Status | File                              |
|-------|-------|--------------------------------------------|--------|-----------------------------------|

### e2e (mobile · maestro)
| ID    | AC    | Test                                       | Status      | File                       |
|-------|-------|--------------------------------------------|-------------|----------------------------|

### e2e (web · playwright)
| ID    | AC    | Test                                       | Status      | File                       |
|-------|-------|--------------------------------------------|-------------|----------------------------|

## Status legend

| Status      | Meaning                                                            |
|-------------|--------------------------------------------------------------------|
| planned     | Identified by architect, not yet written                           |
| red         | Written, intentionally failing (TDD red phase)                     |
| green       | Passing                                                            |
| blue        | Written for UI/E2E, intentionally failing                          |
| blue-green  | E2E passing — UI implementation complete                           |
| flaky       | Passes intermittently — quarantined, blocks finalize until fixed    |
| skipped     | Explicitly excluded — must include `reason:` and `revisit:` fields |

## Skipped tests

| ID    | Reason                          | Revisit when           |
|-------|---------------------------------|------------------------|
|       |                                 |                        |

## Traceability rules

- Every AC in `spec.md` must appear in the coverage matrix with at least one test
  before the `tdd` phase can complete.
- Every test in inventory must reference at least one AC ID. Tests without AC refs
  are deleted (they don't earn their keep).
- The `verify` phase compares this file's `green` count to actual test runner
  output. Drift between this file and reality is a failure.
