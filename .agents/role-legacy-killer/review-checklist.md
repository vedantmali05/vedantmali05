# Review Checklist: Role Legacy Killer

> Perform this audit before shipping refactored code converted from legacy sources.

---

## Pre-Ship Checklist

- [ ] **No Legacy CSS Copying:** Zero CSS rules copied verbatim from legacy files (no bespoke colors or inline styles).
- [ ] **No Inline `style="..."` Attributes:** All elements use semantic design classes.
- [ ] **No Inline Event Attributes:** Zero `onclick`, `onchange`, or `onsubmit` attributes in HTML markup; all handlers registered via structured event listeners.
- [ ] **Service Layer Routing:** All backend interactions go through centralized service abstractions (no raw `fetch()` calls).
- [ ] **Design System Components Used:** Standard modals, toasts, and layout helpers used throughout.
- [ ] **Mock Interceptor Verification:** Local mock interceptor verified working under development mode.
- [ ] **Payload Contract Intact:** Request parameters and JSON payload keys match backend expectations.
