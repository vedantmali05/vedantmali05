# Review Checklist: Role API Refactorer

> Perform this audit before shipping API integration or service layer changes.

---

## Pre-Ship Checklist

- [ ] **Zero Raw Backend Fetches:** No raw network fetch calls exist in UI components.
- [ ] **Route Registered:** Target URL is registered in central route registry.
- [ ] **Service Method Used:** Request is dispatched through a domain service object.
- [ ] **Mock Interceptor Verified:** Corresponding endpoint mock interceptor exists and works in development mode.
- [ ] **Error Handling Fallback:** Failures trigger standard error UI or toast notifications.
