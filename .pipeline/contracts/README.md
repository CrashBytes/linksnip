# `contracts/` — frozen interfaces between domains

Anything that two or more domains must agree on lives here. **Once the contracts phase
completes, files in this directory are read-only for the rest of the run.** Changes
require an explicit `monitor: re-contract` event, which resets all downstream phases
for the affected domains.

This is the load-bearing artifact of the entire pipeline. If two architects produce
incompatible contracts, every test below them is wrong. If contracts are vague,
TDD generates tests against assumptions that don't hold. Treat this directory like
a database schema migration: deliberate, reviewed, versioned.

## What goes here

**Sole writer: `contracts-architect`.** Every file below is owned by the
contracts-architect agent. Per-domain architects (in the next phase) read these
files and design implementation against them — they may not edit. This single-
writer model is what keeps the contract surface coherent across domains.

| File / pattern              | Purpose                                              | Required when              |
|-----------------------------|------------------------------------------------------|----------------------------|
| `api.openapi.yml`           | REST API contract (OpenAPI 3.1)                      | `api` domain + REST        |
| `api.graphql`               | GraphQL SDL                                          | `api` domain + GraphQL     |
| `events.asyncapi.yml`       | Async events / queues                                | `api` or `cloud` + events  |
| `db.schema.sql`             | Authoritative DDL                                    | `db` domain                |
| `db.migrations/NNN_*.sql`   | Numbered migration files                             | `db` + existing data       |
| `shared-types.ts`           | TS types shared between mobile/web/api                | ≥2 of {mobile, web, api}  |
| `shared-types.json`         | JSON Schema mirror of above                          | when shared-types.ts exists |
| `mobile-deeplinks.md`       | URL schemes / universal links                        | `mobile` domain            |
| `web-routes.md`             | Public routes + their contracts                      | `web` domain               |
| `cloud-resources.md`        | New cloud resources + inputs/outputs                 | `cloud` domain             |
| `error-codes.md`            | Canonical error codes across domains                 | always                     |

## Rules

1. **One source of truth per concept.** If a type is used in mobile + api, it is
   defined in `shared-types.*` and imported, not duplicated.
2. **Examples are mandatory.** Every endpoint, type, and event must have ≥1 concrete
   example payload. Examples drive test fixture generation.
3. **Versioning.** Breaking changes bump a version field at the top of each file
   and add a deprecation note. The pipeline does not auto-migrate consumers.
4. **No TODOs.** A `TODO` in a contract is a bug — the contracts-architect must
   resolve or escalate before this phase completes.

## Validation gate

Before contracts is marked complete, monitor runs:
- OpenAPI spec validation (`redocly lint` or equivalent)
- JSON Schema validity check
- SQL parse check
- Cross-reference check (every type referenced must be defined)
- Example payload validation against its own schema
