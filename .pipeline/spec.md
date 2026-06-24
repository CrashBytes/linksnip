---
# Filled in during the analyze phase by monitor (or a dedicated analyst subagent).
# Once `frozen: true`, downstream agents may not edit; changes require a new run
# or an explicit re-analyze loop with monitor's approval.
schema_version: 1
ticket: ""
title: ""
sources:
  jira: ""                  # URL or null
  figma: ""                 # URL or null (raw text appears in `figma_notes` below)
  text: ""                  # path to original prompt if user passed plain text
  attachments: []           # paths to images / mockups copied into artifacts/
domains: []                 # subset of {api, mobile, web, db, cloud} — drives architect fan-out
frozen: false
analyst: "analyst"          # dedicated subagent; not monitor
analyzed_at: ""
---

# Specification: <title>

## Goal
<one paragraph — what user-visible outcome ships when this is done>

## Non-goals
<what is explicitly out of scope; protects against scope creep in agents>

## User stories
- As a **<role>**, I want **<capability>**, so that **<benefit>**.

## Acceptance criteria
> Numbered, testable, observable. Every AC must map to ≥1 test in test-plan.md.

- [ ] **AC-1**: <given/when/then>
- [ ] **AC-2**: ...

## Non-functional requirements
- **Performance**: <budgets, e.g. p95 < 200ms>
- **Accessibility**: WCAG 2.1 AA (default; override if needed)
- **Security**: <auth, data classification, threat notes>
- **Compatibility**: <versions, devices, browsers>

## Affected domains
> Only domains listed here will receive an architect. Empty domains skip the chain.

- **api**: <what changes; entry points; data flow>
- **mobile**: <screens; flows; platform>
- **web**: <routes; components>
- **db**: <tables; migrations; indexes>
- **cloud**: <infra changes; new services>

## Figma / design notes
> Verbatim notes from Figma comments + monitor's interpretation of frames.
> If images were attached, they live in `.pipeline/artifacts/` and are referenced by filename.

## Open questions
> Things the analyst couldn't resolve from inputs. Block contracts phase until answered
> by user or marked "assume X" with rationale.

- [ ] Q-1: ...
