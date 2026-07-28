# Code Context

> Living reference for the current state of the codebase. Update after major changes.
> **graphify support** — if `graphify-out/graph.json` exists, use `graphify query "<question>"` for codebase questions.

---

## File List & Status

**Status key:** ✅ cleaned & standardized · 🔄 in progress · ⏳ not yet touched · ❓ unknown

> Agent: update this table via the `sync` signal after working on a file.

### Primary Application Files

| File | Description | Status |
|---|---|---|
| `<FILE_1>` | `<DESCRIPTION_1>` | ❓ |
| `<FILE_2>` | `<DESCRIPTION_2>` | ❓ |

### Reusable Modules & Services

| File | Description |
|---|---|
| `<MODULE_1>` | `<DESCRIPTION_1>` |
| `<MODULE_2>` | `<DESCRIPTION_2>` |

### Styles & Design System

| File | Description |
|---|---|
| `<STYLE_1>` | `<DESCRIPTION_1>` |

---

## Shared Functions & Utilities

Key files to inspect:
- `<UTILITIES_FILE>` — global helpers and utility functions.
- `<CONSTANTS_FILE>` — global environment and application constants.
- `<SERVICES_FILE>` — API and data access service layer.

---

## API Reference & Environment Configuration

- Base URL / Environment: `<BASE_URL_OR_ENV>`
- All network or backend interactions must route through centralized service modules.

---

## Build & Deployment Commands

```bash
# Example build / dev / test command
npm run dev
```
