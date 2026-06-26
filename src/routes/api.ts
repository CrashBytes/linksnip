import { Hono } from 'hono';
import { validateUrl } from '../lib/url.js';
import { deriveShortUrl } from '../lib/shortUrl.js';
import { invalidUrl, linkNotFound } from '../lib/errors.js';
import { insertLink, getByCode, listAll } from '../db/links.repo.js';

const apiRouter = new Hono();

/**
 * POST /api/links
 * Validates url, mints a short code, persists the link, returns 201 + {code, shortUrl}.
 */
apiRouter.post('/links', async (c) => {
  const body = await c.req.json<{ url?: unknown }>();
  const validation = validateUrl(body?.url);

  if (validation.type === 'failure') {
    throw invalidUrl(validation.reason);
  }

  const link = insertLink(validation.url);
  const shortUrl = deriveShortUrl(c, link.code);

  return c.json({ code: link.code, shortUrl }, 201);
});

/**
 * GET /api/links
 * Returns all links with code, url, clicks (always 200).
 */
apiRouter.get('/links', (c) => {
  const links = listAll();
  return c.json(links, 200);
});

/**
 * GET /api/links/:code/stats
 * Returns stats for a single link or 404 LINK_NOT_FOUND.
 */
apiRouter.get('/links/:code/stats', (c) => {
  const { code } = c.req.param();
  const link = getByCode(code);

  if (!link) {
    throw linkNotFound(code);
  }

  return c.json(link, 200);
});

export { apiRouter };
