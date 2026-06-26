<!--
contracts/error-codes.md
version: 1
owner: contracts-architect
spec_ref: LinkSnip URL shortener (AC-2, AC-7, AC-9, AC-14)
-->

# Error codes — canonical table

Single source of truth for every error code that crosses a domain boundary in
LinkSnip. Downstream agents (api, web, TDD) MUST use these exact `error` strings
and MUST NOT invent new ones. To add a code, add a row here first, then add it to
the `ApiErrorCode` enum in `shared-types.ts` / `shared-types.json`, then reference
it from `api.openapi.yml`.

All error responses use the `ApiError` envelope
(`{ "error": <code>, "message"?: <string> }`) defined in `shared-types.json#/definitions/ApiError`.
The `message` field is advisory and human-readable; clients key off `error` only.

| Code             | HTTP | Meaning                                                                 | Recovery                                              |
|------------------|------|------------------------------------------------------------------------|------------------------------------------------------|
| `INVALID_URL`    | 400  | `url` is missing, empty, or not a valid absolute `http`/`https` URL.    | Resubmit with a valid absolute http(s) URL.          |
| `LINK_NOT_FOUND` | 404  | No link exists for the requested `code`.                                | Verify the code; it may never have existed (no expiry/deletion in scope). |

## Per-endpoint applicability

| Endpoint                       | Codes it can return            |
|--------------------------------|--------------------------------|
| `POST /api/links`              | `INVALID_URL` (400)            |
| `GET /api/links`               | — (always 200)                 |
| `GET /api/links/{code}/stats`  | `LINK_NOT_FOUND` (404)         |
| `GET /{code}`                  | `LINK_NOT_FOUND` (404)         |

## Example bodies

`INVALID_URL` (HTTP 400) — returned by `POST /api/links` for a bare word, an empty
string, a missing field, or a non-http(s) scheme such as `ftp://` or `javascript:`:

```json
{ "error": "INVALID_URL", "message": "url must be an absolute http or https URL" }
```

`LINK_NOT_FOUND` (HTTP 404) — returned by `GET /api/links/{code}/stats` and
`GET /{code}` for an unknown code:

```json
{ "error": "LINK_NOT_FOUND", "message": "no link exists for code 'zzzzzz'" }
```

## Notes for the web domain

`POST /api/links` is also the target of the no-JS HTML form (AC-13/AC-14). When the
form-handling route returns a 400 with `INVALID_URL`, the web layer MUST surface a
visible error message in the page's error area rather than swallowing it (AC-14).
Whether the web layer re-renders `/` with the error inline or maps the JSON error
to page state is an implementation detail for the web-architect; the contract only
fixes the `error` code and HTTP status above.
