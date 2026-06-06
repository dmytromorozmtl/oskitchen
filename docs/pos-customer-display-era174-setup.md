# POS Customer Display setup (Era 174)

Era 174 certifies POS Customer Display wiring (Round 2): second-screen popup with live cart sync via BroadcastChannel — with canonical proof via era99 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `components/pos/customer-display.tsx` | Full-screen customer-facing UI (lines, totals, payment label) |
| `components/pos/pos-customer-display-client.tsx` | BroadcastChannel subscriber on second screen |
| `app/dashboard/pos/terminal/customer-display/page.tsx` | Popup route for second monitor |
| `lib/pos/pos-multi-monitor.ts` | Window open + publish/subscribe channel |
| `lib/pos/pos-desktop-shortcuts-policy.ts` | Route + component constants |
| `components/dashboard/pos-terminal-client.tsx` | F8 toggle + live cart publish |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:pos-customer-display-era174` | Full era174 cert + wiring audit |
| `npm run test:ci:pos-customer-display-era174` | Era174 + era99 + customer display unit tests |
| `npm run test:ci:pos-customer-display-era174:cert` | Wiring cert only (CI gate) |
| `npm run smoke:pos-customer-display-era99` | Canonical era99 smoke |

## Human activation

1. Open **Dashboard → POS → Terminal** on a dual-monitor workstation.
2. Press **F8** or use toolbar toggle — customer display popup opens on second screen.
3. Add items to cart — verify live line items and totals sync on customer display.
4. Run `npm run smoke:pos-customer-display-era174` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `second_screen` | `openPosCustomerDisplayWindow` popup on second monitor |
| `broadcast_channel` | `kitchenos-pos-customer-display-v1` channel |
| `live_totals_sync` | `publishPosCustomerDisplayState` + `subscribePosCustomerDisplayState` |
| `f8_toggle` | `toggleCustomerDisplayWindow` in terminal client |

## Artifact

Summary written to `artifacts/pos-customer-display-era174-smoke-summary.json` (gitignored).

See also: [pos-customer-display-era99-setup.md](./pos-customer-display-era99-setup.md)
