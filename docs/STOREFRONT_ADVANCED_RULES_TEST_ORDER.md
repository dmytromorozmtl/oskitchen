# Storefront advanced: redirects, rules, test orders

**Status:** CRUD UI not shipped in this pass; dashboard page still shows counts only.

## Data models

- `StorefrontRedirect` — `fromPath`, `toPath`, `active` (HTTP status codes would require a migration if strictly needed).
- `StorefrontFulfillmentRule` — `label`, `priority`, `rulesJson`.
- `StorefrontOrder.isTestOrder` — ready for guided test placement.

## Next PR

- List/create/disable redirects.
- JSON editor with schema hints for fulfillment rules.
- “Place test order” server action with email suppression toggle.
