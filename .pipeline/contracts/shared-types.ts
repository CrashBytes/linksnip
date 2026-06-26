// contracts/shared-types.ts
// version: 1
// owner: contracts-architect
// spec_ref: LinkSnip URL shortener (AC-1..AC-16)
//
// Single source of truth for types that cross the api <-> web boundary.
// The web page renders Link rows it gets from the api; both domains POST/parse
// CreateLinkRequest/CreateLinkResponse and consume ApiError on failure.
//
// Plain TypeScript (no runtime deps) — the repo is a single TS package.
// The JSON Schema mirror in shared-types.json is the validation artifact;
// keep the two in lockstep. Breaking changes bump the version header.

/**
 * Branded primitive for a short code. A code is a non-empty, URL-safe
 * alphanumeric string. Exact length/charset are an api-architect decision
 * (assumption A-1); the contract only fixes the character class.
 *
 * Pattern (mirrored in shared-types.json): ^[A-Za-z0-9]+$
 */
export type LinkCode = string & { readonly __brand: 'LinkCode' };

/**
 * An absolute http/https URL. The api validates with the WHATWG URL parser
 * and rejects any non-http(s) scheme (NFR security). Branded so a raw string
 * is not accidentally treated as a validated URL.
 */
export type AbsoluteUrl = string & { readonly __brand: 'AbsoluteUrl' };

/**
 * A canonical link record as exposed by the API.
 * Returned (in arrays) by GET /api/links and is the shape LinkStats aliases.
 */
export interface Link {
  /** System-generated short code. Path of the short URL is /<code>. */
  code: LinkCode;
  /** The original absolute http/https destination. */
  url: AbsoluteUrl;
  /** Non-negative redirect count (AC-4, AC-10). */
  clicks: number;
}

/**
 * Stats for a single link (GET /api/links/{code}/stats).
 * Identical shape to Link; aliased to keep one source of truth.
 */
export type LinkStats = Link;

/** Request body for POST /api/links. */
export interface CreateLinkRequest {
  /** Absolute http/https URL to shorten. Validated server-side. */
  url: AbsoluteUrl;
}

/**
 * 201 response body for POST /api/links.
 * shortUrl is built from the request Host (assumption A-3), so its origin
 * varies by deployment; its path is always /<code>.
 */
export interface CreateLinkResponse {
  /** The newly minted short code (always new, even for duplicate URLs — A-4). */
  code: LinkCode;
  /** Fully-qualified short URL whose path is /<code>. */
  shortUrl: AbsoluteUrl;
}

/**
 * Canonical error envelope returned by every non-2xx/3xx API response.
 * `error` is a stable machine code from error-codes.md; `message` is an
 * optional human-readable detail (do not parse it).
 */
export interface ApiError {
  /** Stable error code, e.g. "INVALID_URL" or "LINK_NOT_FOUND". */
  error: ApiErrorCode;
  /** Optional human-readable explanation. */
  message?: string;
}

/** Closed set of error codes — keep in sync with error-codes.md. */
export type ApiErrorCode = 'INVALID_URL' | 'LINK_NOT_FOUND';
