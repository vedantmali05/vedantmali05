# Core UI — Design System

A handcrafted, zero-dependency design system built with vanilla HTML and CSS.
Theme-aware (light + dark), offline-first, and optimized for professional dashboard UIs.

## Live Preview

Open `standard.html` directly in any browser — no build step required.

## Files

| File | Purpose |
|---|---|
| `standard.html` | Full component showcase — every component with live examples |
| `main.css` | Core design system: tokens, typography, all component styles |
| `icons.css` | Offline SVG icon system via CSS `mask-image` (Lucide icons) |
| `showcase.css` | Layout and demo scaffolding for `standard.html` only |
| `fonts/` | Self-hosted Manrope font files |

## Components

- **Inputs** — Text, email, password, textarea, search, with addons and validation states
- **Select / Multi-select** — Native-style and custom select controls
- **Checkboxes / Radios** — Standalone and choice-card variants
- **Accordion** — Outlined and subtle variants, grouped, with animated chevron
- **Dialog** — Modal and non-modal, sm/md/lg/full sizes, bottom-sheet on mobile
- **Status Cards** — Info, success, warning, error; xsmall/regular sizes
- **Badges** — Default, outlined, emphasized, solid; status colors
- **Stats** — Chakra-style stat components with trend indicators and tooltips
- **Tooltips** — Top, bottom, left, right with CSS-only arrows
- **Icons** — 40+ Lucide icons, CSS mask-based, color-inheriting

## Design Tokens

All values are CSS custom properties on `:root` and `[data-theme="dark"]`:

- **Colors** — Neutral palette + status colors (info, success, warning, error)
- **Typography** — Manrope font, 6-step scale (h1 → xsmall)
- **Spacing** — `--space-xs` through `--space-2xl`
- **Radius** — `--radius-sm / md / lg`

## Theme

Toggle between light and dark mode via the 🌙 button in the header,
or set `data-theme="dark"` on `<html>`.

## Performance

- Animations auto-disabled when `prefers-reduced-motion: reduce` is set
- JS hardware check (`deviceMemory`, `hardwareConcurrency`, WebGL) applies
  `html.no-motion` class on low-end devices for instant, lag-free interactions

## License

MIT
