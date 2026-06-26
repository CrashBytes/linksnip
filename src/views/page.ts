import type { Link } from '../../.pipeline/contracts/shared-types.js';
import { renderForm } from './form.js';

export interface PageModel {
  links: Link[];
  error?: {
    code: 'INVALID_URL';
    message: string;
  };
  success?: {
    shortUrl: string;
  };
}

/**
 * Renders the full HTML page document for LinkSnip.
 * Composes the form and links table via renderForm.
 */
export function renderPage(model: PageModel): string {
  const formHtml = renderForm(model);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>LinkSnip — URL Shortener</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: sans-serif; color: #000; background: #fff; margin: 0; padding: 1rem; }
    .container { max-width: 800px; margin: 0 auto; width: 100%; }
    h1 { font-size: 1.75rem; margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.25rem; font-weight: bold; }
    input[type="url"] { display: block; width: 100%; min-height: 44px; padding: 0.5rem; border: 2px solid #595959; font-size: 1rem; margin-bottom: 0.5rem; }
    button[type="submit"] { min-height: 44px; min-width: 100px; padding: 0.5rem 1rem; background: #1a1a1a; color: #fff; border: none; font-size: 1rem; cursor: pointer; }
    button[type="submit"]:focus-visible { outline: 3px solid #005fcc; outline-offset: 2px; }
    [role="alert"] { color: #c00; margin-bottom: 0.5rem; }
    [role="status"] { color: #080; margin-bottom: 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
    caption { text-align: left; font-weight: bold; margin-bottom: 0.5rem; }
    th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #ccc; overflow-wrap: break-word; }
    th { background: #f5f5f5; }
    a { color: #005fcc; }
    a:focus-visible { outline: 3px solid #005fcc; outline-offset: 2px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>LinkSnip</h1>
    ${formHtml}
  </div>
</body>
</html>`;
}
