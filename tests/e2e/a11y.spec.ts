/**
 * WEB-E-5 (AC-15): axe-core finds zero WCAG 2.2 AA violations on GET /
 *   - Default state (empty table, no error)
 *   - Error state (after invalid URL submission, role=alert visible)
 * Runs across all three viewport projects: mobile 390x844, tablet 768x1024,
 * desktop 1440x900.
 * Also asserts no horizontal scroll at 320px width (reflow — A11Y-WEB-017).
 *
 * The page is NOT wired yet (ui phase). These tests are intentionally BLUE
 * (failing). They will pass once the ui phase implements GET / and POST /shorten.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ---------------------------------------------------------------------------
// WEB-E-5 — AC-15: axe-core WCAG 2.2 AA — default state
// ---------------------------------------------------------------------------
test.describe('WEB-E-5 — AC-15: axe-core WCAG 2.2 AA — default state', () => {
  test('GET / has zero WCAG 2.2 AA violations in default state', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(
      results.violations,
      `axe violations:\n${results.violations.map((v) => `  [${v.id}] ${v.description}`).join('\n')}`,
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// WEB-E-5 — AC-15: axe-core WCAG 2.2 AA — error state
// ---------------------------------------------------------------------------
test.describe('WEB-E-5 — AC-15: axe-core WCAG 2.2 AA — error state (role=alert)', () => {
  test('POST /shorten with invalid URL produces page with zero WCAG 2.2 AA violations', async ({
    page,
  }) => {
    await page.goto('/');

    // Submit an invalid URL to trigger the error branch (ADR-007: inline re-render, 200)
    await page.getByRole('textbox', { name: /url/i }).fill('not-a-url');
    await page.getByRole('button', { name: /shorten/i }).click();

    // The page should now render with role=alert visible
    await expect(page.locator('[role="alert"]')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(
      results.violations,
      `axe violations in error state:\n${results.violations.map((v) => `  [${v.id}] ${v.description}`).join('\n')}`,
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// WEB-E-5 — AC-15 / A11Y-WEB-017: no horizontal scroll at 320px (reflow)
// ---------------------------------------------------------------------------
test.describe('WEB-E-5 — AC-15 / A11Y-WEB-017: no horizontal scroll at 320px', () => {
  test('page does not overflow horizontally at 320px width', async ({ page }) => {
    // Set viewport to the 320px reflow width (1.4.10 / A11Y-WEB-017)
    await page.setViewportSize({ width: 320, height: 568 });
    const response = await page.goto('/');

    // First assert the page loads (200) — otherwise we'd be testing a 404 page,
    // not the app. This also makes the test fail (blue) until GET / is wired.
    expect(response?.status()).toBe(200);

    // The app page must contain the form, confirming we're testing the real page
    await expect(page.getByRole('textbox', { name: /url/i })).toBeVisible();

    const overflows = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      return { scrollWidth, clientWidth, overflows: scrollWidth > clientWidth };
    });

    expect(
      overflows.overflows,
      `Horizontal overflow at 320px: scrollWidth=${overflows.scrollWidth} clientWidth=${overflows.clientWidth}`,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// WEB-E-5 — Responsive behavior: primary interactive targets meet ≥44px
// ---------------------------------------------------------------------------
test.describe('WEB-E-5 — A11Y-WEB-016: touch targets ≥44px on mobile viewport', () => {
  test('URL input height is at least 44px at mobile viewport', async ({ page }) => {
    // This test runs under the "mobile" project (390x844). The page must style
    // input to ≥44px per ADR-007 "≥ 44×44 CSS px" for mobile touch targets.
    await page.goto('/');

    const inputBox = await page.getByRole('textbox', { name: /url/i }).boundingBox();
    expect(inputBox).not.toBeNull();
    expect(inputBox!.height).toBeGreaterThanOrEqual(44);
  });

  test('Shorten button height is at least 44px at mobile viewport', async ({ page }) => {
    await page.goto('/');

    const buttonBox = await page.getByRole('button', { name: /shorten/i }).boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(buttonBox!.height).toBeGreaterThanOrEqual(44);
  });
});
