# Navigation Excellence (Final)

## Source of truth

- `lib/navigation/final-navigation-groups.ts` — **11 groups** (Core → Internal) with intentional ordering.  
- `lib/nav-config.ts` — re-exports `NAV_GROUPS` from final groups.  
- Filtering still flows through `getFilteredNavGroups` (`lib/business-modes.ts`): business mode, module disablement, staff strip.

## Principles applied

1. **Fewer top-level buckets** — commerce separated from menus; billing sits with inventory & finance.  
2. **No duplicate “Commerce vs Menus” confusion** — storefront + channels + hub + mapping live together.  
3. **Critical recovery paths visible** — Error recovery, System health, Data integrity remain under **Admin**.  
4. **Pinned / recent unchanged** — max **6** pins, **5** recent visits (`services/navigation/navigation-preference-service.ts`).  
5. **Staff route parity** — `lib/nav-role-filter.ts` expanded to include catalog, storefront, channels, CRM, calendar, locations where operators legitimately work.

## Business-mode labels

Continue using `navLabelForBusinessType` (`lib/terminology.ts`) — e.g. Cloud kitchen now forces **“Orders”** explicitly.

## Optional collapse defaults

- `lib/navigation/role-aware-navigation.ts` — `DEFAULT_COLLAPSED_NAV_GROUP_IDS` for insights/setup/internal on first paint (integrate with sidebar default-open state when ready).

## Non-goals

- Did not hide platform entry — still `ownerExtras` for platform roles only (`dashboard-shell.tsx`).
