# Examples: Reusable UI Component Patterns Before & After

> ⚠️ **STALENESS WARNING:** If current production code contradicts any example in this file, current production code always wins. Update this file accordingly.

---

## Example 1: Creating a Reusable Component Function

### ❌ Raw Inline Page Component Markup
```html
<!-- Bespoke page modal HTML -->
<div class="custom-modal-overlay" id="myModal">
  <div class="custom-modal-content">
    <h4>Custom Header</h4>
    <p>Body text goes here...</p>
  </div>
</div>
```

### ✅ Namespaced Reusable Component (`js-component.js` + `css-project-components.css`)
```javascript
// Function defined in js-component.js and exposed under window.Component
window.Component.renderStatusCardHTML = function(options = {}) {
  const { title = 'Status', value = 'N/A', statusType = 'info' } = options;
  return `
    <div class="status-card status-card-${statusType}">
      <span class="status-card-label">${title}</span>
      <span class="status-card-value">${value}</span>
    </div>
  `;
};
```
```css
/* Styling in css-project-components.css */
.status-card {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  background: var(--clr-neutral-50);
  border: 1px solid var(--clr-neutral-200);
}
```

---

## Example 2: Boat-Shaped Tab Trigger Configuration

```javascript
// Render Tab Bar with boat-shaped triggers
const tabsHTML = Component.renderTabs({
  triggerPosition: 'left',
  tabs: [
    { id: 'tab-roles', triggerLabel: 'Roles (5)', isActive: true, contentId: 'rolesContent' },
    { id: 'tab-perms', triggerLabel: 'Permissions (24)', isActive: false, contentId: 'permsContent' }
  ]
});
```
