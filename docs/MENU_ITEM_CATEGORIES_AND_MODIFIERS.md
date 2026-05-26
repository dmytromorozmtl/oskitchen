# Categories and modifiers (roadmap)

## Categories

Planned route: `/dashboard/products/categories` with `MenuItemCategory` (name, description, type, sortOrder, visible, color, optional `businessMode`).

Seed defaults per `BusinessType` (restaurant, café, bar, bakery, catering, meal prep) as defined in the product brief.

## Modifiers

MVP: `ModifierGroup` + `ModifierOption` with optional `modifierGroupId` on items of type ADD_ON / MODIFIER.

UX: simple picker on item form and storefront line-item JSON (`modifiersJson` already exists on storefront order items pattern).
