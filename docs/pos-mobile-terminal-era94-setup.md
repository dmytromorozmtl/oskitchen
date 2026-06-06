# Mobile POS terminal smoke setup (Era 94)

Era 94 certifies phone-as-POS wiring: swipe-to-add products, one-hand thumb-zone checkout, and PWA manifest.

## Wiring surfaces

| Path | Role |
|------|------|
| `app/dashboard/pos/mobile/page.tsx` | Mobile POS entry + viewport |
| `components/pos/pos-mobile-client.tsx` | Swipe rows + bottom cart sheet |
| `lib/pos/pos-mobile-gestures.ts` | Swipe detection (48px min distance) |
| `lib/pos/pos-mobile-cart.ts` | Cart filter + subtotal helpers |
| `app/dashboard/pos/mobile/manifest.webmanifest/route.ts` | Add-to-Home-Screen PWA |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:pos-mobile-terminal-era94` | Full era94 cert + wiring audit |
| `npm run test:ci:pos-mobile-terminal-era94` | Era94 + mobile POS unit tests |
| `npm run test:ci:pos-mobile-terminal-era94:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → POS → Mobile** on a phone (375px+).
2. **Swipe right** on a product — item adds to cart.
3. Use **bottom cart sheet** cash checkout — one-hand complete sale.
4. Run `npm run smoke:pos-mobile-terminal-era94` — artifact **PASSED**.

## Gestures

| Gesture | Action |
|---------|--------|
| Swipe right on product | Add to cart |
| Tap product row | Add to cart |
| Bottom sheet handle | Expand/collapse cart |

## Artifact

Summary written to `artifacts/pos-mobile-terminal-smoke-summary.json` (gitignored).
