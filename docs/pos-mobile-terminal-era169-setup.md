# Mobile POS terminal setup (Era 169)

Era 169 certifies Mobile POS wiring (Round 2): swipe-to-add gestures, one-hand thumb-zone checkout, and standalone PWA manifest — with canonical proof via era94 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `app/dashboard/pos/mobile/page.tsx` | Mobile POS entry |
| `app/dashboard/pos/mobile/manifest.webmanifest/route.ts` | Standalone phone PWA |
| `components/pos/pos-mobile-client.tsx` | Swipe handlers + bottom cart sheet |
| `lib/pos/pos-mobile-gestures.ts` | Swipe detection + handlers |
| `lib/pos/pos-mobile-pos-policy.ts` | Swipe min distance + touch policy |
| `lib/pos/pos-mobile-cart.ts` | Mobile cart sheet helpers |
| `lib/pos/touch-targets.ts` | 48px touch target tokens |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:pos-mobile-terminal-era169` | Full era169 cert + wiring audit |
| `npm run test:ci:pos-mobile-terminal-era169` | Era169 + era94 + mobile unit tests |
| `npm run test:ci:pos-mobile-terminal-era169:cert` | Wiring cert only (CI gate) |
| `npm run smoke:pos-mobile-terminal-era94` | Canonical era94 smoke |

## Human activation

1. Open **Dashboard → POS → Mobile** on a phone (375px+).
2. Swipe right on a product — item adds to cart.
3. Use bottom thumb-zone checkout — one-hand complete sale.
4. Run `npm run smoke:pos-mobile-terminal-era169` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `swipe_gestures` | `createPosSwipeHandlers` + `detectPosSwipe` |
| `one_hand_checkout` | Bottom cart sheet + thumb-zone actions |
| `pwa_standalone` | Mobile manifest `display: standalone` |

## Artifact

Summary written to `artifacts/pos-mobile-terminal-era169-smoke-summary.json` (gitignored).

See also: [pos-mobile-terminal-era94-setup.md](./pos-mobile-terminal-era94-setup.md)
