# Product thumbnail alt text (P2-47)

**Policy:** `product-thumbnail-alt-text-p2-47-v1`  
**Component:** `components/dashboard/product-table-image-cell.tsx`

Gap P2-47 fixes WCAG/a11y: product table thumbnails used `alt=""` on line 52. Now `alt={productName}` with `productName` passed from `product-manager.tsx` (`p.title`).

## Fix

```tsx
<img src={url} alt={productName} className="h-full w-full object-cover" />
```

## CI

```bash
npm run check:product-thumbnail-alt-text-p2-47
```

## Artifact

`artifacts/product-thumbnail-alt-text-p2-47.json`
