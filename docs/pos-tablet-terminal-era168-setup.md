# Tablet POS terminal setup (Era 168)

Era 168 certifies Tablet POS wiring (Round 2): 44px touch targets, portrait/landscape layout, and standalone PWA manifest — with canonical proof via era93 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `app/dashboard/pos/tablet/page.tsx` | Tablet POS entry |
| `app/dashboard/pos/tablet/manifest.webmanifest/route.ts` | Standalone PWA manifest |
| `components/pos/pos-tablet-client.tsx` | Tablet shell + orientation |
| `lib/pos/pos-tablet-pos-policy.ts` | 44px min touch + orientation modes |
| `lib/pos/pos-tablet-layout.ts` | Portrait/landscape shell classes |
| `lib/pos/touch-targets.ts` | Touch target tokens |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:pos-tablet-terminal-era168` | Full era168 cert + wiring audit |
| `npm run test:ci:pos-tablet-terminal-era168` | Era168 + era93 + tablet unit tests |
| `npm run test:ci:pos-tablet-terminal-era168:cert` | Wiring cert only (CI gate) |
| `npm run smoke:pos-tablet-terminal-era93` | Canonical era93 smoke |

## Human activation

1. Open **Dashboard → POS → Tablet** on iPad or Android (768px+).
2. Rotate device — verify portrait/landscape badge and cart reflow.
3. Add to Home Screen — standalone Tablet POS PWA launches.
4. Run `npm run smoke:pos-tablet-terminal-era168` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `touch_targets_44px` | `POS_TABLET_POS_MIN_TOUCH_PX` = 44 |
| `portrait_landscape` | `subscribeTabletOrientation` + layout classes |
| `pwa_standalone` | Tablet manifest `display: standalone` |

## Artifact

Summary written to `artifacts/pos-tablet-terminal-era168-smoke-summary.json` (gitignored).

See also: [pos-tablet-terminal-era93-setup.md](./pos-tablet-terminal-era93-setup.md)
