# Tablet POS terminal smoke setup (Era 93)

Era 93 certifies iPad/Android tablet POS wiring: 44px touch targets, portrait/landscape layouts, and PWA manifest.

## Wiring surfaces

| Path | Role |
|------|------|
| `app/dashboard/pos/tablet/page.tsx` | Tablet POS entry + viewport |
| `components/pos/pos-tablet-client.tsx` | Orientation-aware shell |
| `lib/pos/pos-tablet-layout.ts` | Portrait/landscape layout classes |
| `lib/pos/touch-targets.ts` | 44px WCAG touch floor |
| `app/dashboard/pos/tablet/manifest.webmanifest/route.ts` | Add-to-Home-Screen PWA |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:pos-tablet-terminal-era93` | Full era93 cert + wiring audit |
| `npm run test:ci:pos-tablet-terminal-era93` | Era93 + tablet POS unit tests |
| `npm run test:ci:pos-tablet-terminal-era93:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → POS → Tablet** on iPad or Android (768px+).
2. Rotate device — verify portrait/landscape badge and sticky cart reflow.
3. **Add to Home Screen** — standalone PWA via manifest.
4. Run `npm run smoke:pos-tablet-terminal-era93` — artifact **PASSED**.

## Touch targets

All primary actions use **44px minimum** touch targets per WCAG 2.5.5.

## Artifact

Summary written to `artifacts/pos-tablet-terminal-smoke-summary.json` (gitignored).
