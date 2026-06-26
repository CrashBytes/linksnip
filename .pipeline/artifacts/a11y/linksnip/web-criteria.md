<!--
artifacts/a11y/linksnip/web-criteria.md
generated-by: web-a11y
run-id: RUN-20260626-135245-e0ud
story: linksnip
domain: web
standards: WCAG 2.2 AA · Section 508 · EN 301 549
spec-ref: AC-11, AC-12, AC-14, AC-15, NFR Accessibility/Compatibility
frozen: false  (criteria; never edit source)
-->

# Web accessibility acceptance criteria — LinkSnip `/` page

## Scope

Single server-rendered HTML page at `GET /` served by Hono. The page contains:

1. A labeled URL-input form (AC-11).
2. A semantic links-and-click-count table (AC-12).
3. A visible error area shown on INVALID_URL submission (AC-14).

The page MUST function with JavaScript disabled (NFR Compatibility). No a11y
criterion may depend on client-side JS execution.

Viewports tested: mobile 390x844 · tablet 768x1024 · desktop 1440x900.

---

## Criteria table

| id | wcag_sc | level | requirement | verification |
|----|---------|-------|-------------|--------------|
| A11Y-WEB-001 | 3.1.1 | A | The `<html>` element MUST carry a `lang` attribute with a valid BCP 47 language tag (e.g. `lang="en"`). | axe-core rule `html-has-lang` + `html-lang-valid` pass on the rendered page. |
| A11Y-WEB-002 | 2.4.2 | A | The `<head>` MUST contain a non-empty `<title>` element describing the page (e.g. "LinkSnip — URL Shortener"). | axe-core rule `document-title` passes; `document.title` is non-empty in Playwright. |
| A11Y-WEB-003 | 1.3.1 | A | The page MUST have exactly one `<h1>`. Subsequent headings MUST not skip levels (h1 → h2 → h3, never h1 → h3). | axe-core rule `heading-order` passes; Playwright assertion `page.locator('h1')` has count 1. |
| A11Y-WEB-004 | 1.3.1 | A | The URL `<input>` MUST be programmatically associated with its visible `<label>` via matching `for`/`id` pair or by the label wrapping the input. No placeholder-only label is acceptable. | axe-core rule `label` passes; `input.labels` property returns the label element in Playwright; AC-11 assertion. |
| A11Y-WEB-005 | 1.3.1 | A | The URL input MUST carry `name` and either `type="url"` or `type="text"`. If `type="url"`, browser-native validation is acceptable but MUST NOT be the sole error surface (server-side error path also required by AC-14). | Playwright: `input[name]` exists and `input.getAttribute('type')` is "url" or "text". |
| A11Y-WEB-006 | 1.3.1 | A | The submit button MUST have an accessible name derived from visible text content or an `aria-label`. An icon-only button with no text is not permitted unless paired with `aria-label`. | axe-core rule `button-name` passes; computed accessible name is non-empty via `getByRole('button', { name: /shorten|submit/i })` in Playwright. |
| A11Y-WEB-007 | 3.3.1 | A | When the form is submitted with an invalid URL, an error message MUST be presented to the user. The message MUST be programmatically determinable — either via `role="alert"` on the error container, or via `aria-describedby` linking the input to the error text, or via `aria-live="assertive"`. The error area MUST NOT remain hidden or empty after a failed submission (AC-14). | axe-core `aria-required-attr` + `aria-valid-attr-value` pass; Playwright: after submitting "not-a-url", `[role="alert"]` or `[aria-live]` element is visible and contains non-empty text. |
| A11Y-WEB-008 | 3.3.2 | A | A visible label or instruction MUST be present before or adjacent to the URL input that indicates the expected format (e.g. "Enter a URL to shorten" or "URL"). The label MUST remain visible at all times — it MUST NOT disappear on focus or input. | Playwright: `label` associated with the input is visible (`toBeVisible`) before, during, and after typing into the field; axe-core `label` rule passes. |
| A11Y-WEB-009 | 1.3.1 | A | The links table MUST use native `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>` (with `scope="col"` on column headers), and `<td>` elements. No `div`-grid substitutes. | axe-core rule `td-headers-attr` and `th-has-data-cells` pass; Playwright: `table thead th[scope="col"]` exists for each column header. AC-12 assertion. |
| A11Y-WEB-010 | 1.3.1 | A | The links table MUST have a programmatic accessible name — either a `<caption>` child element or an `aria-label` / `aria-labelledby` attribute on `<table>`. | axe-core rule `table-duplicate-name` passes; Playwright: `table` element has accessible name via `getByRole('table', { name: /links/i })` or `caption` text is non-empty. |
| A11Y-WEB-011 | 1.4.3 | AA | All body text (form label, button text, table header text, table cell text, error message text, page headings) MUST have a contrast ratio of at least 4.5:1 against its background. Text that meets the "large text" definition (≥ 18 pt normal or ≥ 14 pt bold) requires at least 3:1. | axe-core rule `color-contrast` passes on all rendered states (default, error-shown) at all three viewports. Design token `color.surface.fg` (#000000 on #ffffff = 21:1) satisfies this by default; implementors MUST NOT override with a failing pair. |
| A11Y-WEB-012 | 1.4.11 | AA | Non-text UI components (input border, submit button border/background, focus ring, error icon if present) MUST have a contrast ratio of at least 3:1 against adjacent colors. | axe-core rule `color-contrast-enhanced` (non-text) passes; manual spot-check: input border color vs. page background ≥ 3:1 in browser DevTools. |
| A11Y-WEB-013 | 2.1.1 | A | All interactive controls (URL input, submit button, any links in the table) MUST be reachable and operable using keyboard alone (Tab to focus, Enter or Space to activate buttons, Enter to submit the form). No mouse-only interactions. JS-disabled path MUST also be fully keyboard-operable (server-rendered `<form method="post">`). | Playwright keyboard-only test: `page.keyboard.press('Tab')` cycles to every interactive element; `page.keyboard.press('Enter')` on the submit button submits the form. axe-core rule `interactive-supports-focus` passes. |
| A11Y-WEB-014 | 2.4.3 | A | The Tab focus order MUST be logical and match the visual/reading order: (1) any skip-link if present, (2) page heading, (3) form label + input, (4) submit button, (5) table links in document order. No element that appears visually earlier must appear later in focus order (no `tabindex` values > 0). | Playwright: record focus sequence via repeated `Tab`; assert order matches (input before button, button before table links). axe-core rule `tabindex` passes (no positive tabindex). |
| A11Y-WEB-015 | 2.4.7 | AA | Every focusable element (input, button, table links) MUST display a clearly visible focus indicator when focused via keyboard. The focus ring MUST NOT be suppressed by `outline: none` or `outline: 0` without a styled replacement. Design token `a11y.focus-ring-width` (2px) MUST be applied or exceeded. | Playwright: `page.keyboard.press('Tab')` to focus the input; computed style `outline` or `box-shadow` is non-zero/non-none. axe-core rule `focus-visible` (if available) passes; manual check at all three viewports. |
| A11Y-WEB-016 | 2.5.8 | AA | All interactive controls (URL input, submit button, table row links) MUST have a minimum target size of 24 × 24 CSS pixels. The design token `a11y.min-touch-web` is 24px; this is the floor. | Playwright: `element.boundingBox()` for each interactive control has `.width >= 24` and `.height >= 24`. Checked at mobile viewport (390x844) where targets are most constrained. |
| A11Y-WEB-017 | 1.4.10 | AA | The page content MUST reflow to a single column without horizontal scrolling when the viewport is set to 320 CSS pixels wide (equivalent to 400% zoom on a 1280px screen). No content or functionality is lost. The form, table, and error area MUST each remain usable. | Playwright at width 320px: `page.evaluate(() => document.documentElement.scrollWidth)` equals `document.documentElement.clientWidth` (no horizontal overflow); form and table are visible. |
| A11Y-WEB-018 | 4.1.2 | A | Every form control MUST expose its accessible name, role, and current value to assistive technology. Native HTML elements (`<input>`, `<button>`, `<table>`) satisfy role automatically; custom widgets are not permitted unless they carry full ARIA roles + names. | axe-core rules `aria-allowed-role`, `aria-required-attr`, `aria-valid-attr-value` all pass. Playwright `getByRole('textbox', { name: /url/i })` and `getByRole('button', { name: /.+/ })` each resolve to exactly one element. |
| A11Y-WEB-019 | 4.1.3 | AA | Status messages (e.g. "Short link created: https://…" after a successful form submission, or the error area text on failure) MUST be communicated to assistive technology without receiving focus. Use `role="status"` for non-urgent confirmations and `role="alert"` for error notifications. | Playwright: after PRG redirect, any success banner has `role="status"` or `aria-live="polite"`; after invalid submission, error container has `role="alert"` or `aria-live="assertive"`. axe-core `aria-live-region-content` passes. |

---

## Component coverage map

| Component | Criteria covered |
|-----------|-----------------|
| `<html>` / document head | A11Y-WEB-001, A11Y-WEB-002 |
| Page headings | A11Y-WEB-003 |
| URL input + label | A11Y-WEB-004, A11Y-WEB-005, A11Y-WEB-008, A11Y-WEB-013, A11Y-WEB-015, A11Y-WEB-016, A11Y-WEB-018 |
| Submit button | A11Y-WEB-006, A11Y-WEB-013, A11Y-WEB-015, A11Y-WEB-016, A11Y-WEB-018 |
| Error message area | A11Y-WEB-007, A11Y-WEB-019 |
| Links table | A11Y-WEB-009, A11Y-WEB-010, A11Y-WEB-013, A11Y-WEB-016 |
| Full page | A11Y-WEB-011, A11Y-WEB-012, A11Y-WEB-014, A11Y-WEB-017 |

---

## No-JS constraint note

All criteria above MUST be satisfied by the server-rendered HTML alone, with
JavaScript disabled in the browser. Criteria that reference `role="alert"` or
`aria-live` regions MUST be present in the initial HTML markup (not injected by JS)
when the page is rendered in the error state (i.e. the PRG redirect re-renders `/`
with error markup in the HTML). JS progressive enhancement may add additional live
regions but MUST NOT be the only mechanism.

---

## Block / warn / allow assessment

| id | severity | rationale |
|----|----------|-----------|
| A11Y-WEB-001 | allow | Standard `lang` attribute; trivial to implement in Hono template. |
| A11Y-WEB-002 | allow | Standard `<title>`; trivial. |
| A11Y-WEB-003 | allow | Single h1 is natural for a one-page app. |
| A11Y-WEB-004 | allow | AC-11 already requires `for`/`id` association. |
| A11Y-WEB-005 | allow | Native `<input type="url">` satisfies this automatically. |
| A11Y-WEB-006 | allow | A text-labelled `<button>` satisfies this automatically. |
| A11Y-WEB-007 | warn | The PRG pattern (no JS) means the error must be baked into the re-rendered HTML. The implementor MUST ensure the error container is present with `role="alert"` in the HTML emitted by the error branch of `GET /`, not toggled by JS. |
| A11Y-WEB-008 | allow | Visible persistent label is standard practice. |
| A11Y-WEB-009 | allow | AC-12 already requires `<thead>`/`<tbody>`/`<th>`; adding `scope="col"` is the only addition. |
| A11Y-WEB-010 | allow | A `<caption>` element adds one line to the template. |
| A11Y-WEB-011 | allow | Default design tokens (#000000 on #ffffff = 21:1) are compliant; risk only if tokens are overridden with low-contrast values. |
| A11Y-WEB-012 | warn | Input border and button background are not defined by current (placeholder) design tokens. Implementor must choose a border color with ≥ 3:1 contrast against the page background (#ffffff). |
| A11Y-WEB-013 | allow | Plain HTML `<form>` is fully keyboard-operable by default. |
| A11Y-WEB-014 | allow | No positive `tabindex` values; reading order follows DOM order. |
| A11Y-WEB-015 | warn | Browsers suppress `outline` in some CSS resets. Implementor MUST audit and restore or replace the focus ring. Design token `a11y.focus-ring-width: 2px` must be applied. |
| A11Y-WEB-016 | warn | Default browser `<input>` and `<button>` heights can fall below 24px without explicit sizing. Implementor must verify with `element.boundingBox()` at the 390px mobile viewport. |
| A11Y-WEB-017 | allow | Server-rendered single-column layouts naturally reflow; risk only if the table has many fixed-width columns. |
| A11Y-WEB-018 | allow | Native HTML elements expose name/role/value without extra ARIA. |
| A11Y-WEB-019 | warn | Success banner after PRG redirect must be marked with `role="status"` to communicate to AT without disruptive focus change. Easy to forget. |

Overall block recommendation: **allow** — no criterion is architecturally
unachievable. Four criteria carry a **warn** severity requiring specific
implementation attention (A11Y-WEB-007, A11Y-WEB-012, A11Y-WEB-015,
A11Y-WEB-016, A11Y-WEB-019).

---

## Automated gate

The `require_a11y_clean: true` gate in `config.yml` maps to axe-core (or
equivalent) reporting zero violations on the rendered page. The following axe-core
rules are directly referenced by the criteria above and MUST all pass:

`html-has-lang`, `html-lang-valid`, `document-title`, `heading-order`, `label`,
`button-name`, `aria-required-attr`, `aria-valid-attr-value`, `aria-allowed-role`,
`aria-live-region-content`, `color-contrast`, `color-contrast-enhanced`,
`interactive-supports-focus`, `tabindex`, `td-headers-attr`, `th-has-data-cells`,
`table-duplicate-name`, `focus-visible`.

Axe-core MUST be run against the page in at minimum two states:
1. Default state — empty table, no error.
2. Error state — page rendered after an INVALID_URL submission (error area visible).

And at all three configured viewports (mobile 390x844, tablet 768x1024, desktop 1440x900).

---

## VPAT note

`accessibility.vpat: true` is set in `config.yml`. The a11y-tester MUST produce a
VPAT (Voluntary Product Accessibility Template) covering WCAG 2.2 AA, Section 508
(which references WCAG 2.0 AA + additional requirements), and EN 301 549 (which
references WCAG 2.1 AA + additional requirements). The criteria above cover WCAG
2.2 AA; Section 508 and EN 301 549 add no requirements beyond WCAG 2.2 AA for a
single server-rendered HTML page with no video, audio, or time-based media.
