# KitchenOS — Global System Review

**Scope:** Architecture, UX, data, operations, and scalability signals across the current codebase (App Router, ~80+ Prisma models, `actions/*`, `services/*`, broad dashboard surface).

**Method:** Static review of route density, data-access patterns (`lib/prisma.ts` + server actions), dashboard home aggregation (`HomeOverview`), integrations/webhooks, and schema indexing posture.

**Ranking legend**

| Rank | Meaning |
|------|---------|
| **Critical** | Revenue, safety, or data-integrity risk if ignored |
| **High** | Major UX friction, ops load, or scaling ceiling |
| **Medium** | Quality, consistency, or maintainability drag |
| **Low** | Polish, niche personas, or long-tail optimizations |

**Maturity score:** `1` prototype → `5` enterprise-grade for the module’s intended persona.

---

## 1. Authentication & onboarding

| | |
|---|---|
| **Maturity** | 4 / 5 |
| **Strengths** | Supabase SSR middleware; guarded dashboard; onboarding funnel and state persisted on `UserProfile`. |
| **Weaknesses** | Session + Prisma user split increases edge cases; some flows rely on env fallbacks in dev. |
| **UX friction** | Long onboarding paths for power users who import channels first. |
| **Architecture** | Auth checks scattered across layouts and actions; central policy layer incomplete. |
| **Scalability** | Fine for single-tenant-per-user today; org/workspace RBAC adds join depth. |
| **Duplication** | Redirect + “misconfigured” handling repeated in middleware vs API routes. |
| **Automation gap** | No unified “activation score” driving one next action post-login. |
| **Rank** | **Medium** |
| **Business value** | Faster time-to-first-order; fewer support tickets on misconfiguration. |
| **Optimization** | Single `assertTenantContext()` helper; surface one “next best action” card from shared service. |

---

## 2. Dashboard shell & navigation

| | |
|---|---|
| **Maturity** | 3.5 / 5 |
| **Strengths** | Large surface area (`app/dashboard/**`); command palette exists; growth subtree grouped. |
| **Weaknesses** | Cognitive overload for SMB operators; many routes without operational hierarchy. |
| **UX friction** | Finding packing/production under stress; deep nesting for growth vs ops. |
| **Architecture** | Nav config likely stringly-typed; no feature flags per vertical maturity. |
| **Scalability** | Route count increases bundle for shared chunks — acceptable but needs lazy dashboards. |
| **Rank** | **High** |
| **Business value** | Reduced training time; higher daily active use in kitchen. |
| **Optimization** | Role-based nav density; pinned workspaces; sticky operational strip (started on home). |

---

## 3. Dashboard home & “command center”

| | |
|---|---|
| **Maturity** | 4 / 5 |
| **Strengths** | `HomeOverview` batches many health queries via `Promise.all`; attention queue with deep links. |
| **Weaknesses** | Single page issues ~15 queries per load — watch DB load at scale; `productionTask.findMany` for completion can be heavy. |
| **UX friction** | Signals live below fold; operators want urgency first. |
| **Architecture** | Metrics logic embedded in React server component — should move to `services/dashboard` / repository. |
| **Scalability** | Consider materialized “daily ops snapshot” per user when traffic grows. |
| **Rank** | **High** |
| **Business value** | Fewer missed webhooks and missed prep dates. |
| **Optimization** | Prioritized signal strip + shared metrics service + optional Redis cache for counts. |

---

## 4. Orders, order hub, channels

| | |
|---|---|
| **Maturity** | 4 / 5 |
| **Strengths** | Rich order model; external orders; channels; manual capture. |
| **Weaknesses** | Mapping + sync failure recovery spread across screens. |
| **UX friction** | Jumping between Orders, Order hub, Integrations for one incident. |
| **Architecture** | Actions talk to Prisma directly — good velocity, harder regression isolation. |
| **Scalability** | Index coverage is strong; watch list endpoints for unbounded `findMany`. |
| **Rank** | **High** |
| **Business value** | Fewer double-fulfillment mistakes; faster channel onboarding. |
| **Optimization** | Incident-oriented “fix queue” API; bulk retry for failed external orders. |

---

## 5. Production & kitchen

| | |
|---|---|
| **Maturity** | 3.5 / 5 |
| **Strengths** | Production tasks tied to products; kitchen training views. |
| **Weaknesses** | Batching, stations, and capacity modeling are not first-class everywhere. |
| **UX friction** | Touch ergonomics vary; kitchen iPad flows compete with dense tables. |
| **Architecture** | UI + mutations intertwined; timer/station state not unified. |
| **Scalability** | Real-time updates would need websocket or polling discipline. |
| **Rank** | **High** |
| **Business value** | Higher throughput per labor hour; fewer service misses. |
| **Optimization** | Kanban + station modes with shared domain service; optimistic row updates. |

---

## 6. Packing & labels

| | |
|---|---|
| **Maturity** | 3.5 / 5 |
| **Strengths** | Dedicated packing routes; verify flow; label concepts in ecosystem. |
| **Weaknesses** | Waves, QC metrics, and allergen escalation are partial vs best-in-class 3PL. |
| **UX friction** | Rapid pack vs double-check modes not standardized. |
| **Architecture** | Client components for packing — fine, but domain rules should be pure TS modules. |
| **Rank** | **High** |
| **Business value** | Accuracy and speed directly affect refunds and reviews. |
| **Optimization** | Packing wave entity; scan-to-pack adapter interface; throughput metrics table. |

---

## 7. Delivery & routes

| | |
|---|---|
| **Maturity** | 3 / 5 |
| **Strengths** | Dispatch primitives exist in schema evolution (routes, stops). |
| **Weaknesses** | Route optimization and SLA enforcement are placeholders vs ops reality. |
| **UX friction** | Dispatch board not yet a single “control tower”. |
| **Rank** | **Medium** |
| **Business value** | Better on-time performance; lower driver chaos on Fridays. |
| **Optimization** | SLA dashboard + exception queue; integrate maps provider behind adapter. |

