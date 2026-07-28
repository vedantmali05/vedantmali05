# Review Checklist: Role Code Refactorer

> Perform this audit before shipping refactored HTML or CSS changes.

---

## Pre-Ship Checklist

- [ ] **Zero `style="..."` Attributes:** No inline style attributes remain in HTML markup (except JS-computed dynamic coordinates/offsets).
- [ ] **No Hardcoded Hex Colors:** All color references use CSS design tokens (`var(--...)`).
- [ ] **No Bespoke `:root` Block:** HTML contains no embedded `<style>` block redefining `:root` CSS variables.
- [ ] **Icons Centralized:** All icons reference centralized icon definitions rather than raw embedded `<svg>` tags.
- [ ] **Mobile Responsiveness Verified:** Layout scales cleanly across mobile and desktop viewports without overflow.
- [ ] **Compact Density Preserved:** Spacing adheres to compact layout standards without unnecessary whitespace.
