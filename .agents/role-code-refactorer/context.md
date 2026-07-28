# Context: CSS Design Tokens & Utility Classes

> **Living context for `role-code-refactorer`**

---

## Design System Tokens Guidelines

### Palette & System Tokens
- Base color tokens & neutral scales.
- Status tokens (Info, Success, Warning, Danger).

### Typography & Spacing
- Font family and typography scale definitions.
- Spacing scale, border radius, and shadow tokens.

---

## Refactoring Guidelines

1. Extract inline `style="..."` attributes to utility classes.
2. Replace hardcoded color hex values with CSS custom properties (`var(--...)`).
3. Consolidate duplicate layout definitions across components.
