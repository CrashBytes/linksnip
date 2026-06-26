# Architecture decisions

> Lightweight ADR log. Architects append; nobody edits past entries (supersede instead).
> One decision per heading. Keep them short — link to spec.md or contracts/ for detail.

## ADR-000: Template

- **Date**: YYYY-MM-DD
- **Status**: proposed | accepted | superseded by ADR-XXX
- **Authors**: <agent name(s)>
- **Domain(s)**: api | mobile | web | db | cloud | cross-cutting

### Context
What problem are we solving? What forced the choice?

### Decision
What did we choose? Be specific — name the library, pattern, schema field.

### Consequences
- What becomes easier
- What becomes harder
- What we've ruled out and why

### Alternatives considered
- **Option A**: <one-liner + why rejected>
- **Option B**: <one-liner + why rejected>

---

## ADR-001: Contract surface — shared types, error codes, and versioning

- **Date**: 2026-06-26
- **Status**: accepted
- **Authors**: contracts-architect
- **Domain(s)**: cross-cutting

### Context
The api and web domains must design against one interface surface (4 endpoints +
1 HTML page). Spec.md leaves several details to architects (code length/charset
A-1, shortUrl origin A-3, db table shape — no active db domain). The contracts
must fix only what crosses the api<->web boundary without over-constraining
implementations.

### Decision
- **Shared types** live in `shared-types.ts` (TS source of truth) mirrored by
  `shared-types.json` (JSON Schema, the validation artifact). Six types:
  `Link`, `LinkStats` (= `Link`), `CreateLinkRequest`, `CreateLinkResponse`,
  `ApiError`, plus the `ApiErrorCode` enum; with branded primitives `LinkCode`
  and `AbsoluteUrl` to stop IDs/URLs being swapped.
- **`code`** typed as non-empty `^[A-Za-z0-9]+$` with no length bound (honors A-1).
- **`url`/`shortUrl`** typed as `AbsoluteUrl` (`^https?://`, format uri) per the
  http/https-only security NFR; OpenAPI examples use `http://localhost:3000/<code>`
  illustratively since the real origin derives from Host (A-3).
- **Error codes** are a closed set in `error-codes.md` + the `ApiErrorCode` enum:
  `INVALID_URL` (400) and `LINK_NOT_FOUND` (404). Downstream may not invent codes.
- **OpenAPI** is 3.1, references shared types via
  `$ref: ./shared-types.json#/definitions/<Type>` (single source of truth — no
  inline duplicate schemas). `GET /{code}` modeled as a 302 + required `Location`
  header, no body, at top level (not under /api).
- **No `db.schema.sql`**: no db domain is active; table design is deferred to the
  api-architect, as the brief directs.
- **Versioning**: every file carries `version: 1`; breaking changes bump it.
- **Lint policy**: redocly `security-defined` / `operation-2xx`/`4xx-response`
  rules are disabled in `.pipeline/contracts/.redocly.yaml` because they
  contradict the frozen spec (no auth in scope; list endpoint is 200-only; the
  redirect is 302-only).

### Consequences
- Easier: api and web share exact request/response shapes; TDD fixtures copy the
  contract examples verbatim.
- Harder: any change to a shared type touches both domains and bumps the version.
- Ruled out: de-duplicated schemas in OpenAPI (would drift from shared-types);
  hard-coded shortUrl origin (breaks A-3); a frozen DB schema (no db domain).

### Alternatives considered
- **Inline OpenAPI schemas**: rejected — duplicates shared-types, invites drift.
- **Freezing code length/charset now**: rejected — A-1 leaves it to the architect.

---

## ADR-002: Project layout & toolchain for the single TypeScript package

- **Date**: 2026-06-26
- **Status**: accepted
- **Authors**: api-architect
- **Domain(s)**: api (cross-cutting — web shares this package)

