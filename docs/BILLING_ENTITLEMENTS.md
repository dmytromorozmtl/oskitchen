# Entitlements

## Effective flag resolution

```
plan defaults  ──▶  override values  ──▶  superadmin bypass
(plan-registry)     (EntitlementOverride)   (PLATFORM_ROOT_EMAIL)
```

`services/billing/entitlement-service.ts → entitlementSnapshot(userId)`
returns the merged `Record<FeatureFlag, boolean>` for a workspace.

## Flags

`manualOrders` · `storefront` · `packingLabels` · `packingVerification` ·
`analytics` · `customerCrm` · `inventory` · `costing` · `forecasting` ·
`staffRoles` · `deliveryRoutes` · `webhookReplay` · `multiLocation` ·
`apiAccess` · `whiteLabel` · `ssoOidc` · `advancedProduction` ·
`woocommerce` · `shopify` · `uberEats` · `uberDirect`.

## Overrides

`EntitlementOverride` is keyed by `(userId, featureKey)`. Use
`setEntitlementOverride` to upsert and `clearEntitlementOverride` to
delete. Both write a `BillingEvent` audit row.

Overrides can expire — set `expiresAt`. Expired rows are ignored at read
time (still in the table; admins can clear them).

## Superadmin

`workspace.moroz@gmail.com` (or whatever `PLATFORM_ROOT_EMAIL` is set to)
gets a 100% TRUE map without touching the override table.

## Server callsites

Today's PlanGate component (`components/plans/plan-gate.tsx`) still uses
`lib/plans/feature-registry.ts`. The new entitlement service is
backward-compatible and can be wired in incrementally:

```ts
const allowed = await canUseFeatureNew(userId, "deliveryRoutes");
```
