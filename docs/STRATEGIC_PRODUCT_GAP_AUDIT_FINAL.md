# Strategic Product Gap Audit — Final

**Product:** OS Kitchen  
**Positioning:** Commerce OS + Operations OS (not a Toast replacement).  
**Date:** 2026-05-14  

## Executive summary

OS Kitchen already spans **POS, channels, order hub, mapping, production, packing, routes, CRM, analytics, purchasing, costing, platform admin, and support** in one codebase. Gaps vs market leaders are less about **surface area** and more about **depth, honesty, and demo narrative**: Cuboh/Deliverect win on **integration proof**, Toast/7shifts on **labor**, R365/MarketMan on **AvT + GL**, meal-prep tools on **subscription UX**.

## Classification legend

| Tag | Meaning |
|-----|---------|
| **READY** | Credible for production narrative in its scope. |
| **DEMO READY ONLY** | Good guided story; fragile without narration. |
| **FUNCTIONAL BUT SHALLOW** | Works; missing edge depth / automation. |
| **NEEDS INTEGRATION MATURITY** | Honest status + retries + visibility required. |
| **NEEDS WORKFLOW DEPTH** | Cross-module chain incomplete. |
| **NEEDS UX SIMPLIFICATION** | Too many surfaces for same job. |
| **NOT MARKET READY** | Would lose head-to-head without heavy services. |

## Module matrix (summary)

| Module | State | Market expectation | Competitor benchmark | Missing depth | Ops risk | Commercial risk | Fix | Pri |
|--------|-------|-------------------|---------------------|---------------|----------|----------------|-----|-----|
| Today / dashboard | FUNCTIONAL BUT SHALLOW | Single ops cockpit | Toast KDS+tasks | Deeper queue sourcing | Missed rush | Demo feels empty | Feed cards from blockers + scenarios | P1 |
| Order hub | NEEDS WORKFLOW DEPTH | Triage all channels | Cuboh | SLA per channel | Stuck orders | Trust | Tab counts + SLA | P1 |
| Product mapping | NEEDS INTEGRATION MATURITY | Safe auto-map rules | Deliverect | Confidence UX | Wrong prep | Liability | Human gates + audit | P0 |
| Order detail | DEMO READY ONLY | Explain + next action | — | Tab parity | Rework | Sales friction | Finish audit + CRM tab depth | P1 |
| POS | FUNCTIONAL BUT SHALLOW | FOH real ops | Toast/Square | Hardware scope honesty | Cash variance | Overpromise | POS completion doc + settings | P1 |
| Production / KDS | NEEDS UX SIMPLIFICATION | Station clarity | Lightspeed KDS | Tablet mode polish | Timing slip | Kitchen distrust | `/kds` + fullscreen | P2 |
| Packing / verify | FUNCTIONAL BUT SHALLOW | Scan-first | — | Scanner UX | Mis-pick | Complaints | `/packing/scanner` hub | P2 |
| Routes / driver | FUNCTIONAL BUT SHALLOW | Proof of delivery | DoorDash internal | Driver PWA | Lost stops | B2B delivery | `/driver` entry | P2 |
| CRM | FUNCTIONAL BUT SHALLOW | Guest vs real email | — | Segmentation | Spam risk | GDPR tone | Guest display rules | P1 |
| Analytics / forecast | DEMO READY ONLY | CFO-grade | R365 | AvT engine depth | Wrong margin | Enterprise loss | AvT service + confidence | P1 |
| Purchasing / receiving | FUNCTIONAL BUT SHALLOW | PO + receiving | MarketMan | Three-way match | Stockouts | Trust | Receiving discipline UX | P2 |
| Costing | NEEDS WORKFLOW DEPTH | Recipe → sales | xtraCHEF | Actual usage tie | Silent wrong cost | Pricing errors | `actual-vs-theoretical-service` | P1 |
| Staff / tasks | FUNCTIONAL BUT SHALLOW | Labor | 7shifts | No payroll claim | Overstaff | Compliance | LABOR_STRATEGY doc + MVP | P1 |
| Storefront | NEEDS INTEGRATION MATURITY | Stripe truth | Shopify | Subscriptions honesty | Checkout fail | Chargebacks | Clear disabled pay UX | P1 |
| Platform admin | DEMO READY ONLY | Internal CRM | SaaS consoles | CS playbooks | Slow support | Churn | Ticket links to entities | P1 |
| Support inbox | FUNCTIONAL BUT SHALLOW | Two-sided | Zendesk | SLA automation | Dropped tickets | NPS | Status model + links | P1 |
| Data integrity | FUNCTIONAL BUT SHALLOW | Self-heal | Datadog | Auto-fix policy | Drift | Incidents | Align with blockers | P1 |
| Marketing site | READY | Category clarity | Olo/Toast sites | Segment pages depth | Confusion | CAC | Honest integration language | P2 |

## P0 / P1 focus

- **P0:** Mapping safety, POS payment honesty, platform isolation, secret hygiene.  
- **P1:** Golden demos, integration maturity UI, AvT confidence, order chain, labor MVP narrative.
