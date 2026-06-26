---
schema_version: 1
ticket: ""
title: "LinkSnip URL shortener"
sources:
  jira: ""
  figma: ""
  text: ".pipeline/inputs/text.md"
  attachments: []
domains:
  - api
  - web
frozen: true
analyst: "analyst"
analyzed_at: "2026-06-26T13:55:00.000Z"
---

# Specification: LinkSnip URL shortener

## Goal

Ship LinkSnip — a self-contained, single TypeScript Node package that functions as a minimal URL shortener. A user visits the web UI at `/`, pastes any valid HTTP/HTTPS URL into a labeled form, submits it, and immediately sees a shortened link they can share. Any visitor who follows a short link is transparently redirected to the original URL, and every redirect increments the link's click count. The same data is accessible via a JSON API, enabling programmatic creation and inspection of links. All state is stored in a local SQLite database. There are no user accounts, no authentication, and no rate limiting in scope.

## Non-goals

The following are explicitly out of scope for this delivery:

- **Authentication and accounts** — no login, sessions, API keys, or per-user link ownership.
- **Custom aliases** — callers cannot choose their own short code; codes are system-generated.
- **Link expiry** — links do not expire and no TTL field is stored or enforced.
- **Link editing** — the target URL of an existing link cannot be changed after creation.
- **Link deletion** — there is no delete endpoint or UI action.
- **Analytics beyond click count** — no referrer, geo, user-agent, or time-series data.
- **Rate limiting or abuse prevention** — no throttling of POST requests.
- **Custom domains or base-URL configuration at runtime** — the short URL origin is derived from the incoming request's Host header (see Assumption A-3).
- **Pagination** — `GET /api/links` returns all links in a single response.
- **Mobile native app** — the only UI is the server-rendered HTML page.

## User stories

- As a **visitor**, I want to **paste a URL into a form and receive a shortened link**, so that **I can share a compact URL**.
- As a **visitor**, I want to **see a table of all created links and their click counts**, so that **I can monitor usage at a glance**.
- As a **link recipient**, I want to **follow a short link and be redirected to the original URL**, so that **I reach the intended destination without knowing the original URL in advance**.
- As an **API consumer**, I want to **POST a URL and receive a short code and full short URL**, so that **I can integrate URL shortening into my own tooling**.
- As an **API consumer**, I want to **GET all links with their click counts**, so that **I can audit or display the full link inventory**.
- As an **API consumer**, I want to **GET stats for a specific short code**, so that **I can inspect a single link's metadata and click count**.

## Acceptance criteria

> Each AC is independently testable and maps to a single boolean assertion.

- [ ] **AC-1**: `POST /api/links` with a valid absolute `http://` or `https://` URL in the JSON body `{"url": "..."}` responds with HTTP 201 and a JSON body containing the fields `code` (a non-empty alphanumeric string) and `shortUrl` (a fully-qualified URL whose path is `/<code>`).
- [ ] **AC-2**: `POST /api/links` with a body where `url` is missing, empty, or not a valid absolute HTTP/HTTPS URL responds with HTTP 400.
- [ ] **AC-3**: `POST /api/links` with a URL that was previously shortened creates a **new** short code (duplicate URLs each receive their own code).
- [ ] **AC-4**: `GET /api/links` responds with HTTP 200 and a JSON array where each element contains at minimum the fields `code`, `url`, and `clicks` (a non-negative integer).
- [ ] **AC-5**: `GET /api/links` reflects every link created by prior `POST /api/links` calls within the same server session.
- [ ] **AC-6**: `GET /api/links/:code/stats` for an existing `code` responds with HTTP 200 and a JSON body `{"code": "...", "url": "...", "clicks": <integer>}`.
- [ ] **AC-7**: `GET /api/links/:code/stats` for an unknown `code` responds with HTTP 404.
- [ ] **AC-8**: `GET /:code` for an existing `code` responds with HTTP 302 and a `Location` header set to the original URL.
- [ ] **AC-9**: `GET /:code` for an unknown `code` responds with HTTP 404.
- [ ] **AC-10**: After a `GET /:code` redirect for an existing link, the `clicks` value returned by `GET /api/links/:code/stats` is exactly one greater than it was before the redirect.
- [ ] **AC-11**: The HTML page served at `GET /` responds with HTTP 200 and contains a `<form>` element with a labeled text input (the label is programmatically associated with the input via `for`/`id` or wrapping) for entering a URL.
- [ ] **AC-12**: The HTML page at `GET /` contains a `<table>` (or `<table role="table">`) with a visible header row naming at minimum the columns for short link and click count, and rows for each existing link.
- [ ] **AC-13**: Submitting the form on the web UI with a valid URL causes the newly created short link to appear in the links table on the resulting page (the full round-trip succeeds without a JavaScript error).
- [ ] **AC-14**: Submitting the form on the web UI with an invalid URL (e.g., a bare word with no scheme) causes an error to be displayed to the user — the page does not silently swallow the failure.
- [ ] **AC-15**: The page at `GET /` has no accessibility violations at WCAG 2.2 AA level as reported by an automated accessibility checker (e.g., axe-core).
- [ ] **AC-16**: All link and click-count data persists across a server restart (i.e., the SQLite database is written to disk, not held only in memory).

