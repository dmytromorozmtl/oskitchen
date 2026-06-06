# CRM Automation setup (Era 198)

Era 198 certifies CRM Automation wiring (Round 2): win-back outreach, birthday rewards, and favorites reorder nudges — with canonical proof via era123 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/crm/automation-service.ts` | Snapshot loader, candidate queues, scan runner |
| `lib/crm/automation-builders.ts` | Queue items, lanes, snapshot builders |
| `lib/crm/automation-policy.ts` | Policy id, route, default thresholds |
| `app/dashboard/crm/automation/page.tsx` | CRM Automation dashboard page |
| `components/crm/crm-automation-panel.tsx` | Summary cards, settings, lane queues |
| `actions/crm/automation.ts` | Save config + run scan server actions |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:crm-automation-era198` | Full era198 cert + wiring audit |
| `npm run test:ci:crm-automation-era198` | Era198 + era123 + CRM automation unit tests |
| `npm run test:ci:crm-automation-era198:cert` | Wiring cert only (CI gate) |
| `npm run smoke:crm-automation-era123` | Canonical era123 smoke |

## Human activation

1. Open **Dashboard → CRM → Automation**.
2. Review **summary cards** — Pending, Win-back, Birthdays, Favorites.
3. Inspect **automation lanes** — candidate queue per trigger.
4. **Save settings** and **Run scan now** — follow-ups + birthday rewards.
5. Run `npm run smoke:crm-automation-era198` — artifact **PASSED**.

## Triggers

| Trigger | Behavior |
|---------|----------|
| `win-back` | Inactive / at-risk customers → reactivation follow-ups |
| `birthday` | Birthday tag match today → reward + follow-up |
| `favorites` | Favorite items + inactivity → reorder nudge |

## Artifact

Summary written to `artifacts/crm-automation-era198-smoke-summary.json` (gitignored).

See also: [crm-automation-era123-setup.md](./crm-automation-era123-setup.md)
