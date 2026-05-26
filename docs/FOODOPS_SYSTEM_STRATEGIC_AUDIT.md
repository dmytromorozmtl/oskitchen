# KitchenOS — Food Operations Infrastructure Strategic Audit

**Positioning target:** “The operating system for modern food operations.”  
**Audit date:** 2026-05-14 (repository snapshot).  
**Method:** Codebase route map + service layer review (not marketing claims).

## Executive summary

KitchenOS already spans **workspace dashboard**, **public storefront** (`/s/[slug]`), **partner**, **resources**, **pricing**, and a **gated `/platform`** console. Strength: **breadth** (orders, production, packing, routes, CRM, purchasing, ingredient demand, copilot, audits). Gaps: **naming consistency** across modules, **multi-location filters** not uniformly applied at UI/query level, **persisted order status enum** remains narrower than the **derived lifecycle stage** vocabulary, and **realtime** is mostly **polling/sync indicators** rather than channel subscriptions. None of these require a rebuild; they require **connection**, **RBAC tightening per surface**, and **documentation honesty**.

## Classification legend

- **READY** — Shippable for demos; coherent UX and server paths.
- **FUNCTIONAL BUT SHALLOW** — Works; needs depth (reporting, edge cases, enterprise policy).
- **NEEDS CONNECTION** — Data exists but cross-module workflows incomplete.
- **PLACEHOLDER FEEL** — Stub copy, thin metrics, or uneven empty states.
- **SECURITY RISK** — Potential for data leak, missing gate, or secret exposure (none found in audit pass; continue secret hygiene in UI).
- **NOT MARKET READY** — Would mislead buyers without disclaimers.
- **REQUIRES ENTERPRISE HARDENING** — SSO/SCIM, DPA workflow, formal SLOs, etc.

---

## Customer-facing product

### Dashboard home (`/dashboard`)

| Aspect | Assessment |
|--------|--------------|
| Purpose | Workspace entry, KPIs, navigation. |
| State | **FUNCTIONAL BUT SHALLOW** — strong module count; priority hierarchy varies by page. |
| Priority | P2 polish / P1 if used as primary post-login. |
| Improvement | Unify “next best action” with Today + Order Hub blockers. |

### Today command center (`/dashboard/today`)

| Aspect | Assessment |
|--------|--------------|
| Purpose | Operational execution screen. |
| State | **FUNCTIONAL BUT SHALLOW** — `loadTodayCommandCenter` + KPIs + blockers; realtime shell added (polling). |
| Missing | Full “staff tasks / AI suggestions” as first-class merged queue (partially via playbooks + copilot). |
| Priority | P1 commercial MVP. |
| Classification | **NEEDS CONNECTION** (to unified operations snapshot). |

### Orders (`/dashboard/orders`, `/dashboard/orders/[orderId]`, new order)

| Aspect | Assessment |
|--------|--------------|
| Purpose | Order CRUD, lifecycle, fulfillment. |
| State | **FUNCTIONAL BUT SHALLOW** — Prisma `OrderStatus` is narrow; **derived** lifecycle stages in `lib/orders/order-lifecycle-*` bridge the gap. |
| Data risk | Lifecycle vs DB enum drift if UI shows only DB status. |
| Priority | P1 — align UI tabs with lifecycle engine doc. |
| Classification | **NEEDS CONNECTION**. |

### Order hub (`/dashboard/order-hub`)

| Aspect | Assessment |
|--------|--------------|
| Purpose | Intake / triage. |
| State | **FUNCTIONAL BUT SHALLOW** — service-backed; tab depth may lag lifecycle vocabulary. |
| Priority | P1. |
| Classification | **NEEDS CONNECTION** to order lifecycle + mapping counts everywhere. |

### Production (`/dashboard/production/*`)

| Aspect | Assessment |
|--------|--------------|
| Purpose | Kitchen execution, batches, reports. |
| State | **READY** for demos with data; depth varies by workspace. |
| Priority | P2 unless enterprise throughput reporting is promised. |

### Packing (`/dashboard/packing/*`, training)

| Aspect | Assessment |
|--------|--------------|
| Purpose | Pack verification, labels. |
| State | **FUNCTIONAL BUT SHALLOW**. |
| Priority | P2 / P1 for logistics-heavy ICP. |

### Routes (`/dashboard/routes/*`, Uber Direct placeholders)

| Aspect | Assessment |
|--------|--------------|
| Purpose | Dispatch and delivery. |
| State | **FUNCTIONAL BUT SHALLOW** — third-party logistics must stay **honest** (no fake Uber sync). |
| Priority | P1 for delivery-heavy segments. |
| Classification | **NEEDS CONNECTION** (routes ↔ orders ↔ blockers). |

### CRM (`/dashboard/crm/*`, customers, dedupe, follow-ups)

| Aspect | Assessment |
|--------|--------------|
| Purpose | Customer 360, retention. |
| State | **FUNCTIONAL BUT SHALLOW** — metrics recompute, profile bundle service added. |
| Priority | P1. |
| Classification | **NEEDS CONNECTION** (consent-gated marketing automation). |

### Storefront (`/dashboard/storefront/*`, public `/s/...`)

