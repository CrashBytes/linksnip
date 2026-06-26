/**
 * WEB-E-3 (AC-13): Valid URL round-trip — new short link appears in table after PRG
 * WEB-E-4 (AC-14): Invalid URL — visible role=alert error, form+table still present
 *
 * The page and POST /shorten route are NOT wired yet (ui phase). These tests are
 * intentionally BLUE (failing). They will pass once the ui phase implements the routes.
 */
import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// WEB-E-3 — AC-13: Round-trip: valid URL submission → new link in table
// ---------------------------------------------------------------------------
test.describe('WEB-E-3 — AC-13: valid URL form round-trip', () => {
  test('submitting a valid URL adds a new row to the links table', async ({ page }) => {
    await page.goto('/');

    // Fill the URL input (accessible by label /url/i) and submit
    const urlInput = page.getByRole('textbox', { name: /url/i });
    await urlInput.fill('https://www.example.com/e2e-roundtrip');
    await page.getByRole('button', { name: /shorten/i }).click();

    // After PRG (POST /shorten → 302 → GET /), the page must be a 200 HTML page.
    // Wait for the navigation to settle.
    await page.waitForURL('/');

    // The links table must be visible
    const table = page.getByRole('table', { name: /links/i });
    await expect(table).toBeVisible();

    // A new row containing the submitted origin should appear
    await expect(table.locator('tbody tr')).not.toHaveCount(0);
  });

  test('no browser console errors after a valid URL submission', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');
    await page.getByRole('textbox', { name: /url/i }).fill('https://www.example.com/no-errors');
    await page.getByRole('button', { name: /shorten/i }).click();
    await page.waitForURL('/');

    expect(consoleErrors).toHaveLength(0);
    expect(pageErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// WEB-E-4 — AC-14: Invalid URL → role=alert error visible, form+table still present
// ---------------------------------------------------------------------------
test.describe('WEB-E-4 — AC-14: invalid URL shows error message', () => {
  test('submitting an invalid URL shows a visible role=alert error', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('textbox', { name: /url/i }).fill('not-a-url');
    await page.getByRole('button', { name: /shorten/i }).click();

    // Server re-renders the page with an alert; no redirect (failure is inline, 200)
    // The role=alert must be visible and non-empty (ADR-007)
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    const alertText = await alert.textContent();
    expect((alertText ?? '').trim().length).toBeGreaterThan(0);
  });

  test('error page still shows the URL form after invalid submission', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('textbox', { name: /url/i }).fill('not-a-url');
    await page.getByRole('button', { name: /shorten/i }).click();

    // The form must remain (not a hard redirect, not a blank page)
    await expect(page.getByRole('textbox', { name: /url/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /shorten/i })).toBeVisible();
  });

  test('error page still shows the links table after invalid submission', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('textbox', { name: /url/i }).fill('not-a-url');
    await page.getByRole('button', { name: /shorten/i }).click();

    // The table must still be present — failure not silently swallowed (AC-14)
    await expect(page.getByRole('table', { name: /links/i })).toBeVisible();
  });
});
