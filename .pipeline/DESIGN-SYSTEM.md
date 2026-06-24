---
schema_version: 1
design_system_id: 00000000000000000000000000
program_id: 00000000000000000000000000
target_platforms: [web]            # subset of: web, ios, android, visionos, macos
wcag_target: AA                    # AA | AAA
generated: ""
status: draft                      # draft | ready (frozen at end of design_system phase)
---

# Design System

Filled by the `design-system-architect` agent during `phase: design_system`
for greenfield programs. Read-only after `status: ready`. Per-story tech-leads
consume the tokens; they never edit them.

## 1. Brand foundation

### Primary palette

| Name | Hex | OKLCH | Used for |
|---|---|---|---|
| - | - | - | - |

### Semantic colors

| Role | Light hex | Dark hex | Contrast vs surface |
|---|---|---|---|
| success | - | - | - |
| warning | - | - | - |
| error | - | - | - |
| info | - | - | - |

### AA-validated color pairs

> Pairs explicitly cleared for use as text-on-background. Anything not on
> this list is decorative-only.

| Foreground | Background | Ratio | Tier |
|---|---|---|---|
| - | - | - | AA |

## 2. Typography

| Token | Family stack | Size | Line height | Weight |
|---|---|---|---|---|
| - | - | - | - | - |

## 3. Spacing & radius

> 4-px or 8-px base scale. Token names like `space-1 = 4px`, `space-2 = 8px`, etc.

## 4. Iconography

> Chosen icon set + size scale.

## 5. Motion

| Token | Duration | Easing | Reduced-motion alt |
|---|---|---|---|
| - | - | - | - |

## 6. Component inventory

> One row per component implied by the roadmap.

| Component | Variants | States | A11y behavior |
|---|---|---|---|
| - | - | - | - |

## 7. Layout primitives

| Token | Web | iOS | Android | visionOS |
|---|---|---|---|---|
| breakpoint-sm | 640px | – | – | – |
| safe-area-top | – | top inset | top inset | top safe area |

## 8. Interaction patterns

> Focus / hover / active / disabled / loading / error / empty.

## 9. Accessibility tokens

| Token | Value | Notes |
|---|---|---|
| focus-ring-width | 2px | – |
| focus-ring-color | <token> | – |
| min-touch-web | 24px (AA) | – |
| min-touch-ios | 44pt | – |
| min-touch-android | 48dp | – |

## 10. Identifier conventions

> Naming convention so e2e flows can target elements consistently.

```
<surface>.<component>.<element>

Examples:
  login.form.email-input
  dashboard.sidebar.nav-runs
```

Web: `data-testid` and `aria-label`.
iOS / macOS / visionOS: `accessibilityIdentifier` (and `accessibilityLabel` for
screen readers).
Android: `Modifier.testTag(...)` and `Modifier.semantics { contentDescription = ... }`.
React Native: `testID`.

## 11. Dark mode

> Light + dark mappings for every color token. The rule for switching.

## 12. Cross-platform considerations

### visionOS (if targeted)

- Hover/gaze affordance respected on every interactive element.
- `glassBackgroundEffect` blur depth interactions documented.

### Game / XR (if targeted)

- Colorblind-safe variants for any game-state color signal.
- Caption styling and toggle UX.
