# KitchenOS FoodOps full module audit

**Method:** Static review of routes under `app/dashboard`, supporting libs/actions, and Prisma models. This audit is **operational**, not a marketing claim of completeness.

**Legend — vertical fit column:** `++` strong native fit, `+` usable with config, `o` partial / roadmap, `—` not a primary fit (module still available).

## Summary matrix

| Module | Meal prep | Catering | Restaurant | Café | Bar | Bakery | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Dashboard | ++ | + | + | + | + | + | P1 |
| Orders | ++ | + | ++ | + | + | + | P0 |
| Order Hub | ++ | ++ | ++ | + | + | + | P0 |
| Calendar | + | ++ | + | + | ++ | + | P1 |
| Weekly Menus | ++ | + | o | ++ | + | ++ | P0 |
| Brands | + | + | + | o | + | + | P1 |
| Menu Items | ++ | + | ++ | ++ | ++ | ++ | P0 |
| Menu Planner | ++ | ++ | + | + | + | + | P1 |
| Kitchen Production | ++ | ++ | ++ | ++ | ++ | ++ | P0 |
| Packing & Labels | ++ | ++ | + | + | o | ++ | P0 |
| Packing Verify | ++ | + | + | + | o | + | P1 |
| Nutrition Labels | ++ | o | o | o | o | + | P2 |
| Kitchen Screen | ++ | + | ++ | + | + | + | P1 |
| Storefront | ++ | + | ++ | ++ | ++ | ++ | P0 |
| Sales Channels | ++ | + | ++ | + | + | + | P0 |
| Webhooks | ++ | + | + | + | + | + | P1 |
| Integration Health | ++ | + | + | + | + | + | P1 |
| Ingredient Demand | ++ | + | ++ | ++ | ++ | ++ | P1 |
| Purchasing | + | + | ++ | ++ | ++ | + | P1 |
| Costing & Margin | + | + | ++ | ++ | ++ | + | P1 |
| Routes | ++ | ++ | o | o | o | + | P1 |
| Tasks | + | ++ | ++ | ++ | ++ | + | P1 |
| Locations | + | + | ++ | + | + | + | P1 |
| Implementation | + | + | + | + | + | + | P2 |
| Import Center | ++ | + | + | + | + | + | P2 |
| Product Mapping | ++ | + | ++ | + | + | + | P1 |
| Go-Live | ++ | + | + | + | + | + | P2 |
| Training | + | + | + | + | + | + | P2 |
| Customer CRM | + | ++ | + | ++ | + | + | P1 |
| Meal Plans | ++ | o | o | o | — | o | P2 |
| Catering Quotes | o | ++ | o | o | + | o | P0 |
| Analytics | ++ | ++ | ++ | + | + | + | P1 |
| Forecast | ++ | + | + | + | o | + | P1 |
| Reports | ++ | ++ | + | + | + | + | P1 |
| Executive | + | + | ++ | o | o | o | P2 |
| AI Copilot | + | + | + | + | + | + | P2 |
| Staff | + | ++ | ++ | ++ | ++ | + | P1 |
| Billing | ++ | ++ | ++ | ++ | ++ | ++ | P0 |
| Notifications | ++ | ++ | ++ | ++ | ++ | ++ | P1 |
| Alert Rules | ++ | ++ | ++ | + | + | + | P1 |
| Import / Export | ++ | + | + | + | + | + | P2 |
| Partner | o | o | o | o | o | o | P3 |
| Support | ++ | ++ | ++ | ++ | ++ | ++ | P2 |
| Audit Logs | ++ | ++ | ++ | ++ | ++ | ++ | P1 |
| Settings | ++ | ++ | ++ | ++ | ++ | ++ | P0 |
| Growth | o | o | o | o | o | o | P3 |
| Developer | o | o | o | o | o | o | P3 |
| Beta Applications | o | o | o | o | o | o | P3 |
| Platform Admin | — | — | — | — | — | — | P0 |

