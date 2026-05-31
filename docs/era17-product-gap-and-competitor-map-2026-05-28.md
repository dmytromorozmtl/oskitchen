# OS Kitchen Era 17 Product Gap and Competitor Map

**Date:** 2026-05-28  
**HEAD:** `5e00dd4` @ `main`  
**Baseline:** `docs/full-product-strategic-reaudit-2026-05-28-era17.md`  
**Policy:** `era17-competitor-feature-gap-matrix-refresh-v1` — **evidence_aligned_awaiting_pilot_proof**

---

## Competitor Comparison Matrix

| Competitor | Category | Competitor Strength | OS Kitchen Gap | OS Kitchen Advantage | Add/Improve | Priority |
|------------|----------|---------------------|---------------|---------------------|-------------|----------|
| **Toast** | POS + restaurant ops | Hardware, offline, KDS rush, payments ecosystem, table service depth | No terminal cert, no offline, no rush-hour KDS, FOH depth | Unified order spine; honest CI governance; broad ops modules | POS software depth, KDS ops sign-off; **do not** claim hardware | P1 software / defer hardware |
| **Square for Restaurants** | SMB POS + payments | Terminal, SMB UX, payments familiarity, simplicity | Complexity, no Terminal cert, surface area | Storefront + kitchen spine; tier-2b money path | Role-based IA simplification, tablet UX (Era 17 started) | P1 |
| **Lightspeed Restaurant** | Inventory + multi-site | KDS polish, multi-location reporting | KDS polish, multi-loc depth | Production calendar operator depth | Calendar + KDS bundle for prep ICP | P1 |
| **TouchBistro** | FOH / iPad | Table service, floor plans, split checks | Table service preview only | — | Table roadmap post-POS RBAC | P2 |
| **Clover** | Hardware + apps | Hardware breadth, app marketplace | No hardware ecosystem | Unified ops narrative | Integrations/API instead of fake hardware | defer |
| **SpotOn** | Bundled SMB | Local sales, bundled loyalty | Fragmented growth story | CRM + loyalty base (dual ledger honest) | Package ops loop without unified rewards claim | P2 |
| **Revel** | Multi-location POS | Enterprise-ish multi-site | Workspace normalization ongoing | Modern monolith architecture | Finish workspace scope + RBAC | P1 |
| **Oracle Simphony** | Enterprise chain | Scale, corporate governance, attestations | SSO/SCIM/SOC2 not delivered | Admin/audit foundations; honest procurement | SSO pilot_ready path only | P0 SSO proof |
| **Shopify** | Commerce | Themes, apps, native admin | Theme ecosystem, admin parity | Kitchen spine from webhooks; branded storefront | **Live smoke PASS** + golden path | **P0** |
| **WooCommerce** | OSS commerce | Plugin flexibility | Not full plugin ecosystem | Same spine as Shopify | **Live smoke PASS** | **P0** |
| **DoorDash Drive** | Delivery | Branded dispatch | PLACEHOLDER registry | Placeholder honesty | Direct-order spine first | defer |
| **Uber Direct** | Delivery | Last-mile API | PLACEHOLDER | Same | Fulfillment governance model | defer |
| **Grubhub** | Marketplace | Brand recognition | PLACEHOLDER | Honesty | Hidden until live proof | defer |
| **7shifts** | Labor | Scheduling depth, compliance | In-app staff fragmented | Labor + orders unified potential | RBAC + labor dashboard | P2 |
| **Homebase** | Time clock | Simple SMB labor | Less polished UX | Full OS inclusion | Time clock + export polish | P2 |
| **QuickBooks** | Accounting | GL/AP/AR dominance | Export-only, no GL | Ops source-of-truth | Stronger exports + reconciliation | P2 |
| **Xero** | Accounting | SMB/mid-market exports | Partial sync | Operational data quality | Finance export visibility | P2 |
| **Klaviyo** | Marketing | Segmentation + automation | Campaign preview | First-party order data | Consent-aware lifecycle (preview) | P3 |
| **Mailchimp** | Email | Simple campaigns | Partial automation | CRM base | Segment + consent rigor | P3 |
| **HubSpot** | CRM | Full CRM suite | Attribution depth | Restaurant-specific CRM | CRM as growth pillar | P2 |
| **Square Loyalty** | Loyalty | Unified SMB loyalty | Dual ledger | Per-channel certified POS | **Do not** claim unified | locked |
| **Toast Marketing** | CRM + campaigns | Integrated with POS | Campaign preview | Order spine data | Honest dual ledger | P3 |
| **Restaurant365** | Inventory + accounting | Deep restaurant inventory/accounting | Cross-channel depletion, accounting depth | Order-linked costing path | POS depletion + costing spot check | P2 |
| **MarketMan** | Purchasing | Vendor + purchasing | Receiving depth | PO approval RBAC | Purchasing beta maturity | P3 |
| **MarginEdge** | Costing | Invoice + margin focus | Recipe confidence | Integrated margin reports | Costing pilot QA | P2 |

