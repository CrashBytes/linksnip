---
schema_version: 1
program_id: 00000000000000000000000000
mode: greenfield-system
status: draft                  # draft | ready (frozen at end of program_plan)
created: ""
total_epics: 0
total_stories: 0
longest_chain: 0
parallelizable_branches: 0
---

# Roadmap

Authoritative, frozen-when-ready DAG of epics → stories.

When `status: ready`, the file is read-only for the rest of the program.
The story-orchestrator reads this and runs each story in topological order.

## Conventions

- **Epic id**: `E-NNN` (e.g. `E-001`)
- **Story id**: `S-EEE-NNN` (e.g. `S-E001-001`)
- **Story size**: `xs | s | m | l | xl` (xl requires user greenlight)
- **Story risk**: `low | med | high`
- **`depends_on`**: explicit list of story ids; empty for foundation stories
- **`parent_story`**: the story whose branch this story stacks on (`main` for foundations)

## Foundation stories (every program)

> Greenfield programs always have these; brownfield programs include them
> only if the audit shows they're missing.

```yaml
- id: S-FOUND-001
  title: Design system + tokens
  agent: design-system-architect           # delegated
  depends_on: []
  parent_story: main
  size: m
  risk: low
- id: S-FOUND-002
  title: Initial contracts (shared types, error codes, deeplinks)
  agent: contracts-architect
  depends_on: [S-FOUND-001]
  parent_story: S-FOUND-001
  size: m
  risk: low
- id: S-FOUND-003
  title: Auth foundations
  depends_on: [S-FOUND-002]
  parent_story: S-FOUND-002
  size: l
  risk: med
- id: S-FOUND-004
  title: Database schema baseline
  depends_on: [S-FOUND-002]
  parent_story: S-FOUND-002
  size: m
  risk: med
- id: S-FOUND-005
  title: CI / test scaffolding for every active domain
  depends_on: [S-FOUND-002]
  parent_story: S-FOUND-002
  size: m
  risk: low
```

## Epics

### E-001 — <epic title>

**Why**: <one paragraph>

**Owning domains**: [api, web]

**Definition of done**: <how we know the epic shipped>

#### Stories

```yaml
- id: S-E001-001
  title: <one-line title used as the per-story `pipemason start` input>
  acceptance_criteria:
    - <testable, no ambiguity>
    - <...>
    - <...>
  domains: [api]
  depends_on: [S-FOUND-003, S-FOUND-004]
  parent_story: S-FOUND-004
  size: m
  risk: med
  status: pending
```

> Repeat for each story in the epic.

### E-002 — ...

> Repeat for each epic.
