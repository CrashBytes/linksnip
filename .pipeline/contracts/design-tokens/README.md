# Design tokens

Authoritative source: [`tokens.json`](tokens.json) (W3C Design Tokens
Community Group format). Sibling files are GENERATED:

- `tokens.css` — CSS custom properties for web
- `tokens.swift` — Swift constants for iOS / macOS / visionOS
- `tokens.kt` — Kotlin constants for Android
- `tokens.ts` — TypeScript accessors for React Native consumers (optional)

## Conventions

- **Source of truth is `tokens.json`.** Don't hand-edit the generated
  files; regenerate from JSON.
- **Frozen after `phase: design_system`.** Per-story leads consume tokens;
  they never edit them. Updates require a follow-up design-system program
  iteration.
- **Every text-on-background color pair must be WCAG AA-validated.** The
  `DESIGN-SYSTEM.md` §1 table lists the validated pairs; anything not on
  the list is decorative-only.
- **Reduced-motion alternatives** are mandatory for every motion token.
- **Hit-target minimums**: web 24px (AA), iOS 44pt, Android 48dp.

## Regenerating sibling files

The design-system-architect agent emits the four sibling files on first
write. Tooling-of-choice (style-dictionary, theo, hand-written) is fine
— pick whatever the host project standardizes on.

```bash
# Example with style-dictionary, if installed:
npx style-dictionary build --config style-dictionary.config.cjs
```

## Adding a new token

1. Edit `tokens.json` only.
2. Run the regeneration step (above) to update `tokens.css` / `tokens.swift`
   / `tokens.kt` / `tokens.ts`.
3. Reference the new token from your story's UI implementation.
