# Examples: CSS Refactoring Before & After

> ⚠️ **STALENESS WARNING:** If current production code contradicts any example in this file, current production code always wins. Update this file accordingly.

---

## Example 1: Eliminating Inline Style Attributes

### ❌ Legacy / WET HTML
```html
<div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px;">
  <span style="font-size: 14px; font-weight: 600; color: #152030;">Gateway Status</span>
  <span style="padding: 4px 8px; background-color: #f0fdf4; color: #16a34a; border-radius: 4px; font-size: 12px;">Active</span>
</div>
```

### ✅ Clean / Refactored HTML (`css-main.css` tokens)
```html
<div class="card-header-row">
  <span class="card-title">Gateway Status</span>
  <span class="badge badge-success">Active</span>
</div>
```

---

## Example 2: Replacing Hardcoded Hex Colors with Design Tokens

### ❌ Bespoke Page CSS
```css
.custom-card {
  background: #ffffff;
  color: #233246;
  border-color: #e1e6eb;
}
```

### ✅ Tokenized CSS (`css-main.css`)
```css
.custom-card {
  background: var(--clr-white);
  color: var(--clr-neutral-700);
  border-color: var(--clr-neutral-200);
}
```
