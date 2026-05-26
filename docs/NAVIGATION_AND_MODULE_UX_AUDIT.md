# Navigation and module UX audit — KitchenOS

**Scope:** Dashboard sidebar, module registry alignment, business-mode focus, role strip (OWNER vs STAFF), command palette, mobile drawer, accessibility, and performance boundaries.  
**Date:** 2026-05-07

## Executive summary

The product exposes a large, capable surface area. The primary UX risk is **cognitive overload** in the sidebar when every module is visible at once. Mitigations in code today include: **business-mode–focused hiding** (`getFilteredNavGroups` + `hiddenByDefaultModuleKeys`), **per-user module disables** (`KitchenModulePreference`), **STAFF path allow-list** (`lib/nav-role-filter.ts`), **platform super-admin bypass** (`workspace.moroz@gmail.com` / `platformBypass`), and **local “Show all modules”** scope. Remaining work is to keep **badges and setup hints server-light**, extend **granular roles** when Prisma supports them, and consolidate **duplicate entry points** via primary modules + redirects (see `NAVIGATION_CONSOLIDATION_PLAN.md`).

---

## Issues (format: state → confusion → impact → fix → priority)

### 1. Too many modules visible by default (non–super-admin)

| Field | Detail |
|--------|--------|
| **Current state** | Collapsible groups list many links; “Show all modules” reveals the full catalog. |
| **Why confusing** | Operators in bars vs meal-prep share the same chrome; irrelevant modules look like obligations. |
| **Business impact** | Slower onboarding, mistaken clicks, support noise (“where do I start?”). |
| **Recommended fix** | Keep focused mode default; tune `BusinessModeExperience` in `lib/business-mode-registry.ts`; surface **setup progress** and **recommended pins** (partially done). |
| **Priority** | **P1** |

### 2. “Orders” vs “Order hub” overlap

| Field | Detail |
|--------|--------|
| **Current state** | Two adjacent entries under Orders & Sales. |
| **Why confusing** | Unclear which is system of record for day-to-day. |
| **Business impact** | Split workflows, double data entry perception. |
| **Recommended fix** | One **primary** label in sidebar; secondary as tab or deep link; document in consolidation plan. |
| **Priority** | **P1** |

### 3. Analytics vs Reports vs Executive

| Field | Detail |
|--------|--------|
| **Current state** | Three insight-adjacent modules. |
| **Why confusing** | Overlap in mental model (“which report?”). |
| **Business impact** | Under-use of the right tool; wrong KPI for role. |
| **Recommended fix** | Role-aware defaults; executive hidden unless multi-brand / paid tier; cross-link inside pages. |
| **Priority** | **P2** |

### 4. Recently opened vs pinned duplication

| Field | Detail |
|--------|--------|
| **Current state** | Previously could list the same href twice. |
| **Why confusing** | Redundant noise. |
| **Business impact** | Minor time loss; feels unpolished. |
| **Recommended fix** | **Implemented:** recent list excludes pinned hrefs; max **6** pins (FIFO when at cap); **Clear** for recent. |
| **Priority** | **P2** (was **P1** before fix) |

### 5. Internal / growth modules for standard users

| Field | Detail |
|--------|--------|
| **Current state** | Internal group filtered by owner + platform; registry marks `internalOnly`. |
| **Why confusing** | If mis-filtered, GTM tools leak into restaurant UX. |
| **Business impact** | Trust and permission incidents. |
| **Recommended fix** | **Implemented:** `internalOnly` / `superAdminOnly` respected in ⌘K when not `platformBypass`; module settings hide **internal** tier unless super-admin. |
| **Priority** | **P0** (risk) — mitigated |

### 6. STAFF role is coarse (Prisma only `OWNER` \| `STAFF`)

| Field | Detail |
|--------|--------|
| **Current state** | STAFF allow-list is kitchen-centric. |
| **Why confusing** | “Accountant” or “Driver” personas from the product brief are not first-class yet. |
| **Business impact** | Over- or under-sharing until roles expand. |
| **Recommended fix** | Extend `UserRole` + allow-prefix maps per persona; keep super-admin bypass. |
| **Priority** | **P3** (schema + migration) |

### 7. Mobile: long scroll in drawer