---

## Top 25 Competitor Features OS Kitchen Should Add

1. SSO IdP staging login proof → qualified `pilot_ready` (not production-for-all)  
2. Live Woo/Shopify smoke PASS on staging  
3. GitHub staging workflow PASS URLs recorded  
4. First paid pilot with captured KPIs  
5. KDS staging Playwright PASS (operational, not rush-hour cert)  
6. Production calendar operator drill PASS on real staging  
7. Role-based operator home / reduced nav for cashier/kitchen  
8. POS manager discount UI (server guards exist)  
9. Table service: floor plan + split check MVP  
10. Public API partner onboarding checklist execution  
11. Webhook replay hardening for all P1 matrix routes  
12. Integration health dashboard for pilot operators  
13. Multi-location scoped reporting consistency  
14. QuickBooks/Xero export reconciliation visibility  
15. Labor overtime dashboard polish  
16. Storefront publish rollback one-click  
17. Domain/DNS automated verification  
18. Pilot metrics export dashboard  
19. Published customer case study (post-approval)  
20. Break-glass SSO drill documented PASS  
21. Commerce webhook incident drill executed (not template-only)  
22. Stripe Terminal path — **only if** explicit hardware era unlock  
23. Handheld server ordering MVP — post-table-service  
24. Low-stock alert push to owner mobile  
25. Catering quote → order conversion automation  

---

## Top 25 Competitor Features OS Kitchen Should NOT Add Now

1. Toast-class offline POS  
2. Full hardware terminal certification  
3. Live DoorDash/Uber Eats/Grubhub marketplace ops  
4. SOC2 Type II certification program (premature)  
5. SCIM provisioning  
6. Production SSO for all tenants  
7. Unified cross-channel inventory depletion (without era unlock)  
8. Unified cross-channel rewards ledger (without era unlock)  
9. Rush-hour KDS production SLO certification  
10. Public API enterprise SLA  
11. Full GL/accounting replacement (QuickBooks killer)  
12. Clover-style app marketplace  
13. Oracle Simphony-scale multi-tenant rewrite  
14. Klaviyo-class marketing automation suite  
15. OpenTable-class reservations platform  
16. 7shifts standalone scheduling product fork  
17. POS browser E2E redo (Era 4/5 certified)  
18. Experimental cron expansion  
19. Broad AI copilot expansion  
20. Kiosk + QR self-order full product (preview only)  
21. Grubhub marketplace live integration  
22. Native Shopify admin replacement  
23. Full payroll provider (Gusto competitor)  
24. Hardware scanner certification for packing  
25. Franchise royalty management suite  

---

## Top 20 Leapfrog Opportunities

