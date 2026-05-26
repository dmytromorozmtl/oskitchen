# Menu Items & Menu Planner — Technical Audit

**Scope:** `/dashboard/products`, `/dashboard/menu-planner`, and relationships to Menus, Storefront, Production, Costing, Inventory, Nutrition, Sales Channels, and business modes (`BusinessType` on `KitchenSettings`).

**Constraints honored:** No data deletion; weekly meal-prep flows preserved; storefront and production handoff guarded against the internal catalog menu.

---

## 1. Routes & surfaces

| Surface | Path | Current state (post-audit implementation) |
|--------|------|---------------------------------------------|
| Menu items | `/dashboard/products` | Universal intro; business-mode page title; catalog tab; no blocking empty state when zero service menus exist |
| Item wizard (stub) | `/dashboard/products/new` | Placeholder roadmap; primary creation remains catalog dialog |
| Menu planner | `/dashboard/menu-planner` | Strategy-aware title; tabbed workspace (Calendar, Timeline, Board, Strategy, Coverage); service menus only; checklist empty state |
| Menu Center | `/dashboard/menus` | Excludes `catalogOnly` menus from the grid |
| Storefront admin | `/dashboard/storefront` | Service menus only for “no menus” gate and active-menu dropdown; internal catalog hidden |

---

## 2. Data model — `Product` (menu item)

| Topic | Current state | Limitation | Affected business types | Recommended fix | Priority |
|-------|---------------|------------|-------------------------|-----------------|----------|
| `menuId` | Required FK to `Menu` | Items cannot exist without *some* menu row | All | **Implemented:** hidden `Menu` with `catalogOnly=true` (“Item library”) + `ensureCatalogMenu` | P0 |
| `preparedDate` | Required on `Product` | Catalog items need a default date | Meal prep, bakery | Default to “today” in UI; optional future migration to nullable + `availabilityJson` | P1 |
| `ProductCategory` enum | MAINS, SIDES, … | Coarse vs. bar/café/catering taxonomies | Bar, café, catering | Add `MenuItemCategory` model + optional `itemType` on `Product` (see architecture doc) | P1 |
| Type-specific fields | Not on `Product` | No first-class ABV, guest counts, batch size | Bar, catering, bakery | JSON columns or typed tables per `itemType` (see `lib/menu-items/item-types.ts`) | P2 |
| Ownership | Via `Menu.userId` only | Would be fragile if `menuId` were null without `userId` on product | All | Prefer catalog menu pattern **or** add `userId` + optional `menuId` in a later migration | P1 |

---

## 3. Dependency on weekly menus

| Issue | Current state | Why limiting | Affected | Fix | Priority |
|-------|---------------|--------------|----------|-----|----------|
| Empty state blocked catalog | Previously `menus.length === 0` returned “Create a weekly menu first” | Blocked first-run item creation | Restaurant, bar, catering | `ensureCatalogMenu` + product count–based empty state | P0 |
| Copy assumed meal-prep | “Meals attach to weekly menus…” | Wrong mental model for restaurant/bar | Non–meal-prep | `getMenuItemsPageIntro()` universal copy + mode titles | P0 |
| `createProduct` | Required user-owned `menuId` | Correct after catalog menu exists | All | No change to contract; catalog `menuId` injected in UI | P0 |

---

## 4. Item creation flow

| Step | Current state | Limitation | Fix | Priority |
|------|---------------|------------|-----|----------|
| Choose menu | Tab per menu + “Catalog” | Many menus → busy tabs | Search + filters + “assign to menu” bulk action | P2 |
| Wizard | Stub route only | No guided multi-step | Full wizard (Phases 6–7) | P1 |
| Production task | Created on every `createProduct` | Catalog items still get tasks | Optional: skip or defer for `catalogOnly` menu (future) | P3 |

---

## 5. Category system

| Current | Limitation | Fix | Priority |
|---------|------------|-----|----------|
| `ProductCategory` enum in form | Not extensible per brand/mode | `MenuItemCategory` + defaults per `BusinessType` | P1 |

