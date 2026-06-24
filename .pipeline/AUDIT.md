---
schema_version: 1
audit_id: 00000000000000000000000000
program_id: 00000000000000000000000000
generated: ""
repo_root: ""
languages: []
total_loc: 0
test_count: 0
domains_detected: []
overall_risk: 0.0          # mean of subsystem risk grades, 1-5
status: draft              # draft | ready (frozen at end of audit phase)
---

# System Audit

Filled by the `system-auditor` agent during `phase: audit`. Read-only after
`status: ready`. The program-architect and migration-architect rely on this.

## 1. Executive summary

> 5–8 bullets a non-engineer can read. Headline risk and the most important
> migration constraints.

## 2. Inventory

### Languages

| Language | LOC | Files |
|---|---|---|
| - | - | - |

### Packages

| Manager | File | Direct deps | Transitive deps | Outdated majors |
|---|---|---|---|---|
| - | - | - | - | - |

### Tests

| Domain | Framework | Count | Coverage % |
|---|---|---|---|
| - | - | - | - |

### Public surface

| Surface | Count | Examples |
|---|---|---|
| HTTP routes | - | - |
| GraphQL ops | - | - |
| Exported types | - | - |
| DB tables | - | - |

## 3. Subsystem risk matrix

| Subsystem | Coverage | Typing | Complexity | Migration | Ops | Overall |
|---|---|---|---|---|---|---|
| - | - | - | - | - | - | - |

> Each cell: 1 (great) – 5 (alarming). Overall = mean.

## 4. Dependency findings

### Outdated

> List with current → latest, semver delta.

### CVEs

> Any direct or transitive CVE ≥ moderate; reference DB id (CVE / GHSA).

### License flags

> Anything incompatible with the product's license.

### Cycles

> Internal package import cycles; sign of architectural drift.

## 5. Tech-debt callouts

> Numbered list. Each entry: location, severity (`critical / high / medium / low`),
> description, suggested follow-up scope.

## 6. Migration constraints

> The hardest-won part of the audit. Each item is something the architects
> MUST plan around:

- **Public-API consumers**: <known mobile clients, integrations, webhooks>
- **Data shapes that resist change**: <denormalized / duplicated columns>
- **Active feature flags / experiments**:
- **Long-running background jobs**:
- **Long-TTL auth tokens**:
- **Cache layers serving stale**:
- **Deploy topology**:

## 7. Open questions

> Things the audit could not determine from the code; the user must answer
> before the program-architect can write a defensible roadmap.

- [ ] <question>
- [ ] <question>
