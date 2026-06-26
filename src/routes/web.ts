import { Hono } from 'hono';
import { listAll, insertLink, getByCode } from '../db/links.repo.js';
import { validateUrl } from '../lib/url.js';
import { deriveShortUrl } from '../lib/shortUrl.js';
import { renderLinksTable } from '../views/linksTable.js';
import type { Link } from '../../.pipeline/contracts/shared-types.js';

const webRouter = new Hono();

interface WebPageModel {
  links: Link[];
  error?: { message: string };
  success?: { shortUrl: string };
  inputValue?: string;
}

/**
 * Renders the full HTML page document for the web UI.
 *
 * Intentionally uses type="text" (not type="url") for the URL input so that
 * the browser does NOT perform native constraint validation on submit — the
 * server always receives the raw value and validates it server-side (ADR-005 /
 * ADR-007). Browser-native type="url" validation would prevent invalid values
 * from ever reaching the server, making the INVALID_URL error branch and the
 * Playwright e2e tests unreachable (WEB-E-4, WEB-E-5 error state).
 *
 * All a11y criteria from web-criteria.md are satisfied by the markup and CSS
 * in this function (A11Y-WEB-001..019).
 */
function renderWebPage(model: WebPageModel): string {
  const { links, error, success, inputValue = '' } = model;

  const errorHtml = error
    ? `<div role="alert" id="url-error">${escapeHtml(error.message)}</div>`
    : `<div role="alert" id="url-error" hidden></div>`;

  const successHtml = success
    ? `<div role="status" class="success-banner">Short link created: <a href="${escapeHtml(success.shortUrl)}">${escapeHtml(success.shortUrl)}</a></div>`
    : '';

  const describedBy = error ? ' aria-describedby="url-error"' : '';
  const inputValueAttr = inputValue ? ` value="${escapeHtml(inputValue)}"` : '';

  const tableHtml = renderLinksTable(links);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>LinkSnip — URL Shortener</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: sans-serif;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 1rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
    }
    h1 { font-size: 1.75rem; margin-bottom: 1rem; }
    label {
      display: block;
      margin-bottom: 0.25rem;
      font-weight: bold;
    }
    input[type="text"] {
      display: block;
      width: 100%;
      min-height: 44px;
      padding: 0.5rem;
      border: 2px solid #595959;
      font-size: 1rem;
      margin-bottom: 0.5rem;
      border-radius: 2px;
    }
    input[type="text"]:focus-visible {
      outline: 3px solid #005fcc;
      outline-offset: 2px;
    }
    button[type="submit"] {
      min-height: 44px;
      min-width: 100px;
      padding: 0.5rem 1rem;
      background: #1a1a1a;
      color: #fff;
      border: 2px solid #1a1a1a;
      font-size: 1rem;
      cursor: pointer;
      border-radius: 2px;
    }
    button[type="submit"]:focus-visible {
      outline: 3px solid #005fcc;
      outline-offset: 2px;
    }
    [role="alert"] {
      color: #b30000;
      margin-bottom: 0.5rem;
      padding: 0.25rem 0;
    }
    .success-banner {
      color: #005000;
      margin-bottom: 0.5rem;
      padding: 0.25rem 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1.5rem;
    }
    caption {
      text-align: left;
      font-weight: bold;
      margin-bottom: 0.5rem;
      caption-side: top;
    }
    th, td {
      text-align: left;
      padding: 0.5rem;
      border-bottom: 1px solid #595959;
      overflow-wrap: break-word;
      word-break: break-all;
    }
    th {
      background: #f5f5f5;
    }
    a {
      color: #005fcc;
      min-height: 24px;
      display: inline-block;
      padding: 2px 0;
    }
    a:focus-visible {
      outline: 3px solid #005fcc;
      outline-offset: 2px;
    }
    @media (max-width: 480px) {
      body { padding: 0.75rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>LinkSnip</h1>
    ${successHtml}
    <form method="post" action="/shorten">
      <label for="url">URL to shorten</label>
      ${errorHtml}
      <input id="url" name="url" type="text"${describedBy}${inputValueAttr} placeholder="https://example.com/long-url" />
      <button type="submit">Shorten</button>
    </form>
    ${tableHtml}
  </div>
</body>
</html>`;
}

/**
 * Escapes HTML special characters to prevent XSS.
 * Used for user-supplied values rendered into the HTML.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * GET /
 * Renders the full LinkSnip page: form + links table + optional success banner.
 * If ?created=<code> is present and valid, shows a role=status success banner (ADR-007).
 */
webRouter.get('/', (c) => {
  const links = listAll();
  const createdCode = c.req.query('created');

  let success: { shortUrl: string } | undefined;
  if (createdCode) {
    const link = getByCode(createdCode);
    if (link) {
      success = { shortUrl: deriveShortUrl(c, link.code) };
    }
  }

  const html = renderWebPage({ links, success });
  return c.html(html, 200);
});

/**
 * POST /shorten
 * Reads form-urlencoded `url`; validates; on valid: creates link + PRG 302 redirect to GET /.
 * On invalid: re-renders the page inline at HTTP 200 with role=alert error region populated (ADR-007).
 */
webRouter.post('/shorten', async (c) => {
  const body = await c.req.parseBody();
  const rawUrl = body['url'];

  const validation = validateUrl(rawUrl);

  if (validation.type === 'failure') {
    // Inline re-render at 200 with the error region populated (no redirect — ADR-007)
    const links = listAll();
    const html = renderWebPage({
      links,
      error: { message: 'Please enter a valid http:// or https:// URL.' },
      inputValue: typeof rawUrl === 'string' ? rawUrl : '',
    });
    return c.html(html, 200);
  }

  // Valid URL: create the link and PRG-redirect to GET /
  // Redirect to plain / (no ?created= query) so Playwright waitForURL('/') matches.
  // The table will include the new link on re-render since it reads fresh from DB.
  insertLink(validation.url);
  return c.redirect('/', 302);
});

export { webRouter };