---

## 6. Menu assignment logic

| Current | Limitation | Fix | Priority |
|---------|------------|-----|----------|
| Product lives on one `Menu` | No shared SKU across menus without duplicate rows | `MenuItemAssignment` (join) + optional duplicate-from-catalog | P1 |
| Storefront | `StorefrontSettings.activeMenuId` | Single active menu only | Multi-menu publish already partially via `MenuChannelPublish`; extend UX | P2 |

---

## 7. Product availability

| Current | Limitation | Fix | Priority |
|---------|------------|-----|----------|
| `ProductAvailability` + menu JSON | Planner does not visualize holistically | Planner calendar/board consuming same JSON | P1 |
| `lib/menu-items/item-availability.ts` | Types only | Zod shared with Menu Center save | P2 |

---

## 8. Nutrition labels

| Aspect | Detail |
|--------|--------|
| Current | `NutritionProfile` relation on `Product` |
| Limitation | Editing scattered; no single “labels” workspace |
| Fix | Tabbed item detail “Nutrition & labels” |
| Priority | P1 |
| Compliance | No in-app legal claims; operators must verify declarations (P0 UX/legal) |

---

## 9. Costing

| Aspect | Detail |
|--------|--------|
| Current | `CostSnapshot`, margin hints in copilot |
| Limitation | No “missing cost” indicator on catalog list |
| Fix | Filters + badges on catalog table |
| Priority | P1 |

---

## 10. Inventory / recipe

| Aspect | Detail |
|--------|--------|
| Current | `Recipe` on `Product` |
| Limitation | Demand not surfaced on planner |
| Fix | See production + planner integration docs |
| Priority | P2 |

---

## 11. Storefront integration

| Aspect | Detail |
|--------|--------|
| Current | Active menu products; visibility flags on `Product` |
| Limitation | Catalog must never drive checkout |
| Fix | **Implemented:** exclude from dropdowns; reject in `upsertStorefrontSettings`; nullify in `getStorefrontForPublic`; migration clears bad FKs |
| Priority | P0 |
| SEO | Partial today — item-level SEO tab in detail editor (P2) |

---

## 12. Sales channels

| Aspect | Detail |
|--------|--------|
| Current | Channel import batches + `ProductMapping` |
| Limitation | Catalog UI does not yet expose mapping |
| Fix | Channel Operations Center + mapping doc flows |
| Priority | P2 |

---

## 13. Production handoff

| Aspect | Detail |
|--------|--------|
| Current | `ProductionTask` per product on create |
| Limitation | Catalog items also get tasks (noise vs value) |
| Fix | Optional gating via `productionSettingsJson` (future) |
| Priority | P3 |
| Active menu queries | **Implemented:** `catalogOnly: false` on operational `menu.findFirst` paths |

---

## 14. Menu planner

| Aspect | Detail |
|--------|--------|
| Previous | Weekly-only placeholder copy |
| Shipped | Tabs + mode-aware title + checklist empty state |
| Remaining | Live calendar / board / drag-drop |
| Priority | P1–P2 |

---

## 15. Business-mode terminology

| Aspect | Detail |
|--------|--------|
| Current | `lib/menu-items/item-terminology.ts` |
| Gap | Richer strings for ghost / multi-brand / cloud kitchen |
| Priority | P2 |

---

## 16. Super admin

| Requirement | Status |
|---------------|--------|
| `workspace.moroz@gmail.com` retains full access | Unchanged in this work |

---

## Summary priority stack

- **P0:** Catalog menu, storefront guards, universal copy, planner/menu center filters, delete-menu guard.
- **P1:** Item type + category models, assignment engine, planner data views, detail tabs, wizard steps.
- **P2:** Bulk actions, CSV import/export route, modifier MVP, channel performance UI.
- **P3:** Advanced production rules per item type, audit log breadth.
