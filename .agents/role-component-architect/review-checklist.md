# Review Checklist: Role Component Architect

> Perform this audit before shipping new or updated UI components.

---

## Pre-Ship Checklist

- [ ] **Exposed API:** Component generator or controller function is properly exported or attached to component namespace.
- [ ] **Styles in Component Stylesheet:** All CSS definitions reside in component stylesheets (no inline styles).
- [ ] **Design System Tokens Used:** Colors, spacing, radii, and fonts consume standard CSS variables.
- [ ] **Keyboard Accessible:** Overlays listen for `Escape` key press to dismiss cleanly.
- [ ] **Zero Layout Shift:** Interactive state switches maintain constant layout dimensions.
- [ ] **Mobile Responsive:** Components scale gracefully down to mobile viewports.
- [ ] **Context Updated:** New component signature documented in `context.md`.
