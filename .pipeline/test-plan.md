---
schema_version: 1
last_updated: "2026-06-26T13:55:00Z"
generated_by: ["api-architect", "web-architect"]  # list of agents that have written here
---

# Test plan

> Single source of truth for what tests exist, what they cover, and their state.
> Every test row maps back to ≥1 acceptance criterion. ACs without test rows
> are unimplemented and block phase completion.

## Coverage matrix (AC → tests)

| AC    | Unit                       | Integration       | E2E               | Status   |
|-------|----------------------------|-------------------|-------------------|----------|
| AC-1  | API-U-1, API-U-2           | API-I-1           |                   | planned   |
| AC-2  | API-U-3                    | API-I-2           |                   | planned   |
| AC-3  |                            | API-I-3           |                   | planned   |
| AC-4  |                            | API-I-4           |                   | planned   |
| AC-5  |                            | API-I-5           |                   | planned   |
| AC-6  |                            | API-I-6           |                   | planned   |
| AC-7  |                            | API-I-7           |                   | planned   |
| AC-8  |                            | API-I-8           |                   | planned   |
| AC-9  |                            | API-I-9           |                   | planned   |
| AC-10 |                            | API-I-10          |                   | planned   |
| AC-16 |                            | API-I-11          |                   | planned   |
| AC-11 | WEB-U-1                    |                   | WEB-E-1           | blue-green |
| AC-12 | WEB-U-2, WEB-U-3           |                   | WEB-E-2           | blue-green |
| AC-13 |                            |                   | WEB-E-3           | blue-green |
| AC-14 | WEB-U-4                    |                   | WEB-E-4           | blue-green |
| AC-15 |                            |                   | WEB-E-5           | blue-green |

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
| ID      | AC    | Test                                                                    | Status  | File                          |
|---------|-------|-------------------------------------------------------------------------|---------|-------------------------------|
| API-U-1 | AC-1  | generated code is non-empty and matches `^[A-Za-z0-9]+$`                 | green | tests/unit/code.test.ts       |
| API-U-2 | AC-1  | generated codes are unique across many generations (no dup in N draws)  | green | tests/unit/code.test.ts       |
| API-U-3 | AC-2  | URL validator accepts http/https absolute URLs and rejects empty, missing, bare word, and non-http(s) schemes (ftp/javascript/data) | green | tests/unit/url.test.ts        |

### api · integration
| ID       | AC    | Test                                                                                      | Status  | File                              |
|----------|-------|-------------------------------------------------------------------------------------------|---------|-----------------------------------|
| API-I-1  | AC-1  | POST /api/links with valid URL → 201 with `code` (alphanumeric) and `shortUrl` ending /<code> | green | tests/integration/createLink.test.ts |
| API-I-2  | AC-2  | POST /api/links with missing/empty/non-http(s) url → 400 `{error:"INVALID_URL"}`          | green | tests/integration/createLink.test.ts |
| API-I-3  | AC-3  | POST /api/links twice with same URL → two different codes (A-4 no dedup)                  | green | tests/integration/createLink.test.ts |
| API-I-4  | AC-4  | GET /api/links → 200 array; each item has `code`, `url`, `clicks` (non-negative int)      | green | tests/integration/listLinks.test.ts  |
| API-I-5  | AC-5  | GET /api/links reflects links created by prior POSTs in same session                     | green | tests/integration/listLinks.test.ts  |
| API-I-6  | AC-6  | GET /api/links/:code/stats for existing code → 200 `{code,url,clicks}`                    | green | tests/integration/stats.test.ts      |
| API-I-7  | AC-7  | GET /api/links/:code/stats for unknown code → 404 `{error:"LINK_NOT_FOUND"}`             | green | tests/integration/stats.test.ts      |
| API-I-8  | AC-8  | GET /:code for existing code → 302 with `Location` = original URL                         | green | tests/integration/redirect.test.ts   |
| API-I-9  | AC-9  | GET /:code for unknown code → 404 `{error:"LINK_NOT_FOUND"}`                             | green | tests/integration/redirect.test.ts   |
| API-I-10 | AC-10 | redirect increments clicks: stats clicks after GET /:code is exactly prior+1             | green | tests/integration/redirect.test.ts   |
| API-I-11 | AC-16 | data persists across DB reopen: write via one connection, reopen same file path, link & clicks survive | green | tests/integration/persistence.test.ts |

### mobile · unit
| ID    | AC    | Test                                       | Status | File                              |
|-------|-------|--------------------------------------------|--------|-----------------------------------|

### web · unit
| ID      | AC    | Test                                                                                                                                                 | Status  | File                              |
|---------|-------|------------------------------------------------------------------------------------------------------------------------------------------------------|---------|-----------------------------------|
| WEB-U-1 | AC-11 | `renderForm` output contains a `<form method="post" action="/shorten">` with a `<label for="url">` and an `<input id="url" name="url">` whose id matches the label `for` (programmatic association) and a submit `<button>` with non-empty text | green | tests/unit/form.view.test.ts      |
| WEB-U-2 | AC-12 | `renderLinksTable(links)` for a non-empty `Link[]` produces semantic `<table>` with `<caption>`, `<thead>` containing `<th scope="col">` for the short-link and clicks columns, and one `<tbody><tr>` per link with the code/short-url and clicks in `<td>` cells | green | tests/unit/linksTable.view.test.ts |
| WEB-U-3 | AC-12 | `renderLinksTable([])` (empty) still emits a semantic `<table>` with `<thead>`/`<th scope="col">` header row and an empty-state row, so the table structure is always present | green | tests/unit/linksTable.view.test.ts |
| WEB-U-4 | AC-14 | `renderForm` / `renderPage` given an `error` model emits a non-empty error container with `role="alert"` containing the INVALID_URL message; given no error the alert container is empty/absent (does not silently swallow on the error branch) | green | tests/unit/form.view.test.ts      |

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
| ID      | AC    | Test                                                                                                                                                           | Status | File                              |
|---------|-------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|-----------------------------------|
| WEB-E-1 | AC-11 | `GET /` loads (200) and shows the labeled URL form: `getByRole('textbox', { name: /url/i })` resolves to one input that is associated with a visible label, plus a submit `getByRole('button', { name: /shorten/i })` — verified at all three viewports (390/768/1440) | blue-green | tests/e2e/page.spec.ts            |
| WEB-E-2 | AC-12 | `GET /` shows a semantic links table: `getByRole('table', { name: /links/i })` with column headers for short link and clicks; pre-seeded links render as rows — verified at all three viewports | blue-green | tests/e2e/page.spec.ts            |
| WEB-E-3 | AC-13 | Submitting the form with a valid URL (no-JS native POST) round-trips: after submit the new short link appears as a new row in the table, with no console/page errors (PRG back to `/`) | blue-green | tests/e2e/shorten.spec.ts         |
| WEB-E-4 | AC-14 | Submitting the form with an invalid URL (`not-a-url`) renders a visible `[role="alert"]` error with non-empty text; the failure is not silently swallowed (page still 200 with form + table) | blue-green | tests/e2e/shorten.spec.ts         |
| WEB-E-5 | AC-15 | axe-core finds zero WCAG 2.2 AA violations on `GET /` in both the default state and the post-invalid-submission error state, at all three viewports (mobile 390x844, tablet 768x1024, desktop 1440x900); no horizontal scroll at 320px (reflow) | blue-green | tests/e2e/a11y.spec.ts            |

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
