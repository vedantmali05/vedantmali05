# Context: Legacy Code Migration Guidelines

> **Living context for `role-legacy-killer`**

---

## Migration Mapping

| Legacy Source File | Active Target File | Primary Purpose / Data Flow |
|---|---|---|
| `<LEGACY_FILE_1>` | `<TARGET_FILE_1>` | `<PURPOSE_1>` |
| `<LEGACY_FILE_2>` | `<TARGET_FILE_2>` | `<PURPOSE_2>` |

---

## Legacy Pitfalls to Avoid

1. **Inline / Table Layouts:** Legacy files often use nested `<table>` tags or arbitrary inline positioning. Use flexbox/grid layout classes from design system CSS.
2. **Hardcoded URLs:** Never hardcode base URLs; route network calls through centralized service definitions.
3. **Native Alerts:** Legacy code may use `alert()` and `confirm()`. Replace with standardized UI dialogs and toast notifications.
