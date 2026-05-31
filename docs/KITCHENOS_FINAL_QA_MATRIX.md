# OS Kitchen — Final QA Matrix (Commercial MVP)

**Date:** 2026-05-14  
Use this as a **manual demo script** and regression checklist. Mark pass/fail in your test run.

## Personas

| Persona | Primary surfaces |
|---------|------------------|
| Owner | Today, Executive, Billing, Settings, Order Hub |
| Admin | Settings, Staff, Integrations, Order Hub, Data integrity |
| Manager | Today, Orders, Production, Packing, Routes |
| Cashier | POS terminal, transactions, receipts |
| Kitchen lead | Production, kitchen screen, order detail production tab |
| Prep cook | Production tasks |
| Packer | Packing, packing verify |
| Driver | Routes, delivery stops (scope-limited data) |
| Customer service | Orders, CRM customers, support |
| Accountant | Billing, reports, analytics (read-heavy) |
| Platform founder | `/platform/*`, impersonation (if enabled) |
| Platform support admin | Platform support, workspaces |
| Platform billing admin | Platform billing, entitlements |
| Platform developer admin | Tools, webhooks, jobs |

## Business types

- Meal prep  
- Café  
- Bakery  
- Restaurant  
- Catering  
- Ghost kitchen  
- Multi-brand  
- Manual-only (no channels)

## Workflows (must pass for commercial MVP story)

| # | Workflow | Key assert |
|---|----------|------------|
| 1 | Registration + adaptive onboarding | Workspace created; no PII leaks in logs |
| 2 | POS cash sale | Order `creationSource` POS; **POSTransaction** row; audit/activity events |
| 3 | POS external card sale | **No** raw card data; staff attestation only |
| 4 | POS ready-now sale | No false pickup-date blocker for walk-in/counter |
| 5 | POS made-to-order sale | Production path triggered when required |
| 6 | Manual order | Fulfillment fields validated per rules |
| 7 | Scheduled pickup | Date/window when required by settings |
| 8 | Delivery order | Address + route blockers coherent |
| 9 | Imported order + unmapped product | UNMAPPED_PRODUCTS blocker; Order Hub triage |
| 10 | Product mapping approval | Blockers recompute; order can progress |
| 11 | Send order to production | Guard: items + mapping + POS txn for POS_SALE |
| 12 | Complete production | Packing / ready transitions consistent |
| 13 | Packing verification | Cannot “complete” if packing incomplete when required |
| 14 | Route assignment | Delivery blocker clears when routed |
| 15 | CRM update | Guest placeholder email hidden in normal UI |
| 16 | Support ticket (client) | Customer-visible thread |
| 17 | Platform support reply | Internal vs external separation |
| 18 | Billing safe disabled state | Clear UX when Stripe/env missing |
| 19 | Notifications safe disabled state | No crash; clear copy |
| 20 | Platform access denied | Non-platform user → 403/forbidden |
| 21 | Platform access allowed | `workspace.moroz@gmail.com` founder path |
| 22 | Data integrity detection | At least one POS integrity signal in UI/service |
| 23 | Error recovery retry | No destructive default; audit on replay |
| 24 | Demo reset | Does not touch non-demo workspace without confirmation |
| 25 | Marketing CTAs | `/signup`, `/demo`, `/book-demo`, `/beta` load |

## Negative tests

- Attempt `/platform/dashboard` as workspace-only user → denied.  
- Attempt destructive order transition without permission → denied.  
- Search UI for `@local.kitchenos.invalid` as if “real email” → should not be marketed to.

## Automation

- `npm run typecheck`  
- `npm run build`  
- `npm run lint` (if configured)  
- `npm test` (if configured)