---

## 8. Inventory, demand, purchasing

| | |
|---|---|
| **Maturity** | 3 / 5 |
| **Strengths** | Demand lines, purchasing page, ingredient modeling. |
| **Weaknesses** | Procurement (POs, suppliers, spoilage) not fully closed-loop. |
| **UX friction** | Reorder suggestions vs manual spreadsheets. |
| **Rank** | **High** |
| **Business value** | Margin protection; less emergency supplier rush. |
| **Optimization** | Supplier + PO models (planned); reorder queue ranked by revenue at risk. |

---

## 9. Costing, forecasting, analytics

| | |
|---|---|
| **Maturity** | 3.5 / 5 |
| **Strengths** | Cost snapshots; forecast routes; analytics entry points. |
| **Weaknesses** | Confidence intervals, anomaly explainability, and staff/delivery forecasting uneven. |
| **UX friction** | Executives need fewer charts, more decisions. |
| **Rank** | **Medium** |
| **Business value** | Better prep purchasing; fewer surprise margin hits. |
| **Optimization** | `services/intelligence` pure functions + scheduled snapshot jobs; narrative summaries. |

---

## 10. Integrations (WooCommerce, Shopify, Uber)

| | |
|---|---|
| **Maturity** | 4 / 5 |
| **Strengths** | Webhooks, health surfaces, sync APIs; defensive patterns emerging. |
| **Weaknesses** | Retry semantics differ per provider; failure taxonomy not unified. |
| **UX friction** | Merchant confusion between “connected” vs “healthy”. |
| **Rank** | **Critical** (when revenue depends on channels) |
| **Business value** | Prevents silent revenue leakage. |
| **Optimization** | `withRetry` for outbound sync; integration incident IDs; DLQ table. |

---

## 11. CRM & customers

| | |
|---|---|
| **Maturity** | 3 / 5 |
| **Strengths** | Kitchen customers, dedupe page, health snapshots. |
| **Weaknesses** | Segmentation, churn scoring, and comms timeline not fully productized. |
| **Rank** | **Medium** |
| **Business value** | Catering upsell; win-back campaigns. |
| **Optimization** | Tags + RFM-lite scoring service; timeline from orders + support tickets. |

---

## 12. Billing, monetization, trials

| | |
|---|---|
| **Maturity** | 4 / 5 |
| **Strengths** | Stripe paths; trial state; lifecycle emails. |
| **Weaknesses** | Complex edge cases around bypass flags and demo mode. |
| **Rank** | **High** (commercial) |
| **Business value** | Conversion and expansion revenue. |
| **Optimization** | Single billing policy module; audit trail for plan changes. |

---

## 13. Growth, GTM, partner, implementation

| | |
|---|---|
| **Maturity** | 3.5 / 5 |
| **Strengths** | Extensive growth surface; partner mode; implementation project models. |
| **Weaknesses** | Risk of “surface area > depth” perception for enterprise buyers. |
| **Rank** | **Medium** |
| **Business value** | Pipeline and partner leverage. |
| **Optimization** | Tier features by persona; hide advanced growth tools until activation threshold. |

---

## 14. Reporting & exports

| | |
|---|---|
| **Maturity** | 3 / 5 |
| **Strengths** | Reports routes; export APIs; enterprise report placeholders. |
| **Weaknesses** | Saved reports, schedules, and comparables not universal. |
| **Rank** | **Medium** |
| **Business value** | CFO trust; operator accountability. |
| **Optimization** | Report definition JSON + cached datasets per user/day. |

---

## 15. API, developer, security

| | |
|---|---|
| **Maturity** | 3.5 / 5 |
| **Strengths** | Public v1 endpoints; API keys; audit logs; security pages. |
| **Weaknesses** | Rate limits and versioning policy need hardening for external API growth. |
| **Rank** | **High** (enterprise) |
| **Business value** | Partner integrations and compliance posture. |
| **Optimization** | Request IDs on all routes; structured logging envelope; `/api/health` expansion. |

---

## 16. Public storefront & marketing

| | |
|---|---|
| **Maturity** | 3.5 / 5 |
| **Strengths** | Storefront routes; SEO/marketing breadth. |
| **Weaknesses** | Operational coupling between storefront settings and kitchen capacity not always visible. |
| **Rank** | **Medium** |
| **Business value** | Direct consumer revenue stream. |
| **Optimization** | Storefront-specific SLA banner when production backlog high. |

---

## 17. Platform engineering & reliability

| | |
|---|---|
| **Maturity** | 3 / 5 |
| **Strengths** | Scripts for env and checks; Prisma migrations discipline; Next 15. |
| **Weaknesses** | Queue/worker story mostly docs-level; background jobs tied to HTTP cron. |
| **Rank** | **High** at scale |
| **Business value** | Uptime and predictable job execution. |
| **Optimization** | Outbox pattern for automation executions; observability baseline. |

---

## Cross-cutting themes (prioritized backlog)

1. **Operational hierarchy** — urgency-first surfaces, fewer parallel sources of truth. (**High**)  
2. **Domain layer** — repositories + orchestrators to thin server components. (**High**)  
3. **Data hot paths** — dashboard metrics service + caching + safer aggregates. (**High**)  
4. **Automation** — DB foundation added (`AutomationRule` family); wire triggers + UI next. (**High**)  
5. **Mobile / touch** — dedicated layouts for kitchen/packing. (**Medium**)  
6. **Intelligence** — narrative recommendations over raw charts. (**Medium**)  

This document should be refreshed quarterly or after each major vertical release.
