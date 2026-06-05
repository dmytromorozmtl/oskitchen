# Mobile POS

Phone-as-terminal surface at `/dashboard/pos/mobile`.

## Gestures

| Gesture | Action |
|---------|--------|
| Tap product row | Add to cart |
| Swipe right on product | Quick add to cart |
| Swipe up on cart handle | Expand cart sheet |
| Swipe down on cart handle | Collapse cart sheet |
| Tap cart handle | Toggle cart sheet |

## One-hand layout

- Thumb zone checkout CTA pinned to bottom with safe-area padding
- Collapsed cart peek shows item count and total
- 48px primary targets on search, categories, and checkout

## Files

- `app/dashboard/pos/mobile/page.tsx`
- `components/pos/pos-mobile-client.tsx`
- `lib/pos/pos-mobile-gestures.ts`
