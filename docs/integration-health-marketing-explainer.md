# Integration Health marketing explainer (P1-73)

Blueprint task **P1-73** adds a dedicated landing section and three-step explainer concept for Integration Health marketing.

## Headline

> **Integration Health — operational truth before rush hour**

## Three-step explainer

| Step | Title | Concept |
|------|-------|---------|
| 1 | See honest status | PASS, SKIPPED, or FAILED per channel — no blanket “connected” badge |
| 2 | Get alerted early | Predictive alerts before rush hour on Today and Integration Health Center |
| 3 | Recover with playbooks | Operator playbooks from alerts — re-auth, replay webhooks, escalate |

## Wired surfaces

- `components/marketing/integration-health-marketing-explainer-section.tsx` — reusable explainer
- `components/marketing/integration-health-center-marketing-landing.tsx` — `/integration-health-center`
- `components/marketing/landing-integration-health-moat.tsx` — home `/` moat strip (compact variant)

## Honesty guardrails

- **SKIPPED** — partner credentials missing; not fake green
- **BETA** — maturity label from feature matrix; not sold as live for all tenants
- Health scores are operational signals — **not guaranteed uptime**

## Routes

- Marketing landing: `/integration-health-center`
- Live dashboard (post-signup): `/dashboard/integration-health`
- Product deep-dive: `/product/integration-health-center`

## CI

```bash
npm run audit:integration-health-marketing
npm run test:ci:integration-health-marketing
```

Policy: `integration-health-marketing-p1-73-v1`