---

## Per-module audit (abbreviated)

Each block lists: **Purpose · Maturity · Works · Incomplete · Vertical gaps · UX/data/workflow/perf · Recommendations · Priority**.

### Dashboard
**Purpose:** Command center. **Maturity:** Operational beta. **Works:** KPI cards, signals, checklist, charts. **Incomplete:** Mode-specific widget grid (only summary card + terminology this pass). **Gaps:** Bar/café/restaurant bespoke tiles. **UX:** Good desktop density; more mobile widget stacking. **Data:** Pulls aggregates; no materialized views. **Rec:** Implement widget registry per `BusinessType`. **P1.**

### Orders & Order Hub
**Purpose:** Operational order intake and triage. **Maturity:** Operational beta. **Works:** CRUD, statuses, hub listing patterns. **Incomplete:** Unified order *type* taxonomy across dine-in / event / bar booking. **Gaps:** Restaurant rush/dine-in placeholders; bar private booking. **UX:** Bulk actions depth. **Rec:** Channel + type badges, duplicate detection, payment warnings. **P0.**

### Calendar
**Purpose:** Time-based operations. **Maturity:** Foundational+. **Works:** Calendar surface. **Incomplete:** Unified event model (production, routes, closures, supplier drops). **Gaps:** Catering timeline vs meal-prep prep day. **Rec:** Agenda + production timeline views; safe drag rules. **P1.**

### Weekly Menus (Menus)
**Purpose:** Sellable windows. **Maturity:** Shipped (meal prep). **Works:** Week builder, preorder deadline. **Incomplete:** `MenuType` enum (daily / drinks / catering). **Gaps:** Restaurant daily vs meal-prep weekly semantics. **Rec:** Duplicate menu, templates, sold-out rules. **P0.**

### Brands & Locations
**Purpose:** Multi-brand / multi-site. **Maturity:** Operational beta. **Works:** CRUD, associations on several objects. **Incomplete:** Global brand/location switcher chip across modules. **Gaps:** Executive filtering by brand. **Rec:** Workspace-level context bar. **P1.**

### Menu Items (Products)
**Purpose:** SKU / sellable definition. **Maturity:** Operational beta. **Works:** Rich fields for food; pricing; imagery (non-Next-Image URLs handled in manager). **Incomplete:** Product type enum (food vs beverage vs alcohol), modifier groups. **Gaps:** Bar ABV / pour; café sizes. **Rec:** Typed columns + UI sections by mode. **P0.**

### Menu Planner
**Purpose:** Plan publish and capacity. **Maturity:** Foundational+. **Works:** Shell views. **Incomplete:** Kanban + drag-to-day with demand preview. **Rec:** Ingredient demand + revenue preview on drag. **P1.**

### Kitchen Production
**Purpose:** Execution for batches and service. **Maturity:** Operational beta. **Works:** Tasks, statuses, kitchen screen link. **Incomplete:** Station/timer model across all verticals. **Rec:** Production modes (batch / prep / event). **P0.**

### Packing & Labels / Packing Verify
**Purpose:** Fulfillment accuracy. **Maturity:** Operational beta. **Works:** Labels and verify routes. **Incomplete:** Packing waves, scan UX on low-end devices. **Gaps:** Catering tray maps. **Rec:** Route/wave grouping. **P0 / P1.**

### Nutrition Labels
**Purpose:** Customer-facing nutrition. **Maturity:** Foundational+. **Works:** Basic labeling helpers. **Incomplete:** Compliance packaging copy per jurisdiction. **Gaps:** Bar alcohol disclaimers. **Rec:** Persistent disclaimer blocks; no “legal compliance” claims. **P2.**

### Kitchen Screen
**Purpose:** Line display. **Maturity:** Operational beta. **Works:** Fullscreen-friendly UI entry. **Incomplete:** Touch ergonomics audit on iPad fleet sizes. **Rec:** Role-based station filters. **P1.**

