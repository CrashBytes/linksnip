import { describe, it, expect } from 'vitest';
import { renderForm } from '../../src/views/form';
import { renderPage } from '../../src/views/page';
import type { Link } from '../../.pipeline/contracts/shared-types';

describe('Form view (WEB-U-1, WEB-U-4)', () => {
  describe('WEB-U-1: renderForm output structure', () => {
    it('contains a <form method="post" action="/shorten">', () => {
      const html = renderForm({ links: [] });

      expect(html).toContain('method="post"');
      expect(html).toContain('action="/shorten"');
    });

    it('contains a <label for="url">', () => {
      const html = renderForm({ links: [] });

      expect(html).toMatch(/<label[^>]*for="url"/);
    });

    it('contains an <input id="url" name="url"> whose id matches the label for', () => {
      const html = renderForm({ links: [] });

      // Check for the input element
      expect(html).toMatch(/<input[^>]*id="url"/);
      expect(html).toMatch(/<input[^>]*name="url"/);

      // Verify programmatic association: label has for="url" and input has id="url"
      const labelMatch = html.match(/<label[^>]*for="([^"]+)"/);
      const inputIdMatch = html.match(/<input[^>]*id="([^"]+)"/);

      expect(labelMatch).toBeTruthy();
      expect(inputIdMatch).toBeTruthy();
      expect(labelMatch?.[1]).toBe('url');
      expect(inputIdMatch?.[1]).toBe('url');
    });

    it('contains a submit <button> with non-empty text', () => {
      const html = renderForm({ links: [] });

      // Check for button element with type="submit"
      expect(html).toMatch(/<button[^>]*type="submit"[^>]*>/);

      // Check that the button has non-empty text content
      const buttonMatch = html.match(/<button[^>]*type="submit"[^>]*>([^<]+)<\/button>/);
      expect(buttonMatch).toBeTruthy();
      expect(buttonMatch?.[1]).toBeTruthy();
      expect((buttonMatch?.[1] || '').trim().length).toBeGreaterThan(0);
    });
  });

  describe('WEB-U-4: Error display in renderForm', () => {
    it('emits a non-empty error container with role="alert" when error is present', () => {
      const model = {
        links: [] as Link[],
        error: {
          code: 'INVALID_URL' as const,
          message: 'Please enter a valid URL',
        },
      };

      const html = renderForm(model);

      // Check for role="alert"
      expect(html).toMatch(/role="alert"/);

      // Check that the error message is contained in the alert
      expect(html).toContain('Please enter a valid URL');
    });

    it('does not emit an error alert when error is absent', () => {
      const model = {
        links: [] as Link[],
      };

      const html = renderForm(model);

      // When there is no error, the alert should not be present or should be empty
      // Check that the error alert container is either absent or empty
      const alertMatch = html.match(/role="alert"[^>]*>([^<]*)</);

      // Either no alert exists, or if it exists, it should be empty (no content)
      if (alertMatch) {
        // If alert exists, its content should be empty or whitespace-only
        expect((alertMatch[1] || '').trim().length).toBe(0);
      }
    });
  });

  describe('WEB-U-4: Error display in renderPage', () => {
    it('renderPage with error emits a non-empty error container with role="alert"', () => {
      const model = {
        links: [] as Link[],
        error: {
          code: 'INVALID_URL' as const,
          message: 'The URL you entered is not valid. Please use http:// or https://',
        },
      };

      const html = renderPage(model);

      // Check for role="alert"
      expect(html).toMatch(/role="alert"/);

      // Check that the error message is in the alert
      expect(html).toContain('The URL you entered is not valid');
    });

    it('renderPage without error has no populated alert (error region empty/absent)', () => {
      const model = {
        links: [] as Link[],
      };

      const html = renderPage(model);

      // The alert container should be empty or absent when no error
      const alertMatch = html.match(/role="alert"[^>]*>([^<]*)</);

      if (alertMatch) {
        // If alert exists, its content should be empty
        expect((alertMatch[1] || '').trim().length).toBe(0);
      }
    });
  });
});
