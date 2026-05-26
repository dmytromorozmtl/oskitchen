# Brand Management Center

**Route:** `/dashboard/brands`

## Header & CTAs

- Title **Brands**; subtitle adapts using workspace business mode label when present.
- Primary CTA **New brand** → `/dashboard/brands/new`.
- Secondary **Brand templates** → `/dashboard/brands/templates`.

## Summary cards

- Active / draft counts (from `lifecycleStatus`).
- Brands with ≥1 `StorefrontSettings` row.
- Orders today (workspace-wide; brand slicing noted in UI).
- Brands failing the setup heuristic (story, color/logo, menus, storefront).
- Multi-brand readiness copy + link to `/dashboard/brands/multi-brand-setup`.

## Tabs

| Tab | Purpose |
|-----|---------|
| Overview | Empty-state education, quick create, brand cards. |
| Active / Drafts | Filtered lists. |
| Templates | Shortcut card to library route. |
| Multi-brand | Shortcut to setup guide. |
| Reports | Buttons to each brand’s `/reports` route. |

## Cards

Each brand shows color swatch, slug, concept + lifecycle badges, counts (menus/items/storefronts/channels/orders), setup meter, quick actions (detail, menus, storefront, reports).