### Storefront
**Purpose:** Public commerce. **Maturity:** Operational beta. **Works:** Themed pages, cart/checkout path, policies. **Incomplete:** Template picker per business mode. **Gaps:** Bar alcohol delivery toggles with conservative defaults. **Rec:** Mode templates (meal prep vs restaurant vs bakery). **P0.**

### Sales Channels / Webhooks / Integration Health
**Purpose:** Honest connectivity. **Maturity:** Operational beta. **Works:** Woo/Shopify/Uber patterns, health indicators. **Incomplete:** Toast/Square/DoorDash live OAuth where not implemented — must stay labeled. **Rec:** Capability matrix per provider card. **P0/P1.**

### Ingredient Demand / Purchasing / Costing
**Purpose:** COGS and stock discipline. **Maturity:** Foundational+. **Works:** Modeling screens, snapshots. **Incomplete:** Par levels, auto PO drafts, pour-cost for bars. **Rec:** Supplier delivery calendar linkage. **P1.**

### Routes / Tasks / Locations
**Purpose:** Fulfillment + work coordination. **Maturity:** Operational beta. **Works:** Route and task entities. **Incomplete:** Failed delivery workflow UX. **Gaps:** Bar “event delivery only” flag. **Rec:** Driver mobile view. **P1.**

### Implementation / Import Center / Product Mapping / Go-Live / Training
**Purpose:** Time-to-value. **Maturity:** Foundational+. **Works:** Guides and forms. **Incomplete:** Mode-specific checklists auto-generated from `businessType`. **Rec:** Wire checklist content to `business-modes` strings. **P2.**

### Customer CRM / Meal Plans / Catering Quotes
**Purpose:** Relationship and recurring revenue. **Maturity:** CRM foundational+; quotes stronger for catering. **Incomplete:** Households timeline; quote→invoice. **Rec:** Catering pipeline board. **P0–P1.**

### Analytics / Forecast / Reports / Executive
**Purpose:** Insight. **Maturity:** Foundational+. **Works:** Charts/exports stubs vary by page. **Incomplete:** Vertical KPI packs. **Rec:** Mode-aware default dashboards. **P1–P2.**

### AI Copilot
**Purpose:** Operational assistance. **Maturity:** Foundational+. **Works:** Deterministic fallbacks when no API key. **Incomplete:** Mode-specific copilots (margin, quote). **Rec:** Strict guardrails; never invent integrations. **P2.**

### Staff / Billing / Notifications / Alert Rules
**Purpose:** People, money, signals. **Maturity:** Shipped–beta mix. **Works:** Core flows. **Incomplete:** SMS channel remains placeholder. **Rec:** Alert templates per `BusinessType`. **P0–P1.**

### Import / Export / Audit Logs / Settings
**Purpose:** Governance. **Maturity:** Shipped for settings baseline. **Works:** Settings now includes operating mode. **Incomplete:** Module-level entitlements per seat (future). **Rec:** Audit more events (menu publish, storefront theme). **P1.**

### Partner / Support / Growth / Developer / Beta / Platform Admin
**Purpose:** Ecosystem + internal ops. **Maturity:** Platform admin operational; growth tools owner-only. **Works:** Workspace list w/ business type. **Incomplete:** Feature adoption heatmap. **Rec:** Filter platform dashboard by `BusinessType`. **P3 internal.**

---

## Cross-cutting issues

- **Performance:** High-volume order hubs need virtualized tables (verify as data grows).
- **Mobile:** Primary investment in nav + order hub + packing verify.
- **Data model:** Introduce `MenuType`, `OrderKind`, and optional `ServiceStyle` without breaking existing enums — use additive migrations only.

## Priority definitions

- **P0:** Revenue-critical or operational safety.
- **P1:** High value differentiation for verticals.
- **P2:** Polish / depth.
- **P3:** Internal, partner, or future bets.
