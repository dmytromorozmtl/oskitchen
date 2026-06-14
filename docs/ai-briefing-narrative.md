# AI briefing narrative (Blueprint P2-111)

Owner daily briefing in three-part narrative format.

## Route

`/dashboard/ai/briefing-narrative`

## Sections

| # | Section | Example |
|---|---------|---------|
| 1 | Yesterday | Yesterday +12% order volume vs prior week |
| 2 | Channel mix | DoorDash orders +18% vs prior period |
| 3 | Next step | Next: review menu mix — fries margin flagged |

**Canonical narrative:** `Yesterday +12%. DoorDash orders +18%. Next: review menu mix — fries margin flagged.`

## Usage

```bash
npm run audit:ai-briefing-narrative-p2-111
npm run test:ci:ai-briefing-narrative-p2-111
```

## Notes

- **BETA**: verify against your POS and channel reports — typical directional briefing, not certified financial audit.
- Wired to owner daily briefing service and daily_briefing action drafts (P2-106).
- Aligns with copilot narrative prompt generation.

## Wiring

- Policy: `lib/ai/ai-briefing-narrative-p2-111-policy.ts`
- Operations: `lib/ai/ai-briefing-narrative-p2-111-operations.ts`
- Service: `services/ai/ai-briefing-narrative-p2-111-service.ts`
- Page: `app/dashboard/ai/briefing-narrative/page.tsx`
