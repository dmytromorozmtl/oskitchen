# Menu Center audit

**Scope:** `/dashboard/menus`, Prisma `Menu`, products, storefront `activeMenuId`, `StorefrontMenuPublish`, drag reorder, active menu rules.  
**Date:** 2026-05-07

## Summary

Historically the UI was **weekly preorder–centric**. The codebase already supported generic menus with dates and products; the gap was **strategy metadata**, **business-mode copy**, and **navigation to templates / wizard / detail**. This release adds `MenuStrategy` on `Menu`, a strategy registry, Menu Center UI, wizard, templates, and stub detail/reports — without removing weekly preorder flows.

## Issues table

| # | Current state | Limitation | Affected modes | Fix | Pri |
|---|---------------|------------|----------------|-----|-----|
| 1 | Title “Weekly menus” for all users | Wrong mental model for bars/restaurants | BAR, RESTAURANT, CAFE | `menuCenterCopy()` + `MenuCenter` header | P1 |
| 2 | No `strategy` on `Menu` | Cannot branch storefront/production copy safely | All | Prisma `MenuStrategy` + defaults | P0 |
| 3 | Single empty state copy | Meal-prep wording alienates others | Non–meal-prep | `menuStrategyDefinition(defaultForMode).emptyState*` | P1 |
| 4 | Create dialog hard-coded “weekly” | Operators cannot pick strategy at create | All | `/dashboard/menus/new` wizard + quick create keeps dates | P1 |
| 5 | No templates surface | Slow setup for new verticals | All | `/dashboard/menus/templates` + `applyMenuTemplate` | P2 |
| 6 | No menu detail hub | Deep settings scattered | All | `/dashboard/menus/[id]` overview + roadmap tabs | P2 |
| 7 | `Product` is the menu item join | Cannot model separate `MenuItemAssignment` yet | Future | Document; optional Phase 2 table | P3 |
| 8 | Storefront snapshot | `StorefrontMenuPublish.snapshotJson` exists; not wired per-strategy in UI | All | Document in storefront doc; extend later | P2 |
| 9 | Production handoff | Still product/menu driven; strategy metadata informs copy only today | All | Document roadmap | P3 |
| 10 | Permissions | Owner/staff same as rest of dashboard | All | Future fine-grained roles | P3 |

## Super-admin

`workspace.moroz@gmail.com` / platform bypass unchanged — full menus and data.

## Related docs

- `docs/MENU_STRATEGY_ARCHITECTURE.md`  
- `docs/MENU_CENTER_READY_REPORT.md`
