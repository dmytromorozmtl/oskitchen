# KitchenOS — Full final QA matrix (commercial + enterprise readiness)

**Date:** 2026-05-14  
**Supersedes / extends:** `docs/KITCHENOS_FINAL_QA_MATRIX.md` (commercial MVP baseline).

Use this matrix for **manual regression**, **role-based UAT**, and **sales demo rehearsal**. Record pass/fail and evidence (screenshot or request id) per cell where failures occur.

## Test by business type

| Business type | Focus |
|---------------|--------|
| Meal prep | Weekly menu optional; batch production; scheduled pickup; ingredient demand |
| Café | POS ready-now; fast cashier path; minimal preorder friction |
| Bakery | Preorder + pickup date; production batches |
| Catering | Quotes → order; event fulfillment metadata |
| Ghost kitchen | Multi-channel intake; mapping; integration health |
| Commissary | Multi-brand; routing; production queues |
| Multi-brand | Brand/location scoping; reporting filters |
| Manual-only | No channel noise; Order Hub still usable; no forced weekly menu |

## Test by role (route-level smoke)

| Role | Deny `/platform` | Core happy path |
|------|------------------|-----------------|
| Owner | ✓ | Dashboard, Today, settings, billing |
| Admin | ✓ | Staff, integrations, imports |
| Manager | ✓ | Orders, production, packing, routes |
| Cashier | ✓ | POS terminal, transactions, receipts |
| Kitchen lead | ✓ | Production, KDS |
| Prep cook | ✓ | Assigned production tasks |
| Packer | ✓ | Packing + verification |
| Driver | ✓ | Routes; no unnecessary PII |
| Customer service | ✓ | Orders, CRM, support inbox (scoped) |
| Catering coordinator | ✓ | Catering quotes + orders |
| Purchasing | ✓ | Demand → PO drafts |
| Accountant | ✓ | Reports, analytics (read-heavy) |
| Viewer | ✓ | Read-only surfaces only |
| Platform founder | ✗ (allowed) | Full `/platform`; `workspace.moroz@gmail.com` remains superadmin |
| Platform support admin | ✗ | Support queues, safe replay patterns |
| Platform billing admin | ✗ | Entitlements, read-only destructive |
| Platform developer admin | ✗ | Webhooks, tools, diagnostics |
| Readonly auditor | ✗ | Audit views without mutation |

## Workflows (expanded checklist)

| # | Workflow | Key assert |
|---|----------|------------|
| 1 | Registration | Workspace isolation; no secrets in client bundles |
| 2 | Adaptive onboarding | Business mode does not force weekly menu for all types |
| 3 | POS ready-now sale | No pickup date required for counter/walk-in profile |
| 4 | POS made-to-order sale | Routes to kitchen when production required |
| 5 | POS shift open/close | Variance captured; permissions |
| 6 | Manual order | Fulfillment validators match `fulfillment-requirements` |
| 7 | Storefront order | Checkout uses **published** theme snapshot only |
| 8 | Scheduled pickup | Date/window when rules say required |
| 9 | Delivery order | Address required; route blocker coherent |
| 10 | Imported order + mapping issue | `UNMAPPED_PRODUCTS`; recovery visible |
| 11 | Product mapping approval | Blockers recompute; no silent overwrite of approved mappings |
| 12 | Production | Status transitions align with work items |
| 13 | Packing verification | QC path consistent with pack tasks |
| 14 | Route assignment | `ROUTE_NOT_ASSIGNED` clears when stops exist |
| 15 | CRM update | Guest placeholder email never shown as “real” marketing email |
| 16 | AvT / food cost report | Confidence label honest; no fake precision |
| 17 | Support ticket (customer) | Customer-visible thread only |
| 18 | Platform support reply | Internal notes hidden from customer |
| 19 | Webhook failure / replay | No secrets in payload preview; audit on replay |
| 20 | Integration health | Status badges match `LIVE` / `BETA` / `ROADMAP` honesty rules |
| 21 | Demo seed / reset | Never seeds real workspace without explicit confirmation |
| 22 | Data integrity issue | Surfaced in UI or integrity service without crash |
| 23 | Error recovery action | Confirmation + permission + audit for destructive retries |
| 24 | RBAC denial | Server-side enforcement + clear UI |
| 25 | Platform access denial for client | Non-platform roles cannot browse `/platform` |
| 26 | Public marketing CTAs | Headlines match positioning; no fake certifications |
| 27 | Storefront checkout vs draft theme | Unsafe draft cannot power live checkout |
| 28 | No secrets exposed | Scan responses for keys, tokens, raw card data |

## Automation (release gate)

```bash
npm run typecheck
npm run build
npm run lint
npm test
```

All four must pass before tagging a release candidate.