| Aspect | Assessment |
|--------|--------------|
| Purpose | Branded commerce / preorder. |
| State | **READY** improving — pages/sections, pillar settings, revalidation hooks. |
| Commercial | Stripe only when configured — **correct**. |
| Priority | P1. |

### Sales channels & product mapping

| Aspect | Assessment |
|--------|--------------|
| Purpose | Imports, conflicts, mapping health. |
| State | **FUNCTIONAL BUT SHALLOW** — mapping drives blockers; keep conflict UX tight. |
| Priority | P0/P1 for any channel go-live. |
| Classification | **NEEDS CONNECTION**. |

### Analytics & executive

| Aspect | Assessment |
|--------|--------------|
| Purpose | Revenue, throughput, risk. |
| State | **FUNCTIONAL BUT SHALLOW** — executive overview powers deterministic AI seeds. |
| Priority | P2 unless sold as BI replacement. |

### Inventory, ingredient demand, purchasing

| Aspect | Assessment |
|--------|--------------|
| Purpose | Demand → PO → receiving → margin. |
| State | **FUNCTIONAL BUT SHALLOW** — services exist; new **inventory service facades** align naming. |
| Priority | P1 for commissary / multi-location kitchens. |

### Costing

| Aspect | Assessment |
|--------|--------------|
| Purpose | Margin alerts, channel fees. |
| State | **FUNCTIONAL BUT SHALLOW**. |
| Priority | P2. |

### Notifications, support (`/dashboard/support/*`)

| Aspect | Assessment |
|--------|--------------|
| Purpose | Ops comms + ticket inbox. |
| State | **FUNCTIONAL BUT SHALLOW**. |
| Priority | P2 / P1 enterprise support SLAs. |

### Settings, security, audit logs

| Aspect | Assessment |
|--------|--------------|
| Purpose | Workspace policy + compliance hooks. |
| State | **REQUIRES ENTERPRISE HARDENING** for regulated buyers; baseline **READY** for SMB. |
| Priority | P1 disclosures; P0 if RBAC gaps found in new surfaces. |

### Onboarding / go-live / implementation

| Aspect | Assessment |
|--------|--------------|
| Purpose | Time-to-value, checklist, handoff. |
| State | **FUNCTIONAL BUT SHALLOW** — readiness scoring exists (`workspace-readiness-service`). |
| Priority | P1. |

---

## Internal platform (`/platform/*`)

**Gate:** `requirePlatformAccess` in layout; founder email **`workspace.moroz@gmail.com`** is canonical (`lib/platform-owner.ts`). **Classification:** **READY** for internal dogfood; **REQUIRES ENTERPRISE HARDENING** for external SOC2-style claims.

| Module | State | Priority |
|--------|-------|----------|
| Dashboard / search | FUNCTIONAL BUT SHALLOW | P1 |
| Workspaces / orgs / users | FUNCTIONAL BUT SHALLOW | P1 |
| Support inbox / escalations | FUNCTIONAL BUT SHALLOW | P1 |
| Billing / entitlements / trials | NEEDS CONNECTION to finance source of truth | P1 |
| Integrations / webhooks / jobs | FUNCTIONAL BUT SHALLOW | P1 |
| Audit / tools / impersonation | SECURITY-SENSITIVE — treat as P0 for changes | P0 |
| System health / error recovery (new) | READY (aggregate view) | P1 |

---

## Public marketing site

Routes under `app/` include `pricing`, `resources/*`, `help/*`, `legal/*`, markets, etc. **Classification:** **FUNCTIONAL BUT SHALLOW** — SEO and segment landing depth should match FoodOps positioning (`docs/MARKETING_SITE_REPOSITIONING.md`).

---

## Cross-cutting risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Client access to `/platform` | High | Server layout gate + middleware patterns; keep auditing. |
| Secret exposure in UI/logs | High | Never render env secrets; redact copilot paths (`copilot-redaction`). |
| Lifecycle vs DB enum | Medium | Single derived view (`getOrderLifecycleView`) in UI. |
| Multi-location scope drift | Medium | `locationId` / `brandId` filters + new scope helpers. |

---

## Prioritized improvement backlog (condensed)

1. **P0:** RBAC + audit on any new destructive/admin action; no secret leakage; platform gates.  
2. **P1:** Order Hub + lifecycle + Today use **one operational snapshot** (`services/operations/*`).  
3. **P1:** CRM retention flows respect **`marketingConsent`**.  
4. **P2:** Realtime subscribe (Supabase channel) behind feature flag; keep polling fallback.  
5. **P3:** Full enterprise trust artifacts (DPA workflow, SSO) without claiming certifications.

---

## Module index (quick)

**Customer:** `app/dashboard/**` (400+ routes) — see `docs/KITCHENOS_FOODOPS_PLATFORM_READY_REPORT.md` for phase mapping.  
**Platform:** `app/platform/**` — layout + new `system-health` / `error-recovery`.  
**Public storefront:** `app/s/[storeSlug]/**`.  
**Core services:** `services/orders/*`, `services/today/*`, `services/order-hub/*`, `services/integrity/*`, `services/platform/*`, `services/ai/*`.
