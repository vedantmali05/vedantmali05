# Examples: Code Sanitization & Line Reduction Before & After

> ⚠️ **STALENESS WARNING:** If current production code contradicts any example in this file, current production code always wins. Update this file accordingly.

---

## Example 1: Collapsing Multi-line Function Call Wrappings

### ❌ Unnecessary Multi-line Wrapping (12 lines)
```javascript
const userPayload = {
  user_name: userNameInput.value.trim(),
  user_email: userEmailInput.value.trim(),
  role_id: parseInt(roleSelect.value, 10),
  company_id: parseInt(companySelect.value, 10),
  is_active: activeCheckbox.checked ? 1 : 0
};

UserAPI.createUser(
  userPayload
).then(function(response) {
  handleSuccess(response);
});
```

### ✅ Collapsed Clean Execution (8 lines, not 12)
```javascript
const userPayload = {
  user_name: userNameInput.value.trim(),
  user_email: userEmailInput.value.trim(),
  role_id: parseInt(roleSelect.value, 10),
  company_id: parseInt(companySelect.value, 10),
  is_active: activeCheckbox.checked ? 1 : 0
};
UserAPI.createUser(userPayload).then(handleSuccess);
```
> **Note:** Multi-key object literals stay multi-line for readability. Only unnecessary wrapper patterns (single-arg `.then(fn)`, pointless `function(res)` wrappers) get collapsed.

---

## Example 2: Event Listener Migration

### ❌ Legacy Inline `onclick` Attribute
```html
<button class="btn btn-primary" onclick="handleEditRole(12, 'Admin')">Edit Role</button>
```

### ✅ Delegated `addEventListener` Pattern
```html
<button class="btn btn-primary" data-action="edit-role" data-id="12" data-name="Admin">Edit Role</button>
```
```javascript
document.querySelectorAll('[data-action="edit-role"]').forEach(btn => {
  btn.addEventListener('click', (e) => handleEditRole(e.currentTarget.dataset.id, e.currentTarget.dataset.name));
});
```
