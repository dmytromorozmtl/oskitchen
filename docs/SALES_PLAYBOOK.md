# Sales playbook — OS Kitchen

**Sales-safe playbook hub (FINAL-20)** — single entry for discovery, demo, objections, pricing, and honest claims governance.

**Sales assets package (10 artifacts):** [`docs/sales-assets-package.md`](./sales-assets-package.md) — pitch deck, battle cards, ROI calculator, LOI, demo script, pricing sheet, security one-pager, integration list, implementation checklist, case study template.

## Sales-safe governance

Before external decks, LOI, or pilot SOW:

| Check | Resource |
|-------|----------|
| Forbidden claims training | [`forbidden-claims-training.md`](./forbidden-claims-training.md) (MKT-01) |
| Claims CI gate | `npm run verify-claims` · `.github/workflows/verify-claims.yml` (MKT-09) |
| Integration Health moat | Today strip + `/dashboard/integration-health` — PASS / SKIPPED / FAILED |
| BETA / Preview / SKIPPED | Public [`/trust`](../app/trust/page.tsx) maturity labels (MKT-08) |
| Pilot honesty | `artifacts/pilot-gono-go-summary.json` — do not sell GO when artifact says NO-GO |

Never claim SOC 2, HIPAA, PCI, or LIVE integrations without Integration Health PASS and artifact proof.

## ICP

Independent food operators ($250k–$5M revenue) running **multi-channel** ordering: meal prep subscriptions, catering bids, ghost-kitchen delivery brands, bakery preorders.

## Buyer personas

| Persona | Pain | OS Kitchen hook |
|---------|------|----------------|
| Owner/GM | Margin erosion from mistakes | Single Order Hub + analytics |
| Kitchen lead | Chaos on the line | Production board + packing |
| Ops manager | Integration overhead | WooCommerce/Shopify/Uber posture |

## Qualification (BANT-lite)

- Channels live today? (manual, Woo, Shopify, Uber)
- Weekly order volume band?
- Packing error stories?
- Timeline to pilot?

**Discovery call script:** [`discovery-call-script.md`](./discovery-call-script.md) — 30-min qualification (MKT-21) before product demo.

**Objection handling:** [`objection-handling.md`](./objection-handling.md) — twelve core objections LAER framework (MKT-23).

## Demo path

Follow **`docs/DEMO_SCRIPT.md`** (10-min) or **`docs/demo-script-15min.md`** (15-min live · MKT-22) after discovery qualification.

## Pricing talk track

- **Starter:** prove workflow on one menu / manual-heavy ops.
- **Pro:** omnichannel + labels + inventory lite.
- **Team:** Uber modules + roles + webhook tooling.
- **Enterprise:** multi-location + API — discovery call.

## Closing toolkit

- Beta application: `/beta`
- Security/legal: `/legal/security`
- Integration honesty: **`docs/INTEGRATION_LAUNCH_STATUS.md`**
