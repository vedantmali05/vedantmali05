# Review Checklist: Role Code Sanitizer

> Perform this audit before shipping code formatting or cleanup changes.

---

## Pre-Ship Checklist

- [ ] **No Bare `console.log()`:** All debug logging statements removed from production code.
- [ ] **No Inline `onclick` / `onchange` Attributes:** All event handlers registered via `addEventListener`.
- [ ] **Multi-line Wrappings Collapsed:** Function calls, object declarations, and array literals un-wrapped where safe.
- [ ] **Standard Helper Integration:** Shared helper utilities used consistently.
- [ ] **Zero Functional Regression:** Interactive flows tested and working without runtime errors.
