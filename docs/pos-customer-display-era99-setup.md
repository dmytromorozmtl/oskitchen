# POS Customer Display smoke setup (Era 99)

Era 99 certifies second-screen customer display wiring: terminal cart updates sync to a popup window via BroadcastChannel.

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
| `npm run smoke:pos-customer-display-era99` | Full era99 cert + wiring audit |
| `npm run test:ci:pos-customer-display-era99` | Era99 + customer display unit tests |
| `npm run test:ci:pos-customer-display-era99:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → POS → Terminal** on a dual-monitor workstation.
2. Press **F8** or use toolbar toggle — customer display popup opens on second screen.
3. Add items to cart — verify live line items and totals sync on customer display.
4. Run `npm run smoke:pos-customer-display-era99` — artifact **PASSED**.

## Channel

| Constant | Value |
|----------|-------|
| BroadcastChannel | `kitchenos-pos-customer-display-v1` |
| Popup route | `/dashboard/pos/terminal/customer-display` |

## Artifact

Summary written to `artifacts/pos-customer-display-smoke-summary.json` (gitignored).
