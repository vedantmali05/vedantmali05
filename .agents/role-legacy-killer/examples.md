# Examples: Legacy Refactoring Before & After

> ⚠️ **STALENESS WARNING:** If current production code contradicts any example in this file, current production code always wins. Update this file accordingly.

---

## Example 1: Refactoring a Legacy Modal Dialog

### ❌ Legacy Code
```html
<div id="companyModal" style="display:none; position:fixed; top:20%; left:30%; background:#fff; padding:20px; border:1px solid #ccc; z-index:9999;">
  <h3>Add Company</h3>
  <input type="text" id="compName" placeholder="Company Name" style="margin-bottom:10px;">
  <button onclick="saveCompany()">Save</button>
  <button onclick="document.getElementById('companyModal').style.display='none'">Close</button>
</div>
```

### ✅ Refactored Code
```javascript
// Render dialog markup cleanly via Component namespace
const modalHTML = Component.renderDialogBoxHTML({
  id: 'companyModal',
  title: 'Add Company',
  bodyHTML: `
    <div class="form-group">
      <label class="form-label" for="compName">Company Name</label>
      <input type="text" id="compName" class="form-control" placeholder="Enter company name">
    </div>
  `,
  primaryBtnText: 'Save Company',
  primaryBtnId: 'btnSaveCompany'
});

document.body.insertAdjacentHTML('beforeend', modalHTML);

// Delegate event listeners safely without inline onclick
document.getElementById('btnSaveCompany').addEventListener('click', async () => {
  const compName = document.getElementById('compName').value.trim();
  if (!compName) return Component.showToast('Company name required', 'warning');
  
  await CompanyAPI.createCompany({ name: compName });
  Component.closeDialog('companyModal');
  Component.showToast('Company created successfully', 'success');
});
```

---

## Example 2: Refactoring Raw `fetch()` Calls

### ❌ Legacy Code
```javascript
fetch('http://example.com/api/get_users?company_id=1')
  .then(res => res.json())
  .then(data => renderUserList(data));
```

### ✅ Refactored Code
```javascript
// Route cleanly through domain API service layer
try {
  const users = await UserAPI.getCompanyUsers(companyId);
  renderUserList(users);
} catch (err) {
  showFullPageError('Failed to load user list', err);
}
```
