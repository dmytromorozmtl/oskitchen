# Dark Mode Everywhere smoke setup (Era 134)

Era 134 certifies Dark Mode Everywhere wiring: shell consistency, all five role UIs, and leadership surfaces.

## Wiring surfaces

| Path | Role |
|------|------|
| `lib/design/dark-mode-everywhere-policy.ts` | Policy id, role + leadership module lists |
| `lib/design/dark-mode-everywhere-patterns.ts` | Shared dark-parity classes for all roles |
| `lib/design/dark-mode-everywhere-audit-policy.ts` | Static audit — light-only violations, globals bridge |
| `services/design/dark-mode-everywhere-service.ts` | Snapshot loader with health score |
| `components/roles/owner-role-panel.tsx` | Representative role panel using shared patterns |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:dark-mode-everywhere-era134` | Full era134 cert + wiring audit |
| `npm run test:ci:dark-mode-everywhere-era134` | Era134 + DES-26 policy unit tests |
| `npm run test:ci:dark-mode-everywhere-era134:cert` | Wiring cert only (CI gate) |

## Human activation

1. Toggle **system dark mode** (or OS Kitchen theme toggle if available).
2. Open **Dashboard shell** — verify token-based chrome, no hardcoded `bg-white`.
3. Visit all **five role UIs** — hero cards, tiles, next-action cards render in dark.
4. Open **Command Center**, **Analytics Suite**, **Data Export** — leadership surfaces OK.
5. Run `npm run smoke:dark-mode-everywhere-era134` — artifact **PASSED**.

## Surfaces

| Surface | Modules |
|---------|---------|
| `shell` | Dashboard shell, today, onboarding, KDS bar (DES-24 base) |
| `roles` | All five role pages + panels + roles subnav |
| `leadership` | Command Center, Analytics Suite, Data Export |

## Artifact

Summary written to `artifacts/dark-mode-everywhere-smoke-summary.json` (gitignored).