### Context
Greenfield repo: no `package.json`, no `src/`. The spec mandates a *single*
TypeScript Node package hosting both the Hono API and the server-rendered web
page in one process. `config.yml` `commands.api` / `commands.web` fix the exact
verb→script mapping the verify phase runs verbatim; the scripts must exist and
match. The web domain will add page rendering into this same package, so the
layout must leave clear, non-colliding homes for both domains.

### Decision
- **Package manager / module system**: npm; ESM (`"type": "module"`) with
  `tsx` for the dev server (no build step needed for dev). TypeScript `strict`.
- **`package.json` scripts** (names match `config.yml` exactly — do not rename):
  - `test` → `vitest run`
  - `test:coverage` → `vitest run --coverage`
  - `test:e2e` → `playwright test`
  - `lint` → `eslint .`
  - `typecheck` → `tsc --noEmit`
  - `dev` → `tsx watch src/server.ts`  (this is what `run`=`npm run dev` invokes)
  - `build` → `tsc -p tsconfig.json` (optional prod artifact; not gated)
  - `start` → `node dist/server.js` (prod entry; not gated)
- **Directory layout**:
  - `src/app.ts` — builds and exports the Hono `app` (no `.listen`). This is the
    single import point for both Vitest (`app.request(...)`) and the dev server.
  - `src/server.ts` — imports `app`, starts `@hono/node-server` (`serve`). The
    *only* file that binds a port; never imported by tests.
  - `src/db/` — `schema.ts` (DDL + migration-on-open), `client.ts` (opens the
    better-sqlite3 connection from configured path), `links.repo.ts` (prepared
    statements: insert, getByCode, listAll, incrementClicks).
  - `src/routes/` — `api.ts` (the three `/api/*` routes), `redirect.ts`
    (`GET /:code`). The web domain adds `src/routes/web.ts` (`GET /` etc.) here.
  - `src/lib/` — `code.ts` (short-code generator), `url.ts` (URL validation),
    `shortUrl.ts` (origin derivation from request), `errors.ts` (ApiError +
    central error mapping).
  - `src/views/` — reserved for the web domain (HTML rendering). api writes none.
  - `tests/unit/` and `tests/integration/` — Vitest specs (api-tdd writes these).
  - `tests/e2e/` — Playwright specs (web/e2e owns these).
- **Config files**: `tsconfig.json` (strict, ESM, `moduleResolution: bundler`),
  `vitest.config.ts` (node env, `tests/**` include, v8 coverage),
  `playwright.config.ts` (web/e2e owns viewport matrix from `config.yml`),
  `eslint.config.js` (flat config, `@typescript-eslint`).

### Consequences
- Easier: one `app` export serves tests and the dev server identically — no
  duplicated wiring, no port juggling in integration tests (in-process
  `app.request`). Web slots into `src/routes/web.ts` + `src/views/` without
  touching api files.
- Harder: a shared package means lint/typecheck run over both domains together;
  a web type error can red the api gate (acceptable — single package by spec).
- Ruled out: a build step in the dev loop (tsx runs TS directly; faster iteration).

### Alternatives considered
- **`ts-node` instead of `tsx`**: rejected — tsx has first-class ESM + watch and
  is the common idiomatic choice for Hono node packages.
- **Splitting api/web into workspaces**: rejected — spec says single package; the
  redirect route is literally shared between domains.

---

## ADR-003: Hono app composition & route ordering (avoid /:code shadowing)

- **Date**: 2026-06-26
- **Status**: accepted
- **Authors**: api-architect
- **Domain(s)**: api

### Context
`GET /:code` lives at the top level (not under `/api`), so a naive registration
would let it capture `/`, `/api/links`, `/favicon.ico`, etc. The contract fixes
four routes; the web domain later adds `GET /` and a form-POST route into the
same app. We need a deterministic ordering rule that survives that addition.

### Decision
- **Single `app` (Hono)** assembled in `src/app.ts` by mounting sub-routers in a
  fixed order; Hono matches in registration order, so order *is* the contract:
  1. `app.route('/api', apiRouter)` — all `/api/*` routes first.
  2. Web router for `GET /` and the form-POST route (added by web domain) next.
  3. **Last**: the catch-all redirect `app.get('/:code', redirectHandler)`.
