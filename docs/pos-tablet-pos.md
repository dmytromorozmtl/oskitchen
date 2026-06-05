# Tablet POS

Dedicated iPad/Android counter surface at `/dashboard/pos/tablet`.

## UX targets

- **44px minimum** touch targets (WCAG 2.5.5 floor) via `lib/pos/touch-targets.ts`
- **48px primary** tiles and checkout CTA in speed mode
- **Portrait** — catalog on top, sticky cart panel at bottom
- **Landscape** — side-by-side catalog and cart (md breakpoint)
- Installable PWA manifest with `orientation: any`

## Files

- `app/dashboard/pos/tablet/page.tsx`
- `components/pos/pos-tablet-client.tsx`
- `lib/pos/pos-tablet-layout.ts`
- `lib/pos/pos-tablet-pos-policy.ts`