| Field | Detail |
|--------|--------|
| **Current state** | Same nav stack in `Sheet`; search filter helps. |
| **Why confusing** | Thumb travel on phone. |
| **Business impact** | Managers avoid mobile for quick tasks. |
| **Recommended fix** | Search-first mobile; optional bottom shortcuts for Today / Orders; collapse internal/admin by default (**partially**: internal collapsed for non–full-nav). |
| **Priority** | **P2** |

### 8. Command palette label language

| Field | Detail |
|--------|--------|
| **Current state** | Palette merges registry routes with `navLabelForBusinessType` when href matches `NAV_GROUPS`. |
| **Why confusing** | Mixed canonical vs mode-specific wording if href not in nav map. |
| **Business impact** | Minor inconsistency in ⌘K vs sidebar. |
| **Recommended fix** | Align all registry primary paths with `nav-config` hrefs or add `labelKey` to registry. |
| **Priority** | **P2** |

### 9. Accessibility: collapsible groups

| Field | Detail |
|--------|--------|
| **Current state** | Groups use `button` + `aria-expanded` + `aria-controls` + `role="region"`. |
| **Why confusing** | N/A if implemented correctly. |
| **Business impact** | Screen reader and keyboard efficiency. |
| **Recommended fix** | **Implemented** (sidebar groups); extend to full-page accordions where duplicated. |
| **Priority** | **P2** |

### 10. Performance: sidebar must stay cheap

| Field | Detail |
|--------|--------|
| **Current state** | Nav is derived from static config + memoized filters; setup hint from settings row only. |
| **Why confusing** | N/A. |
| **Business impact** | Slow sidebar erodes trust on kitchen tablets. |
| **Recommended fix** | **Do not** add Prisma/React Query to sidebar; badges from summarized APIs or layout props only (`NAVIGATION_PERFORMANCE_REVIEW.md`). |
| **Priority** | **P1** |

### 11. Super-admin guarantee

| Field | Detail |
|--------|--------|
| **Current state** | `getBillingAccess` → `isSuperAdminUser` sets `platformBypass`; layout clears disabled modules; full nav + module gate bypass. |
| **Why confusing** | N/A for target user. |
| **Business impact** | Break-glass support must never be blocked. |
| **Recommended fix** | Keep **email + role row** checks in sync with `PLATFORM_ROOT_EMAIL`; regression-test (`NAVIGATION_QA_MATRIX.md`). |
| **Priority** | **P0** |

### 12. Empty / disabled module states

| Field | Detail |
|--------|--------|
| **Current state** | `ModuleRouteGate` shows disabled module card; **new** role denial card for disallowed paths. |
| **Why confusing** | Generic 404 would feel broken. |
| **Business impact** | Self-serve recovery to settings / Today. |
| **Recommended fix** | Keep cards; add deep link to enabling module from message. |
| **Priority** | **P2** |

---

## Sidebar groups (reference)

Today · Orders & Sales · Menus · Kitchen · Inventory & cost · Fulfillment · Customers & events · Insights · Setup & rollout · Admin · Internal (owner/platform).

## Recently opened & pins

- **Recent:** max 5 visits, persisted in `localStorage`, deduped vs pins, clearable.  
- **Pins:** max 6 ordered hrefs, persisted in `localStorage`; overflow drops oldest.

## Command / search behavior

- Sidebar: text filter on labels + href.  
- Header: ⌘K palette — registry + quick actions, filtered by **disabled modules**, **internal flags**, and **STAFF allow-list**.

## Super-admin validation

Canonical identity: **`workspace.moroz@gmail.com`** (`lib/platform-owner.ts`) plus `PlatformUserRole` SUPER_ADMIN → `platformBypass` in `getBillingAccess`. Standard users must not inherit this path.

---

## Related documents

- `docs/NAVIGATION_CONSOLIDATION_PLAN.md`  
- `docs/TERMINOLOGY_QA_REPORT.md`  
- `docs/NAVIGATION_ACCESSIBILITY_REVIEW.md`  
- `docs/NAVIGATION_PERFORMANCE_REVIEW.md`  
- `docs/NAVIGATION_QA_MATRIX.md`  
- `docs/NAVIGATION_AND_MODULE_SYSTEM_READY_REPORT.md`