- Because `/:code` is registered last, it can only match a single non-empty path
  segment that nothing earlier claimed. `/api/...` (multi-segment, claimed first)
  and `/` (claimed by the web router) never fall through to it.
- **Code shape guard**: the redirect handler additionally validates `code`
  against `^[A-Za-z0-9]+$` (the `LinkCode` pattern) and returns `LINK_NOT_FOUND`
  (404) for anything that doesn't match, so stray paths like `/robots.txt` get a
  clean 404 envelope rather than a DB lookup on a malformed code.
- `404` handler (`app.notFound`) returns the `LINK_NOT_FOUND` envelope only for
  bare-segment misses routed through `/:code`; unmatched `/api/*` paths get a
  generic 404 (not in the closed error set, so a plain 404 with no typed body).

### Consequences
- Easier: web can add `GET /` freely; ordering rule documents the one invariant
  (redirect is always last). Tests assert no shadowing via `app.request`.
- Harder: anyone adding a new top-level static route MUST register it *before*
  the redirect catch-all; documented here as the standing rule.
- Ruled out: a regex-segment route or path prefix for codes (e.g. `/r/:code`) —
  the contract fixes the redirect at `/:code`, top level.

### Alternatives considered
- **Registering `/:code` first with manual exclusions**: rejected — brittle
  blocklist; registration-order-last is self-maintaining.

---

## ADR-004: SQLite persistence (better-sqlite3) — schema, path config, access

- **Date**: 2026-06-26
- **Status**: accepted
- **Authors**: api-architect
- **Domain(s)**: api

### Context
SQLite via better-sqlite3 is the sole store (no db domain). AC-16 requires
on-disk persistence across restart, while tests must not pollute prod data and
must be isolatable. better-sqlite3 is synchronous, which makes A-2's
"increment before redirect, synchronously" trivial and atomic.

### Decision
- **Schema** (`src/db/schema.ts`, applied idempotently on open via
  `CREATE TABLE IF NOT EXISTS`):
  ```sql
  CREATE TABLE IF NOT EXISTS links (
    code       TEXT    PRIMARY KEY,
    url        TEXT    NOT NULL,
    clicks     INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  ```
  `code` is the PK (guarantees uniqueness for A-1; collisions surface as a
  constraint error the generator retries on — see ADR-005). `created_at` gives a
  stable list order (`ORDER BY created_at, code`); it is *not* exposed in any
  contract type (`Link` has only `code`/`url`/`clicks`).
- **PRAGMAs on open**: `journal_mode = WAL` and `foreign_keys = ON` (harmless
  here, future-proof). WAL improves concurrent read/redirect throughput.
- **DB path config** (`src/db/client.ts`): read `process.env.DATABASE_PATH`;
  default to `./data/linksnip.db` (on-disk → satisfies AC-16). Tests set
  `DATABASE_PATH=:memory:` (in-memory, isolated per process) or a per-test temp
  file. AC-16's restart test specifically uses a *temp file path*, opens →
  writes → closes the connection → reopens a fresh connection on the same path
  and asserts data survives.
- **Access pattern**: a thin repository (`src/db/links.repo.ts`) owns all SQL via
  **prepared, parameterized statements** (no string interpolation — satisfies the
  no-SQL-injection NFR). Routes call repo methods; no raw SQL in handlers.
- **`data/` dir**: created on startup if missing; added to `.gitignore`.

### Consequences
- Easier: synchronous better-sqlite3 → atomic increment + read with zero async
  ceremony (A-2); `:memory:` makes integration tests fast and hermetic.
- Harder: a single on-disk file is not horizontally scalable — explicitly fine
  (no scaling in scope). WAL leaves `-wal`/`-shm` sidecar files; `.gitignore`
  covers the whole `data/` dir.
- Ruled out: an ORM (Prisma/Drizzle) — overkill for one table; raw prepared
  statements are clearer and dependency-light per the "stay minimal" stack.

