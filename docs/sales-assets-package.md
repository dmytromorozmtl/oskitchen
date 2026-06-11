# Sales assets package (P1-82)

Blueprint task **P1-82** bundles ten core GTM artifacts for qualified pilot conversations.

## Asset index

| # | Asset | Path | Use when |
|---|-------|------|----------|
| 1 | **Pitch deck** | [`docs/sales-deck.md`](./sales-deck.md) · [`/deck`](https://os-kitchen.com/deck) | First meeting, investor intro |
| 2 | **Battle cards** | [`docs/competitive-battle-cards.md`](./competitive-battle-cards.md) | Toast/Square/MarketMan objection |
| 3 | **ROI calculator** | [`docs/roi-calculator-conservative.md`](./roi-calculator-conservative.md) · [`/roi-calculator`](https://os-kitchen.com/roi-calculator) | CFO / owner margin conversation |
| 4 | **LOI template** | [`docs/loi-design-partner-template.md`](./loi-design-partner-template.md) | Design partner close |
| 5 | **Demo script** | [`docs/DEMO_CALL_SCRIPT.md`](./DEMO_CALL_SCRIPT.md) | Live product demo |
| 6 | **Pricing sheet** | [`docs/transparent-pricing-sales-guide.md`](./transparent-pricing-sales-guide.md) · [`/pricing`](https://os-kitchen.com/pricing) | Plan comparison |
| 7 | **Security one-pager** | [`docs/security-one-pager-sales.md`](./security-one-pager-sales.md) | Procurement / IT review |
| 8 | **Integration list** | [`docs/integration-list-sales.md`](./integration-list-sales.md) | Channel stack qualification |
| 9 | **Implementation checklist** | [`docs/IMPLEMENTATION_CHECKLIST_TEMPLATES.md`](./IMPLEMENTATION_CHECKLIST_TEMPLATES.md) | Pilot kickoff |
| 10 | **Case study template** | [`docs/case-study-template-pre-pilot.md`](./case-study-template-pre-pilot.md) | Pre-pilot founder story |

## Recommended send order

1. Discovery call → [`discovery-call-script.md`](./discovery-call-script.md)
2. Demo → [`DEMO_CALL_SCRIPT.md`](./DEMO_CALL_SCRIPT.md) + Integration Health visible
3. Follow-up bundle → pitch deck PDF + pricing sheet + ROI calculator link
4. Qualification pass → LOI + implementation checklist + security one-pager
5. Post-pilot → case study template (pre-pilot until signed metrics)

## Claims gate (every asset)

Before external send:

1. `npm run verify-claims` — forbidden phrase scan
2. `npm run audit:forbidden-claims-marketing-pages` — top routes
3. [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) — YES / ONLY_WITH_CAVEAT / NO
4. [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) — attach with pilot SOW

Never claim **SOC 2 certified**, **HIPAA compliant**, or **all integrations LIVE** without Integration Health PASS proof.

## CI

```bash
npm run audit:sales-assets-package
npm run test:ci:sales-assets-package
```

Policy: `sales-assets-package-p1-82-v1`
