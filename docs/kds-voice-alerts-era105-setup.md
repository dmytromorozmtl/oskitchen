# KDS Voice Alerts smoke setup (Era 105)

Era 105 certifies voice alert wiring: text-to-speech message builder, queued speech synthesis, and KDS daily service triggers for new orders, overdue tickets, rush levels, and allergen flags.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/kitchen/voice-alerts.ts` | Message builder, speechSynthesis queue, announce/cancel API |
| `lib/kitchen/kds-voice-alerts-policy.ts` | Policy id, default rate/pitch/volume |
| `components/kitchen/kds-daily-service.tsx` | Triggers voice alerts on new order, overdue, rush, allergen |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:kds-voice-alerts-era105` | Full era105 cert + wiring audit |
| `npm run test:ci:kds-voice-alerts-era105` | Era105 + voice alerts unit tests |
| `npm run test:ci:kds-voice-alerts-era105:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Kitchen** (main KDS) with **sound enabled**.
2. Queue a **new order** — browser speaks "New order, table …".
3. Let a ticket go **overdue** — spoken overdue alert fires once per ticket.
4. Queue enough tickets for **rush building/peak** — rush voice alerts fire on level change.
5. Run `npm run smoke:kds-voice-alerts-era105` — artifact **PASSED**.

## Alert kinds

| Kind | Trigger |
|------|---------|
| `new_order` | New ticket arrives on KDS |
| `allergen` | New ticket with allergen conflict |
| `overdue` | Ticket exceeds overdue threshold |
| `rush_building` | Rush level enters building |
| `rush_peak` | Rush level enters peak |

## Artifact

Summary written to `artifacts/kds-voice-alerts-smoke-summary.json` (gitignored).