### Alternatives considered
- **`node:sqlite` (built-in)**: rejected — still experimental/flagged across
  the Node range; better-sqlite3 is the spec-named, stable choice.
- **Storing `created_at` as INTEGER epoch**: rejected — `datetime('now')` text is
  human-readable and adequate for ordering; not contract-visible either way.

---

## ADR-005: Short-code generation, URL validation, shortUrl origin & errors

- **Date**: 2026-06-26
- **Status**: accepted
- **Authors**: api-architect
- **Domain(s)**: api

### Context
Four implementation details the contracts deliberately left to api (A-1, A-3,
plus validation and error mapping). Each must satisfy a specific AC and the
security NFR, and each is small enough to be a pure, unit-testable helper.

### Decision
- **Short-code generation** (`src/lib/code.ts`): generate a 7-character string
  over the URL-safe alphanumeric alphabet `[A-Za-z0-9]` (62 symbols) using
  `crypto.randomInt` (uniform, no modulo bias). Matches the `LinkCode` pattern
  `^[A-Za-z0-9]+$`. **Uniqueness** is enforced by the PK: the create flow
  generates a code, attempts insert, and on a `SQLITE_CONSTRAINT_PRIMARYKEY`
  error regenerates and retries (bounded, e.g. 5 attempts) before throwing.
  7 chars × 62 = ~3.5e12 space → collisions are vanishingly rare; retry handles
  the tail. (A-4: every POST mints a fresh code — no URL dedup lookup.)
- **URL validation** (`src/lib/url.ts`): parse with the WHATWG `URL` constructor
  (try/catch); reject if it throws, if input is missing/empty/non-string, or if
  `url.protocol` is not exactly `http:` or `https:`. This blocks `ftp:`,
  `javascript:`, `data:`, mailto, and scheme-relative/relative inputs (AC-2,
  security NFR). Returns a validated `AbsoluteUrl` (brand) or a typed failure.
- **shortUrl origin** (`src/lib/shortUrl.ts`, A-3): derive origin from the
  request — host from `X-Forwarded-Host` else the `Host` header; protocol from
  `X-Forwarded-Proto` else `https` when forwarded-host is present else `http`
  for a bare local Host. `shortUrl = \`${proto}://${host}/${code}\``. No
  hard-coded base URL anywhere.
- **Error handling** (`src/lib/errors.ts`): a small `ApiError` class carrying
  `{ code: ApiErrorCode, httpStatus, message }`. A central Hono `onError` (and
  inline guards) map domain failures to the **exact** envelope from
  `shared-types`/`error-codes.md`: `INVALID_URL` → 400, `LINK_NOT_FOUND` → 404.
  Bodies are exactly `{ "error": <code>, "message": <string> }`. Stack traces are
  never serialized to clients; unexpected errors log server-side and return a
  plain 500 (no typed code — outside the closed set, and no AC requires one).
- **No new error codes** are introduced; the closed set in `error-codes.md`
  fully covers the api ACs.

### Consequences
- Easier: validation, code-gen, and origin are pure functions → cheap, isolated
  unit tests (AC-1/2 helpers). PK-retry needs no pre-check SELECT race window.
- Harder: forwarded-header trust is a (documented) assumption; acceptable since
  no auth/proxy hardening is in scope (A-3, NFR).
- Ruled out: sequential/auto-increment codes (enumerable, leaks volume); URL
  dedup (contradicts A-4); a uuid lib (codes must be short & URL-pretty).

### Alternatives considered
- **`Math.random` for codes**: rejected — biased/non-crypto; `crypto.randomInt`
  is uniform and standard-lib.
- **nanoid dependency**: rejected — a 10-line `crypto.randomInt` loop avoids a
  dep for a trivial need; either is fine, chose zero-dep.
- **Pre-insert `SELECT` for collision check**: rejected — TOCTOU race; let the PK
  constraint be the source of truth and retry on conflict.

---

## ADR-006: Web rendering — server-rendered HTML via `hono/html`, no client framework

