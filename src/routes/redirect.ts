import { Hono } from 'hono';
import { linkNotFound } from '../lib/errors.js';
import { getByCode, incrementClicks } from '../db/links.repo.js';

const CODE_PATTERN = /^[A-Za-z0-9]+$/;

const redirectRouter = new Hono();

/**
 * GET /:code
 * Validates the code format, increments clicks synchronously, then 302-redirects.
 * Returns 404 LINK_NOT_FOUND for unknown codes or codes that don't match the pattern.
 * Registered last in app.ts so it never shadows /api/* routes (ADR-003).
 */
redirectRouter.get('/:code', (c) => {
  const { code } = c.req.param();

  // Guard: reject non-alphanumeric code patterns (ADR-003)
  if (!CODE_PATTERN.test(code)) {
    throw linkNotFound(code);
  }

  // Verify link exists before incrementing
  const link = getByCode(code);
  if (!link) {
    throw linkNotFound(code);
  }

  // Increment clicks synchronously before redirect (A-2)
  incrementClicks(code);

  return c.redirect(link.url, 302);
});

export { redirectRouter };
