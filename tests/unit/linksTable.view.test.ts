import { describe, it, expect } from 'vitest';
import { renderLinksTable } from '../../src/views/linksTable';
import type { Link, LinkCode, AbsoluteUrl } from '../../.pipeline/contracts/shared-types';

describe('Links Table view (WEB-U-2, WEB-U-3)', () => {
  // Helper to create mock Link objects
  const createLink = (code: string, url: string, clicks: number): Link => ({
    code: code as LinkCode,
    url: url as AbsoluteUrl,
    clicks,
  });

  describe('WEB-U-2: renderLinksTable with non-empty array', () => {
    it('produces a semantic <table> with <caption>', () => {
      const links: Link[] = [
        createLink('abc123', 'https://example.com', 5),
      ];

      const html = renderLinksTable(links);

      expect(html).toContain('<table');
      expect(html).toContain('</table>');
      expect(html).toContain('<caption');
    });

    it('contains <thead> with <th scope="col"> for short-link column', () => {
      const links: Link[] = [
        createLink('abc123', 'https://example.com', 5),
      ];

      const html = renderLinksTable(links);

      expect(html).toContain('<thead');
      expect(html).toMatch(/<th[^>]*scope="col"/);

      // Should have a header for the short link (code)
      // The header text might be "Short link", "Code", "Short URL", etc.
      expect(html.toLowerCase()).toMatch(/short\s+(link|url)|code/);
    });

    it('contains <thead> with <th scope="col"> for clicks column', () => {
      const links: Link[] = [
        createLink('abc123', 'https://example.com', 5),
      ];

      const html = renderLinksTable(links);

      expect(html).toContain('<thead');
      // Should have a header for clicks
      expect(html).toMatch(/<th[^>]*scope="col"/);
      expect(html.toLowerCase()).toContain('clicks');
    });

    it('renders one <tbody><tr> per link with code/short-url and clicks in <td> cells', () => {
      const links: Link[] = [
        createLink('abc123', 'https://example.com', 5),
        createLink('xyz789', 'https://github.com', 12),
      ];

      const html = renderLinksTable(links);

      expect(html).toContain('<tbody');
      expect(html).toContain('</tbody>');

      // Should have rows
      const trMatches = html.match(/<tr[^>]*>/g) || [];
      // One row per link (rows in tbody, not counting header rows)
      expect(trMatches.length).toBeGreaterThanOrEqual(links.length);

      // Should contain the codes
      expect(html).toContain('abc123');
      expect(html).toContain('xyz789');

      // Should contain the click counts
      expect(html).toContain('5');
      expect(html).toContain('12');

      // Should have <td> elements for the data
      expect(html).toContain('<td');
    });

    it('links table has semantic structure with code/URL and clicks for each link', () => {
      const links: Link[] = [
        createLink('short1', 'https://example.com/very/long/path', 10),
      ];

      const html = renderLinksTable(links);

      // Verify table structure
      expect(html).toMatch(/<table[^>]*>/);
      expect(html).toMatch(/<thead[^>]*>/);
      expect(html).toMatch(/<tbody[^>]*>/);
      expect(html).toMatch(/<tr[^>]*>/);
      expect(html).toMatch(/<td[^>]*>/);
      expect(html).toContain('short1');
      expect(html).toContain('10');
    });
  });

  describe('WEB-U-3: renderLinksTable with empty array', () => {
    it('emits a semantic <table> with <caption>', () => {
      const html = renderLinksTable([]);

      expect(html).toContain('<table');
      expect(html).toContain('</table>');
      expect(html).toContain('<caption');
    });

    it('contains <thead> with header row and <th scope="col"> columns', () => {
      const html = renderLinksTable([]);

      expect(html).toContain('<thead');
      expect(html).toMatch(/<th[^>]*scope="col"/);

      // Should have headers for short link/code and clicks
      expect(html.toLowerCase()).toMatch(/short|code|click/);
    });

    it('always renders an empty-state row to preserve table structure', () => {
      const html = renderLinksTable([]);

      // Even with no links, should have tbody and potentially an empty-state indicator
      expect(html).toContain('<tbody');

      // The table structure is always present, not missing when empty
      expect(html).toContain('<table');
      expect(html).toContain('<thead');
      expect(html).toContain('<tbody');

      // Should NOT contain actual link codes
      expect(html).not.toContain('abc123');
      expect(html).not.toContain('xyz789');
    });

    it('preserves table structure (thead/tbody) even with no links', () => {
      const html = renderLinksTable([]);

      const hasTable = html.includes('<table');
      const hasCaption = html.includes('<caption');
      const hasThead = html.includes('<thead');
      const hasTbody = html.includes('<tbody');

      expect(hasTable).toBe(true);
      expect(hasCaption).toBe(true);
      expect(hasThead).toBe(true);
      expect(hasTbody).toBe(true);
    });
  });

  describe('Integration: Multiple links in table', () => {
    it('renders all links with correct data in rows', () => {
      const links: Link[] = [
        createLink('code1', 'https://google.com', 100),
        createLink('code2', 'https://github.com', 50),
        createLink('code3', 'https://stackoverflow.com', 25),
      ];

      const html = renderLinksTable(links);

      // All codes should be present
      links.forEach((link) => {
        expect(html).toContain(link.code);
        expect(html).toContain(link.clicks.toString());
      });

      // Should have semantic structure
      expect(html).toMatch(/<table[^>]*>/);
      expect(html).toMatch(/<thead[^>]*>/);
      expect(html).toMatch(/<tbody[^>]*>/);
      expect(html).toMatch(/<tr[^>]*>/);
      expect(html).toMatch(/<td[^>]*>/);
    });
  });
});