- **Date**: 2026-06-26
- **Status**: accepted
- **Authors**: web-architect
- **Domain(s)**: web

### Context
The web domain is a single server-rendered page at `GET /` served by the *same*
Hono process and *same* TS package as the api (ADR-002 layout reserves
`src/views/` for web rendering and `src/routes/web.ts` for web routes). The spec
NFR (Compatibility) and every a11y criterion (`web-criteria.md`, esp. the No-JS
constraint note) require the page to be fully functional with JavaScript
disabled: the form is a plain `<form method="post">`, the error/success regions
must be present in the *initial* HTML (not JS-injected). Greenfield, so no
existing component style to conform to — the only fixed choice is "stay inside
the Hono + TS single package; do NOT introduce React/Next/Vue or a second build"
(brief constraint).

### Decision
- **Templating**: use Hono's built-in **`html` tagged template** (`hono/html`,
  with `raw`/`html` helpers and the `html\`…\`` literal) for all markup. Zero new
  dependencies, ships with Hono, auto-escapes interpolated values (XSS-safe for
  user-supplied URLs in the table), and is the idiomatic Hono SSR primitive for a
  package that has no JSX/React toolchain. (`hono/jsx` is the alternative; see
  Alternatives — rejected to avoid a JSX build/tsconfig pivot in a non-React
  package.)
- **No client-side JS at all** in the baseline. No `<script>` is required for any
  AC or a11y criterion. Progressive enhancement is explicitly out of scope for
  this delivery (spec says optional; we ship none — keeps the No-JS guarantee
  trivially true and the surface minimal).
- **View module layout** (under the reserved `src/views/` from ADR-002), authored
  as *pure functions returning HTML strings* so they are unit-testable in Vitest
  with no browser:
  - `src/views/page.ts` — `renderPage(model: PageModel): string` — the full
    `<!doctype html>` document (lang, head/title, single `<h1>`, form, table,
    error/success regions). Composes the partials below.
  - `src/views/linksTable.ts` — `renderLinksTable(links: Link[]): string` — the
    semantic `<table>` (AC-12 / A11Y-WEB-009/010). Consumes the contract `Link[]`
    type from `shared-types.ts` (same shape as `GET /api/links`).
  - `src/views/form.ts` — `renderForm(model): string` — the labeled URL `<form>`
    plus error region and optional success region.
  - `src/views/layout.ts` — `renderDocument(head, body): string` — the `<html
    lang>` / `<head>`(title, meta charset, **`<meta name="viewport"
    content="width=device-width, initial-scale=1">`**) shell + inline `<style>`.
  - `PageModel` is a small web-internal type (NOT a contract): `{ links: Link[];
    error?: { code: 'INVALID_URL'; message: string }; success?: { shortUrl:
    string } }`. It reuses the frozen `Link` and `ApiErrorCode` types; it is not
    added to `shared-types.ts` (it never crosses the api↔web boundary).
- **Styling**: a single small **inline `<style>` block** in the document `<head>`
  (no Tailwind, no CSS-module/postcss pipeline — greenfield, and ADR-002's
  toolchain has no CSS build). The style block encodes the responsive +
  accessibility tokens from ADR-007. Inline keeps the No-JS / no-build guarantee
  and means the a11y states render identically with CSS as the only enhancement.
- **Static rendering, no data layer of its own**: the web routes read links via
  the *same* `links.repo.ts` (ADR-004) the api uses — web does NOT call the HTTP
  api over the network; it calls the in-process repo/service. This keeps a single
  source of truth and avoids a self-fetch.

### Consequences
- Easier: render helpers are pure `string`-returning functions → fast, hermetic
  Vitest unit tests (no DOM, no Playwright) for table/error/form markup (AC-11,
  AC-12, AC-14). No build step, no second framework, No-JS guarantee is structural.
- Harder: hand-rolled HTML strings mean discipline around escaping — mitigated by
  `hono/html` auto-escaping interpolations; the table cell URL is the only
  user-controlled value and is auto-escaped.
