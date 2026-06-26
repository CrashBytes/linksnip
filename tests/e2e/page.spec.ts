/**
 * WEB-E-1 (AC-11): GET / shows a labeled URL form
 * WEB-E-2 (AC-12): GET / shows a semantic links table with pre-seeded rows
 *
 * The page is NOT wired yet (ui phase). These tests are intentionally BLUE
 * (failing). They will pass once the ui phase implements GET /.
 */
import { test, expect, type APIRequestContext } from '@playwright/test';

/** Seed a link via the JSON API and return its code. */
async function seedLink(request: APIRequestContext, url: string): Promise<string> {
  const res = await request.post('/api/links', {
    data: { url },
    headers: { 'Content-Type': 'application/json' },
  });
  const body = await res.json() as { code: string; shortUrl: string };
  return body.code;
}

// ---------------------------------------------------------------------------
// WEB-E-1 — AC-11: Labeled URL form
// ---------------------------------------------------------------------------
test.describe('WEB-E-1 — AC-11: labeled URL form at GET /', () => {
  test('GET / returns 200', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('page shows a text input associated with a URL label', async ({ page }) => {
    await page.goto('/');
    // ADR-007: label text is "URL to shorten"; selects by accessible name /url/i
    await expect(page.getByRole('textbox', { name: /url/i })).toBeVisible();
  });

  test('page shows a Shorten submit button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /shorten/i })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// WEB-E-2 — AC-12: Semantic links table with pre-seeded rows
// ---------------------------------------------------------------------------
test.describe('WEB-E-2 — AC-12: semantic links table at GET /', () => {
  test.beforeEach(async ({ request }) => {
    // Pre-seed two links so the table is non-empty
    await seedLink(request, 'https://example.com/seed-one');
    await seedLink(request, 'https://example.org/seed-two');
  });

  test('table is present and has an accessible name matching /links/i', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('table', { name: /links/i })).toBeVisible();
  });

  test('table has a column header for the short link', async ({ page }) => {
    await page.goto('/');
    // ADR-007: <th scope="col"> for "Short link" column
    const table = page.getByRole('table', { name: /links/i });
    await expect(table.getByRole('columnheader', { name: /short link/i })).toBeVisible();
  });

  test('table has a column header for clicks', async ({ page }) => {
    await page.goto('/');
    const table = page.getByRole('table', { name: /links/i });
    await expect(table.getByRole('columnheader', { name: /clicks/i })).toBeVisible();
  });

  test('pre-seeded links appear as table rows', async ({ page, request }) => {
    const code = await seedLink(request, 'https://playwright.dev/seeded');
    await page.goto('/');
    const table = page.getByRole('table', { name: /links/i });
    // At least one row in tbody
    const rows = table.locator('tbody tr');
    await expect(rows).not.toHaveCount(0);
    // The seeded code appears somewhere in the table
    await expect(table.getByRole('cell', { name: new RegExp(code) })).toBeVisible();
  });
});
