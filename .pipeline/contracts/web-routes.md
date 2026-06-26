<!--
contracts/web-routes.md
version: 1
owner: contracts-architect
spec_ref: LinkSnip URL shortener (AC-11..AC-15, NFR Compatibility/Accessibility)
-->

# Web routes — public route contract

The web domain is a single server-rendered HTML page served by the same Hono
process as the API. No client-side JS framework is required and the core flow
MUST work with JavaScript disabled (NFR Compatibility): the form is a plain HTML
`<form>` doing a standard POST, not a `fetch`. Progressive enhancement is allowed
but never required.

## Routes

| Route        | Method | Auth | Rendering      | Purpose                                                      |
|--------------|--------|------|----------------|-------------------------------------------------------------|
| `/`          | GET    | none | server-rendered | The HTML page: labeled URL form + links table + error area. |
| `/{code}`    | GET    | none | redirect        | Short-link redirect (shared with the api; see api.openapi.yml). |

`GET /{code}` is the same redirect route documented in `api.openapi.yml`
(`operationId: redirectToTarget`): 302 with a `Location` header to the original
URL, or 404 for an unknown code. It is listed here only because the web UI links
point at it; its contract lives in the OpenAPI file (one source of truth).

## `GET /` — the page

Returns HTTP 200 with `Content-Type: text/html`. The page MUST contain:

- A `<form>` with a labeled text input for the long URL. The label is
  programmatically associated with the input via `for`/`id` or by wrapping
  (AC-11). Use `<input type="url">` or `type="text"` plus a submit button.
- A semantic `<table>` using `<thead>`/`<tbody>`/`<th>` with a visible header row
  naming at minimum the short-link and click-count columns, and one row per
  existing link (AC-12). Rows are populated from the same data as
  `GET /api/links` (`Link[]` from `shared-types`).
- An error area that becomes visible when submission fails with `INVALID_URL`
  (AC-14). It MUST NOT silently swallow the failure.

Accessibility: the page MUST have no WCAG 2.2 AA violations per an automated
checker such as axe-core (AC-15). Tested at the three viewports in `config.yml`
(mobile 390x844, tablet 768x1024, desktop 1440x900).

### Form submit target

The form's `action` submits a URL for shortening. Two contract-compatible
options, the choice being a web-architect detail:

1. **Direct to the API**: `action="/api/links"`, `method="post"`. On success the
   user lands on the 201 JSON (acceptable only if paired with progressive
   enhancement); for the no-JS path most implementations prefer option 2.
2. **Dedicated form route that redirects back to `/`** (recommended for no-JS):
   a POST handler that calls the same create-link logic, then issues a redirect
   (Post/Redirect/Get) back to `GET /` so the new link appears in the table
   (AC-13) and an invalid URL re-renders `/` with the error area populated
   (AC-14). The exact path of this handler (e.g. `POST /` or `POST /links`) is an
   implementation detail and NOT a cross-domain contract — it is internal to the
   web layer. Whatever path is chosen, it MUST consume `CreateLinkRequest` and
   honor the `INVALID_URL` (400) contract from `error-codes.md`.

The contract fixes only: the public page is `GET /`; it satisfies AC-11..AC-15;
it must function without client JS; and any create path reuses the
`CreateLinkRequest` / `INVALID_URL` contracts.

## Query params, redirects, sitemap

- `GET /` takes no required query params. A web-architect may add an optional flag
  (e.g. `?error=invalid_url`) as part of the PRG flow; this is internal, not a
  cross-domain contract.
- No additional redirects beyond `GET /{code}`.
- Sitemap: only `GET /` is a public, indexable page. `GET /{code}` routes are
  transient redirects and should not be listed in a sitemap.

## Form submission flow (no-JS, recommended option 2)

```
1. User loads GET /            -> 200 HTML: form + table (current links) + empty error area
2. User submits valid URL      -> server creates link -> 302 redirect back to GET /
3. GET / re-renders            -> 200 HTML: table now includes the new short link (AC-13)

Invalid-URL branch:
2'. User submits "not-a-url"   -> server validation fails (INVALID_URL / 400)
3'. Page re-renders GET /      -> 200 HTML: error area shows a visible message (AC-14)
```