- Ruled out: any SPA/hydration model; a CSS build pipeline; self-HTTP-fetch from
  the web route to the api.

### Alternatives considered
- **`hono/jsx` (Hono's JSX runtime)**: rejected — would require flipping
  `tsconfig` `jsx`/`jsxImportSource` and authoring `.tsx`, a React-shaped pivot in
  a package that is otherwise plain `.ts`. `hono/html` gives the same SSR result
  with zero toolchain change. (Either is contract-compatible; chose the
  lower-footprint option.)
- **A separate frontend build (Vite/React)**: rejected by brief — single package,
  no second build, must work without client JS.

---

## ADR-007: Form submission flow (PRG), error/success surfacing & responsive a11y

- **Date**: 2026-06-26
- **Status**: accepted
- **Authors**: web-architect
- **Domain(s)**: web

### Context
The JSON `POST /api/links` returns a 201 JSON body, not an HTML page — landing a
no-JS form there would dump JSON at the user (AC-13 needs the new link to appear
in the *table* on a rendered page; AC-14 needs a visible error). `web-routes.md`
recommends option 2: a dedicated form-handling route that reuses the create
logic, then Post/Redirect/Get back to `GET /`. The error and success regions
must be in the *server-rendered HTML* (No-JS constraint note in
`web-criteria.md`), and the page must satisfy all 19 a11y criteria across three
viewports. This ADR fixes the form route, the PRG/error flow, and the
responsive + a11y design that the rendering in ADR-006 must encode.

### Decision

**Form route (web-internal, additive — NOT a cross-domain contract).**
- Introduce **`POST /shorten`** registered in `src/routes/web.ts`, mounted in
  `src/app.ts` *after* the api router and *before* the `/:code` redirect catch-all
  (ADR-003 ordering rule: any new top-level route registers before the redirect).
  `/shorten` is multi-segment-safe and never shadows `/:code`.
- The form is `<form method="post" action="/shorten">`. It submits
  `application/x-www-form-urlencoded` with a single field `url` (the No-JS native
  encoding). The handler reads `url` from the form body, builds a
  `CreateLinkRequest`, and calls the **same create-link service/repo path the api
  uses** (ADR-004/005) — same WHATWG validation (`src/lib/url.ts`), same code-gen,
  same `INVALID_URL` semantics. No duplicate validation logic.
- **Success (valid URL)** → create the link, then **302 redirect (PRG) to `GET /`**
  with a one-shot success signal. Signal mechanism: a short-lived flag carried as a
  query param, e.g. `GET /?created=<code>` (internal flag explicitly permitted by
  `web-routes.md`; no cookies/sessions in scope). `GET /` looks up that code in the
  repo to render the success banner (`role="status"`) showing the new short URL.
  Because the table is re-read from the repo on `GET /`, the new link also appears
  in the table (AC-13). PRG means a refresh does not re-submit.
- **Failure (INVALID_URL)** → the handler re-renders the `GET /` page directly
  (HTTP 200, no redirect) with the error region populated (`role="alert"`,
  non-empty message) and the table of existing links still shown. Rendering inline
  (rather than redirecting with `?error=`) keeps the invalid input context and
  guarantees the `role="alert"` markup is in the emitted HTML (AC-14,
  A11Y-WEB-007, No-JS note). The status stays 200 (page rendered fine; only the
  submitted value was rejected). Optionally the rejected value is echoed back into
  the input's `value` so the user can correct it (auto-escaped).
- The JSON endpoints in `api.openapi.yml` are **unchanged**; `/shorten` is pure
  additive web glue consuming `CreateLinkRequest` + honoring the `INVALID_URL`
  contract from `error-codes.md`.

**Page structure & a11y (encodes `web-criteria.md`).**
- `<html lang="en">` (A11Y-WEB-001); `<head>` has a non-empty `<title>` "LinkSnip —
  URL Shortener" (A11Y-WEB-002) and the viewport meta (responsive baseline).
- Exactly one `<h1>` ("LinkSnip"); section headings descend without skipping
  (A11Y-WEB-003).
- **Form**: a visible persistent `<label for="url">URL to shorten</label>`
  associated with `<input id="url" name="url" type="url" required>`
  (A11Y-WEB-004/005/008); submit `<button type="submit">Shorten</button>` with
  visible text (A11Y-WEB-006). Native form → fully keyboard operable
  (A11Y-WEB-013/014/018).
- **Error region**: a container with `role="alert"` placed adjacent to the input,
  also referenced by the input via `aria-describedby` when present
  (A11Y-WEB-007). Empty/absent on the default render; populated with the message
  on the failure render. Marked up in HTML, never JS-toggled (No-JS note).
- **Success region**: a banner with `role="status"` rendered only on the
  `?created=` branch (A11Y-WEB-019), announced without stealing focus.
- **Table**: native `<table>` with a `<caption>` ("Shortened links")
  (A11Y-WEB-010), `<thead>` with `<th scope="col">` for **Short link** and
  **Clicks** columns (plus optional Original URL), `<tbody>` one `<tr>` per
  `Link`, `<td>` cells; the short link is an `<a href="/<code>">` pointing at the
  redirect route (A11Y-WEB-009). Empty state: render the table with a single row
  / caption note "No links yet" so the semantic table is always present (AC-12
  holds even with zero links).
- **Contrast**: text `#000` on `#fff` (21:1, A11Y-WEB-011); input border / button
  / focus ring colors chosen ≥ 3:1 vs `#fff` (A11Y-WEB-012) — e.g. border
  `#595959` (≈7:1), button bg a dark token. No low-contrast overrides.
- **Focus ring**: never `outline:none` without replacement; apply a ≥ 2px visible
  `:focus-visible` outline (A11Y-WEB-015).
- **Target size**: input and button styled to **≥ 44×44 CSS px** (exceeds the 24px
  A11Y-WEB-016 floor; meets the brief's mobile touch-target minimum); table row
  `<a>` links sized/padded ≥ 24×24 (A11Y-WEB-016).
- **Responsive (mobile-first, viewports 390 / 768 / 1440)**: single-column fluid
  layout, `max-width` content container with `width:100%` (no fixed px widths that
  overflow at 390/320). Table uses `width:100%` with wrapping/`overflow-wrap` on
  the long Original-URL cell so the page reflows to a single column with **no
  horizontal scroll at 320px** (A11Y-WEB-017, 1.4.10). Nothing reflows away;
  layout is identical structure at all three viewports (the page is simple enough
  that no breakpoint *rearrangement* is needed — only fluid sizing — which is the
  safest reflow strategy here). Fluid type (`rem`/`%`), no fixed-width containers.

### Consequences
- Easier: one create path (api + web share it) → no validation drift; PRG gives a
  clean refresh-safe success and a refresh-safe error-free history; all a11y
  regions are static HTML so axe-core passes in both default and error states
  with JS disabled.
- Harder: the success banner needs a one-shot signal without sessions — solved
  with the `?created=<code>` flag + repo lookup (no cookie infra). A stale/invalid
  `?created=` simply renders no banner (defensive).
- Ruled out: form posting directly to `/api/links` for the no-JS path (lands on
  JSON, fails AC-13); JS-injected error/success regions (violates No-JS note);
  cookies/sessions for flash messages (out of scope, none in the package).

### Alternatives considered
- **`POST /` (same path as the page) instead of `POST /shorten`**: rejected for
  clarity — a distinct verb-named path is unambiguous in route ordering and in
  tests; functionally equivalent. (`POST /` would also work within ADR-003
  ordering.)
- **Redirect-with-`?error=invalid_url` for the failure branch**: rejected —
  loses the submitted value and adds a round-trip; inline re-render keeps context
  and guarantees the `role="alert"` HTML is present (AC-14).
- **Flash via signed cookie**: rejected — introduces session/cookie infra not in
  scope for a no-accounts package.

---