## Non-functional requirements

- **Performance**: No explicit budget specified in inputs. **Assumption A-5**: redirect (`GET /:code`) should complete in under 50 ms p95 under single-user local load; API reads under 100 ms p95. These are advisory targets for the architects, not hard gates.
- **Accessibility**: WCAG 2.2 AA (per `config.yml` `accessibility.standards`), Section 508, and EN 301 549. Automated checks via axe-core or equivalent are required on the web domain. A VPAT is required per config.
- **Security**: No authentication is in scope. The `url` input must be validated server-side to prevent redirect to arbitrary schemes (only `http:` and `https:` are accepted). No SQL injection risk is introduced (parameterised queries assumed; this is an implementation constraint for the architects).
- **Compatibility**: The server-rendered HTML page must function without client-side JavaScript (the core form submission must use a plain HTML `<form>` with a standard POST action, not a JS fetch). Playwright e2e tests run against the three viewport sizes defined in `config.yml` (mobile 390x844, tablet 768x1024, desktop 1440x900).
- **Testing**: Vitest covers unit and integration tests; Playwright covers web e2e. Coverage percentage gate is 0% (config `require_coverage_pct: 0`) but meaningful coverage of all endpoints and the web form flow is expected.

## Affected domains

### api

A single Hono application exposes the following HTTP surface within the same Node process:

- `POST /api/links` — accepts `application/json` body `{"url": string}`, validates the URL (WHATWG URL parse + scheme check), generates a unique short code, persists the link in SQLite, and returns 201 `{"code": string, "shortUrl": string}`.
- `GET /api/links` — reads all rows from the links table (with their current click counts) and returns a 200 JSON array.
- `GET /api/links/:code/stats` — looks up a single link by code and returns 200 `{"code", "url", "clicks"}` or 404.
- `GET /:code` — looks up the link, increments its click count atomically, and issues a 302 redirect; returns 404 if not found.

The SQLite database (better-sqlite3) is the sole persistence layer. It is accessed directly from the Hono route handlers (or a thin service/repository layer — implementation is the architect's decision). No external database, cache, or queue is in scope.

**Assumption A-1**: Short codes are randomly generated, URL-safe alphanumeric strings. Exact length and charset are an implementation detail for the architects, subject only to the constraint that codes must be unique within the database.

**Assumption A-2**: The click-count increment on redirect is performed synchronously (blocking) before the 302 response is sent, to keep consistency guarantees simple. The architects may choose async if they document the trade-off.

**Assumption A-3**: The `shortUrl` value returned by `POST /api/links` is constructed from the `Host` (and protocol inferred from the connection or an `X-Forwarded-Proto` header) of the incoming request, so that the package works correctly regardless of the hostname it is deployed on. No hard-coded base URL is stored in config.

**Assumption A-4**: Each `POST /api/links` call always creates a new code, even if the URL was previously shortened. De-duplication is not performed.

### web

A single server-rendered HTML page is served at `GET /` by the same Hono process. It contains:

- A `<form>` with a labeled `<input type="url">` (or `type="text"`) for entering the long URL, and a submit button. The form submits to `POST /api/links` (or a dedicated form-handling route if the architects need to handle redirect-back-to-`/`; implementation detail).
- A `<table>` listing all current links, including at minimum columns for the short URL (or code) and the click count. The table must use proper `<thead>` / `<tbody>` / `<th>` markup for semantic correctness.
- An error message area that is shown when the submitted URL is invalid (sourced from the API's 400 response or server-side validation).

No client-side JS framework is required. The page must be functional with JavaScript disabled. The architects may add progressive enhancement (e.g., a JS fetch to update the table without full reload) but this is not required by the spec.

## Figma / design notes

No Figma file was linked for this run. No design mockups or attachments were provided. The UI implementation should follow standard accessible HTML conventions. No expected screenshot files have been placed in `.pipeline/artifacts/expected/`.

## Open questions

All ambiguities have been resolved via assumptions documented inline above and summarised here:

- **A-1** (code generation): Short codes are randomly generated URL-safe alphanumeric strings; exact length and charset are left to the architect. _Rationale: the prompt does not specify; any reasonable unique code satisfies the spec._
- **A-2** (click increment timing): The click count is incremented synchronously before the redirect response. _Rationale: simplest correct behaviour; architects may relax this with documentation._
- **A-3** (shortUrl origin): The `shortUrl` base is derived from the incoming request's `Host` header (and protocol). _Rationale: a hard-coded origin would break in any non-localhost deployment; dynamic derivation is the only portable choice for a package with no deployment config._
- **A-4** (duplicate URLs): Each POST creates a new code regardless of whether the URL was seen before. _Rationale: the prompt says nothing about de-duplication; the simplest correct behaviour is always create._
- **A-5** (performance budget): No formal budget was given; advisory targets of 50 ms p95 for redirects and 100 ms p95 for API reads are noted. _Rationale: these are reasonable defaults for a local SQLite-backed service and give architects a target without blocking the spec._

There are no unresolved open questions. The spec is ready for the contracts and architecture phases.
