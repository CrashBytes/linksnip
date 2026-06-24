---
schema_version: 1
migration_id: 00000000000000000000000000
program_id: 00000000000000000000000000
generated: ""
strategy: feature-flag-gradual    # dual-write | shadow-read | feature-flag-gradual | big-bang | strangler-fig
rollback_window_hours: 24
customer_impact: none             # none | login-flow | data-migration | api-deprecation
status: draft                     # draft | ready (frozen at end of migration_plan phase)
---

# Migrations

Filled by the `migration-architect` agent during `phase: migration_plan` for
brownfield-upgrade programs. Read-only after `status: ready`. The
story-orchestrator reads this and refuses to run cutover stories until their
gates are satisfied.

## 1. Strategy

> Which pattern fits this upgrade and why. One paragraph.

## 2. Feature flags

| Flag name | Scope | Default | Owner | Rollback semantics |
|---|---|---|---|---|
| - | - | - | - | - |

## 3. Cutover phases

> Ordered. Each phase has entry and exit criteria mapped to story IDs.

### Phase 1 — <name>

- **Entry criteria**: …
- **Stories**: `S-MIG-FLAG-001`, `S-MIG-DUAL-001`
- **Exit criteria**: …
- **Rollback**: <exact command / SQL / config flip>

### Phase 2 — <name>

> …

## 4. Dual-write window (where applicable)

> Which writes go to old + new for how long. Divergence trigger that
> initiates rollback.

## 5. Backfill plan (where applicable)

> Chunk size. Throttle. Restart semantics. Verification step before flipping
> reads.

## 6. Read-cutover plan

> Per-flag percentage rollout schedule.

## 7. Rollback hooks

| Phase | Rollback command | Tested by story | Last drilled |
|---|---|---|---|
| - | - | - | - |

## 8. Customer impact

- Communications required: <yes/no, channel, copy owner>
- Planned downtime windows: <none expected | window>
- Changelog notes: <draft>
- Public-API deprecation timeline: <90 days notice / 180 days dual / removal date>

## 9. Tripwires

> Automated checks that pause the cutover. Each tied to a metric and a query.

- Error rate > X% on the read-shadow check for N hours
- Divergence count > 0 on the most recent backfill chunk
- Rollback drill story has not run in the last 7 days

## 10. Definition of done

> What proves the migration is complete and the old code path can be deleted.
