# Handheld POS terminal smoke setup (Era 96)

Era 96 certifies waiter mobile ordering wiring: table selection, cart build, fire to KDS, tab sync, and offline cash checkout.

## Wiring surfaces

| Path | Role |
|------|------|
| `app/dashboard/pos/handheld/page.tsx` | Handheld POS entry + PWA viewport |
| `components/pos/handheld-ordering-client.tsx` | Table tiles + cart + Fire to KDS + checkout |
| `lib/pos/handheld-ordering.ts` | Product grouping, tab lookup, KDS route |
| `actions/pos/handheld.ts` | Server action — fireHandheldToKdsAction |
| `services/pos/handheld-kds-fire-service.ts` | Order create + kitchen routing + tab sync |
| `services/pos/handheld-ordering-service.ts` | Bootstrap loader (registers, tables, tabs) |
| `app/dashboard/pos/handheld/manifest.webmanifest/route.ts` | Add-to-Home-Screen PWA |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:pos-handheld-terminal-era96` | Full era96 cert + wiring audit |
| `npm run test:ci:pos-handheld-terminal-era96` | Era96 + KDS fire unit tests |
| `npm run test:ci:pos-handheld-terminal-era96:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → POS → Handheld** on a phone or tablet (375px+).
2. Select a **table**, add items, tap **Fire to KDS** — verify kitchen work items.
3. Complete **cash checkout** or queue offline sale — verify tab sync.
4. Run `npm run smoke:pos-handheld-terminal-era96` — artifact **PASSED**.

## Flow

| Step | Action |
|------|--------|
| Table tile | Select dine-in table |
| Product tile | Add to cart (48px touch target) |
| Fire to KDS | Creates order + routes to kitchen display |
| Cash checkout | Completes sale or queues offline |

## Artifact

Summary written to `artifacts/pos-handheld-terminal-smoke-summary.json` (gitignored).
