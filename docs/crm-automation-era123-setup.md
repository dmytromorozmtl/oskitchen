# CRM Automation smoke setup (Era 123)

Era 123 certifies CRM Automation wiring: win-back outreach, birthday rewards, and favorites reorder nudges.

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
| `npm run smoke:crm-automation-era123` | Full era123 cert + wiring audit |
| `npm run test:ci:crm-automation-era123` | Era123 + CRM automation unit tests |
| `npm run test:ci:crm-automation-era123:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → CRM → Automation**.
2. Review **summary cards** — Pending, Win-back, Birthdays, Favorites.
3. Inspect **automation lanes** — candidate queue per trigger.
4. **Save settings** and **Run scan now** — follow-ups + birthday rewards.
5. Run `npm run smoke:crm-automation-era123` — artifact **PASSED**.

## Triggers

| Trigger | Behavior |
|---------|----------|
| `win-back` | Inactive / at-risk customers → reactivation follow-ups |
| `birthday` | Birthday tag match today → reward + follow-up |
| `favorites` | Favorite items + inactivity → reorder nudge |

## Artifact

Summary written to `artifacts/crm-automation-smoke-summary.json` (gitignored).
