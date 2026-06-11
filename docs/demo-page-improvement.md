# Demo page improvement (P1-83)

Blueprint task **P1-83** upgrades `/demo` with an **interactive sandbox** (5 operator stops) and a **guided video tour** (5-segment script aligned with the 5-minute Loom walkthrough).

## Headline

**Explore before you launch — interactive sandbox + guided tour**

## Interactive sandbox

Test id: `demo-interactive-sandbox`

| Stop | Route | Theme |
|------|-------|-------|
| Today | `/dashboard/today` | Owner Command Center — honest BETA/SKIPPED labels |
| Orders | `/dashboard/orders` | Unified order hub — 50 sample orders |
| KDS | `/dashboard/kitchen` | Kitchen display + production line |
| POS | `/dashboard/pos` | Software-first checkout |
| Health | `/dashboard/integration-health` | Integration Health — verify credentials |

Launch the temp workspace, then follow the tabbed path. Demo channels stay **simulated** until you wire real credentials.

## Guided video tour

Test id: `demo-guided-video-tour`

Five segments mirror [`docs/demo-video-script-5min.md`](./demo-video-script-5min.md):

1. **0:00–0:30** — Hook (landing / Today)
2. **0:30–1:15** — Today + owner briefing
3. **1:15–2:00** — Orders + Integration Health
4. **2:00–2:45** — Kitchen + KDS
5. **2:45–5:00** — POS, channels, pricing close

Sales team: record from staging golden scenario or guest launch — **typical** 5-minute take, not a guaranteed prospect timeline.

## Claims gate

- Do not imply LIVE DoorDash/Uber Eats or SOC 2 on the demo page.
- Integration Health rows must show honest **BETA** / **SKIPPED** status in recordings.
- Run `npm run verify-claims` before publishing Loom cuts.

## CI

```bash
npm run audit:demo-page-improvement
npm run test:ci:demo-page-improvement
```

Policy: `demo-page-improvement-p1-83-v1`
