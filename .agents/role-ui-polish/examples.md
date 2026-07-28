# Examples: Visual Polish & Theme Alignment Before & After

> ⚠️ **STALENESS WARNING:** If current production code contradicts any example in this file, current production code always wins. Update this file accordingly.

---

## Example 1: Improving Card Visual Hierarchy

### ❌ Overly Dense / Undifferentiated Layout
```html
<div class="data-card" style="border: 1px solid #000; background: #fff;">
  <p>Gateway Telemetry</p>
</div>
```

### ✅ Subtle Visual Grouping with Design Tokens (`css-main.css`)
```css
.data-card {
  background: var(--clr-neutral-50);
  border: 1px solid var(--clr-neutral-200);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  box-shadow: var(--shadow-sm);
}

/* Dark mode theme token mapping automatically adjusts background & border */
```

---

## Example 2: Compact Form Density

### ❌ Spaced Out Form Input
```css
.form-input {
  padding: 16px 24px;
  font-size: 18px;
}
```

### ✅ Compact High-Density Form Input
```css
.form-input {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--fs-small);
  border-radius: var(--radius-sm);
}
```
