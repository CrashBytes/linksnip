import type { Link } from '../../.pipeline/contracts/shared-types.js';
import { renderLinksTable } from './linksTable.js';

export interface FormModel {
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
 * Renders the URL shortening form with optional error/success regions.
 * The error region uses role="alert" for accessibility (A11Y-WEB-007).
 */
export function renderForm(model: FormModel): string {
  const errorHtml = model.error
    ? `<div role="alert">${model.error.message}</div>`
    : `<div role="alert"></div>`;

  const successHtml = model.success
    ? `<div role="status">Shortened: <a href="${model.success.shortUrl}">${model.success.shortUrl}</a></div>`
    : '';

  const tableHtml = renderLinksTable(model.links);

  return `<form method="post" action="/shorten">
  <label for="url">URL to shorten</label>
  <input id="url" name="url" type="url" required />
  <button type="submit">Shorten</button>
  ${errorHtml}
  ${successHtml}
</form>
${tableHtml}`;
}
