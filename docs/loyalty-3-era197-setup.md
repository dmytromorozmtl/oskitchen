# Loyalty 3.0 setup (Era 197)

Era 197 certifies Loyalty 3.0 wiring (Round 2): cross-brand points pool, VIP multipliers, event bonuses, and referral tracking — with canonical proof via era122 live smoke.

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
| `npm run smoke:loyalty-3-era197` | Full era197 cert + wiring audit |
| `npm run test:ci:loyalty-3-era197` | Era197 + era122 + loyalty 3.0 unit tests |
| `npm run test:ci:loyalty-3-era197:cert` | Wiring cert only (CI gate) |
| `npm run smoke:loyalty-3-era122` | Canonical era122 smoke |

## Human activation

1. Open **Dashboard → Loyalty → Loyalty 3.0**.
2. Review **summary cards** — Members, Cross-brand points, VIP members, Referral bonuses.
3. Inspect **Cross-brand lanes**, **VIP members**, **Event opportunities**, and **Referrals**.
4. Save **Loyalty 3.0 settings** — cross-brand pool, VIP multiplier, event bonuses.
5. Run `npm run smoke:loyalty-3-era197` — artifact **PASSED**.

## Pillars

| Pillar | Feature |
|--------|---------|
| `cross-brand` | Workspace-wide points pool per brand lane |
| `vip` | Earn multiplier for VIP status or high LTV |
| `events` | Catering event bonus opportunities |
| `referrals` | Referral bonus tracking and leaderboard |

## Artifact

Summary written to `artifacts/loyalty-3-era197-smoke-summary.json` (gitignored).

See also: [loyalty-3-era122-setup.md](./loyalty-3-era122-setup.md)
