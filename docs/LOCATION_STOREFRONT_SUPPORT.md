# Location storefront support

KitchenOS's storefront (`StorefrontSettings`) has historically been a
one-per-workspace surface. With locations now first-class, we can wire
location-aware storefronts.

## Schema hooks already in place

- `Location.default_storefront_id` (this pass) — points a location at its
  intended storefront.
- `Menu.locationId` — assigning a menu to a location lets the storefront
  hide menus not relevant to the selected location.
- `Location.business_hours_json` + `pickup_hours_json` + `delivery_hours_json`
  — the storefront can show "closed now" + window pickers.
- `Location.fulfillment_settings_json` — defaults for fee, min order, lead
  time.

## Single-location storefronts

When there's exactly one active location, the storefront keeps its current
behaviour (one pickup point, one delivery zone). Customers don't see a
location picker.

## Multi-location storefronts

When `> 1` active location:

1. Customers see a location picker at the top of the menu.
2. Selected location id can be persisted in the existing storefront cookie
   layer (sibling to `kos.loc`).
3. The storefront filters menus by `menu.locationId === selected.id || menu.locationId === null` (location-less menus fall back to all).
4. Pickup / delivery windows + fulfillment fees come from the selected
   location.

## Why "menu.locationId === null fall back"

Many workspaces keep a "house menu" without a location — those should still
appear on every storefront. The `null` fall-through preserves that.

## Roadmap

This pass ships:

- `Location.default_storefront_id` column for the explicit link.
- Detail tabs that show which storefront a location is mapped to.

A follow-up pass will:

- Add the location picker to `app/s/[storeSlug]/menu`.
- Resolve fulfillment settings from `Location` then `StorefrontSettings`.
- Hide menus whose `locationId` doesn't match the picker.
