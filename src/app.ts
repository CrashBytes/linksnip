import { Hono } from 'hono';
import { apiRouter } from './routes/api.js';
import { redirectRouter } from './routes/redirect.js';
import { ApiError } from './lib/errors.js';

const honoApp = new Hono();

// Mount API router first (ADR-003 ordering: /api/* before /:code)
honoApp.route('/api', apiRouter);

// Web router will be added here by the ui phase (GET /, POST /shorten)
// Do NOT add /:code before that slot.

// Register /:code catch-all LAST so it never shadows /api/* (ADR-003)
honoApp.route('/', redirectRouter);

// Central error handler: maps ApiError to contract-specified envelopes (ADR-005)
honoApp.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(
      { error: err.code, message: err.message },
      err.httpStatus as 400 | 404,
    );
  }

  // Unexpected errors: log server-side, return generic 500 (no typed code)
  console.error('Unhandled error:', err);
  return c.json({ error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }, 500);
});

/**
 * Test-compatible app wrapper.
 *
 * The TDD tests call app.request(method, path, options?) where options may
 * contain a `json` field. This adapts that signature to Hono's native
 * app.request(url, requestInit) pattern.
 *
 * app.fetch is passed through for the server entry point.
 */
export const app = {
  fetch: honoApp.fetch,

  async request(
    methodOrInput: string,
    pathOrInit?: string | RequestInit,
    options?: { json?: unknown },
  ): Promise<Response> {
    // Called as app.request(method, path, { json }) or app.request(method, path)
    if (typeof pathOrInit === 'string') {
      const method = methodOrInput.toUpperCase();
      const path = pathOrInit;
      const url = `http://localhost${path}`;

      const requestInit: RequestInit = { method };

      if (options?.json !== undefined) {
        requestInit.headers = { 'Content-Type': 'application/json' };
        requestInit.body = JSON.stringify(options.json);
      }

      return Promise.resolve(honoApp.request(url, requestInit));
    }

    // Called as app.request(url) or app.request(url, requestInit)
    return Promise.resolve(
      honoApp.request(methodOrInput, pathOrInit as RequestInit | undefined),
    );
  },
};
