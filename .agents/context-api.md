# API & Service Integration Context

Master planning and tracking reference for API routing, UI components, state management, and service abstractions.

Goal: All backend calls route through dedicated service modules. No raw `fetch` or hardcoded endpoints scattered in component files.

---

## Architecture Principles

1. **Zero Raw Fetches in UI Layer** — Route network requests through service abstraction layers.
2. **Centralized Endpoint Definitions** — Keep all API endpoint routes in a central registry.
3. **Service Layer Pattern** — Group backend requests into domain-specific service objects (e.g., `UserAPI`, `DataAPI`).
4. **State & Storage Conventions** — Avoid raw hardcoded storage keys; use centralized constant declarations.
5. **Component-Driven UI** — Reusable dialogs, toasts, form elements, and tables managed via shared UI components.

---

## Service API Reference Template

```javascript
// Example Service Pattern
const ServiceAPI = {
  getItems: async () => { /* ... */ },
  getItemDetail: async (id) => { /* ... */ },
  createItem: async (payload) => { /* ... */ },
  updateItem: async (id, payload) => { /* ... */ },
  deleteItem: async (id) => { /* ... */ }
};
```
