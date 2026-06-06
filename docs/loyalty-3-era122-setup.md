# Loyalty 3.0 smoke setup (Era 122)

Era 122 certifies Loyalty 3.0 wiring: cross-brand points pool, VIP multipliers, event bonuses, and referral tracking.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/loyalty/loyalty-3.0-service.ts` | Dashboard snapshot, VIP multiplier, event/referral grants |
| `lib/loyalty/loyalty-3-builders.ts` | Cross-brand lanes, VIP, events, referrals, snapshot |
| `lib/loyalty/loyalty-3-policy.ts` | Policy id, route, VIP defaults |
| `app/dashboard/loyalty/loyalty-3/page.tsx` | Loyalty 3.0 dashboard page |
| `components/loyalty/loyalty-3-panel.tsx` | Summary cards, settings, four pillar sections |
| `actions/loyalty-3.ts` | Save Loyalty 3.0 config server action |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:loyalty-3-era122` | Full era122 cert + wiring audit |
| `npm run test:ci:loyalty-3-era122` | Era122 + loyalty 3.0 unit tests |
| `npm run test:ci:loyalty-3-era122:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Loyalty → Loyalty 3.0**.
2. Review **summary cards** — Members, Cross-brand points, VIP members, Referral bonuses.
3. Inspect **Cross-brand lanes**, **VIP members**, **Event opportunities**, and **Referrals**.
4. Save **Loyalty 3.0 settings** — cross-brand pool, VIP multiplier, event bonuses.
5. Run `npm run smoke:loyalty-3-era122` — artifact **PASSED**.

## Pillars

| Pillar | Feature |
|--------|---------|
| `cross-brand` | Workspace-wide points pool per brand lane |
| `vip` | Earn multiplier for VIP status or high LTV |
| `events` | Catering event bonus opportunities |
| `referrals` | Referral bonus tracking and leaderboard |

## Artifact

Summary written to `artifacts/loyalty-3-smoke-summary.json` (gitignored).