1. **Honest governance CI** — maturity matrix + forbidden claims + GO/NO-GO as product discipline (competitors hide beta depth)  
2. **Single canonical order spine** — storefront + POS + Woo/Shopify + public API → one hub → kitchen (with live proof)  
3. **Production calendar + KDS + packing** unified for prep/catering/ghost kitchen ICP  
4. **Qualified commercial pilot pack** — contract templates with explicit non-claims  
5. **Webhook security matrix** — 46 routes classified in CI (partner trust)  
6. **Mutation registry linter** — prevents RBAC drift in new actions  
7. **Dual-ledger honesty** — avoid competitor-style over-promised unified rewards  
8. **POS-only inventory lock** — explicit policy vs silent wrong depletion  
9. **Enterprise procurement pack** — honest SSO/SOC2 posture vs vaporware  
10. **Channel golden path** — webhook → external order → hub (when live PASS)  
11. **Public API per-route scopes** — finer than many SMB POS APIs  
12. **Operator runbooks as product** — POS/KDS/SSO runbooks Era 17  
13. **Staging proof orchestrator** — P0 unblock aggregates honest child artifacts  
14. **Investor narrative gated on metrics** — template integrity  
15. **Cross-channel rewards cert** — proves what is NOT unified  
16. **Break-glass SSO design** — enterprise-friendly fail-closed  
17. **Tier-2/tier-2b money path CI** — always-on without flaky browser E2E  
18. **Integration placeholder honesty** — registry PLACEHOLDER badges  
19. **Pilot ICP qualification evaluator** — reduces bad-fit pilots  
20. **16-cron production discipline** — ops safety vs cron sprawl  

---

## Top 20 Features That Could Become Unique Moat

1. Unified order model across every channel (with proof artifacts)  
2. Governance-as-product: claims registry + GO/NO-GO + matrix alignment  
3. Kitchen-first operating system (not POS-first bolt-on)  
4. Production calendar tied to real order demand  
5. Packing verification QC loop  
6. Honest integration maturity registry  
7. Commercial pilot evidence pack as sales enablement  
8. Enterprise identity pilot path without legacy Simphony complexity  
9. First-party order data for CRM (without Klaviyo replacement)  
10. POS + storefront + channel import without duplicate order systems  
11. Operator runbook + smoke artifact culture  
12. Domain mutation registry for security consistency  
13. Catering + production + packing for commissary ICP  
14. Beta/preview labeling in nav (page maturity honesty)  
15. Forbidden-claims enforcement before contract signature  
16. Webhook replay dedupe patterns reusable across providers  
17. Typecheck slice ownership for monolith scale  
18. Pilot metrics baseline as investor gate  
19. Cross-functional RBAC (kitchen.bump, packing.manage, etc.) on one platform  
20. Staging proof unblock orchestrator pattern for release confidence  

---

## Ideal Segment Workflows (Summary)

| Segment | Ideal Workflow | Current Gap | Required Features | Priority |
|---------|----------------|-------------|-------------------|----------|
| Small café | SF order → KDS → pickup | Nav complexity | Golden path, simple nav | P1 |
| Bar | Tabs + POS + tips | Tabs preview | Bar tab maturity | P2 |
| Fast casual | SF + POS + KDS rush | No rush cert | KDS ops proof | P1 |
| Full-service | Tables + KDS + POS | Tables preview | FOH roadmap | P2 |
| Ghost kitchen | Channels + KDS + packing | Live channel proof | Woo/Shopify PASS | P0 |
| Meal prep | Production cal + packing | Operator drill SKIPPED | Staging drill | P1 |
| Catering | Quotes + production + packing | Conversion | Quote→order | P2 |
| Multi-location | Scoped RBAC + reports | Workspace polish | Location scope | P1 |
| Franchise | Central menu + local ops | Not built | defer | P3 |
| Enterprise chain | SSO + audit + SLA | SSO proof, SOC2 | pilot_ready SSO | P0 |

---

## What Not to Claim (Enforced)

See `era17-pilot-forbidden-claims-enforcement-v1` and competitor matrix § Forbidden:

- Toast/Square hardware, offline, terminal parity  
- Production SSO, SOC2, SCIM  
- Unified inventory or unified rewards  
- Rush-hour KDS / Toast expo parity  
- Live marketplace delivery ops  
- Public API enterprise SLA  
- Competitor gap "closed" without pilot/staging artifact  

Validation: `MARKETING_CLAIMS_STRICT=1 npm run verify-claims`; `npm run smoke:competitor-feature-gap-matrix`.
