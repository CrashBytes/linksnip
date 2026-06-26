import type { Link } from '../../.pipeline/contracts/shared-types.js';

/**
 * Renders a semantic HTML table for the list of links.
 * Always emits table/thead/tbody structure even when links is empty (WEB-U-3).
 */
export function renderLinksTable(links: Link[]): string {
  const headerRow = `
    <tr>
      <th scope="col">Short link</th>
      <th scope="col">Original URL</th>
      <th scope="col">Clicks</th>
    </tr>`;

  let bodyRows: string;
  if (links.length === 0) {
    bodyRows = `<tr><td colspan="3">No links yet</td></tr>`;
  } else {
    bodyRows = links
      .map(
        (link) =>
          `<tr>
            <td><a href="/${link.code}">${link.code}</a></td>
            <td>${link.url}</td>
            <td>${link.clicks}</td>
          </tr>`,
      )
      .join('');
  }

  return `<table>
  <caption>Shortened links</caption>
  <thead>${headerRow}</thead>
  <tbody>${bodyRows}</tbody>
</table>`;
}
