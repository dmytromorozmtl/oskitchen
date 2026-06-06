# Mobile-First Redesign smoke setup (Era 133)

Era 133 certifies Mobile-First Redesign wiring: 375px viewport baseline, 44px touch targets, swipe-to-dismiss nav.

## Wiring surfaces

| Path | Role |
|------|------|
| `lib/design/mobile-first-redesign-policy.ts` | Policy id, 375px / 44px / swipe constants, audited modules |
| `lib/design/mobile-first-redesign-patterns.ts` | Touch classes, swipe handlers, summary helper |
| `lib/design/mobile-first-redesign-audit-policy.ts` | Static module audit — sm button violations, touch tokens |
| `services/design/mobile-first-redesign-service.ts` | Snapshot loader with health score |
| `components/dashboard/dashboard-shell.tsx` | Nav drawer swipe dismiss, mobile main padding |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:mobile-first-redesign-era133` | Full era133 cert + wiring audit |
| `npm run test:ci:mobile-first-redesign-era133` | Era133 + DES-25 policy unit tests |
| `npm run test:ci:mobile-first-redesign-era133:cert` | Wiring cert only (CI gate) |

## Human activation

1. Resize browser to **375px** width (iPhone SE baseline).
2. Open dashboard — verify `px-4 pb-24` main padding and sheet nav.
3. Tap nav trigger, role pills, shortcuts — confirm **44px** minimum targets.
4. Open nav drawer, **swipe left** — drawer dismisses.
5. Run `npm run smoke:mobile-first-redesign-era133` — artifact **PASSED**.

## Dimensions

| Dimension | Standard |
|-----------|----------|
| `viewport` | 375px compact phone baseline |
| `touch` | 44×44 CSS px minimum (WCAG 2.5.5) |
| `swipe` | 48px horizontal swipe dismisses nav drawer |

## Audited modules

- `components/dashboard/dashboard-shell.tsx`
- `components/dashboard/roles-subnav.tsx`
- `components/roles/owner-role-panel.tsx`
- `components/roles/manager-role-panel.tsx`
- `components/command-center/command-center-panel.tsx`

## Artifact

Summary written to `artifacts/mobile-first-redesign-smoke-summary.json` (gitignored).
