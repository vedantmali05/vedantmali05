# Examples: API Refactoring Before & After

> ⚠️ **STALENESS WARNING:** If current production code contradicts any example in this file, current production code always wins. Update this file accordingly.

---

## Example 1: Consolidating Backend Fetches to Domain API Service

### ❌ Direct Raw `fetch()` in HTML Script
```javascript
fetch('http://example.com/api/users/company/' + companyId, {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
})
.then(res => res.json())
.then(users => renderUsersTable(users));
```

### ✅ Clean Service Pattern (`UserAPI`)
```javascript
// Endpoint registered in central route registry
// Dispatched via UserAPI
try {
  const users = await UserAPI.getCompanyUsers(companyId);
  renderUsersTable(users);
} catch (err) {
  showFullPageError('Failed to load company users', err);
}
```

---

## Example 2: Mock Interceptor Pattern (`mock-data/mock-users.js`)

```javascript
// Intercept fetch calls locally under DEV_MODE
if (window.DEV_MODE) {
  const origFetch = window.fetch;
  window.fetch = async function(url, options) {
    if (typeof url === 'string' && url.includes('/api/users/company/')) {
      await window.MockDB.ready;
      const companyId = parseInt(url.split('/').pop(), 10);
      const companyUsers = window.MockDB.get('users').filter(u => u.company_id === companyId);
      return new Response(JSON.stringify(companyUsers), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return origFetch(url, options);
  };
}
```
