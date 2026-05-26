# Location fulfillment settings

Stored as `location.fulfillment_settings_json`. Read via
`lib/locations/location-fulfillment.ts → parseFulfillmentSettings()`.

## Shape

```ts
type FulfillmentSettings = {
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  pickupInstructions?: string | null;
  deliveryInstructions?: string | null;
  pickupLeadMinutes?: number | null;
  deliveryLeadMinutes?: number | null;
  pickupCutoffMinutes?: number | null;
  deliveryCutoffMinutes?: number | null;
  minOrderAmountCents?: number | null;
  deliveryFeeCents?: number | null;
  maxOrdersPerWindow?: number | null;
};
```

## Editor

`/dashboard/locations/[id]/fulfillment` exposes the full form. Submits go to
`updateLocationFulfillmentAction` and persist atomically.

## Storefront / Order Hub inheritance

These settings are the **location-level baseline**. Per-storefront overrides
(stored on `StorefrontSettings`) still win when present. The intended
resolution order at checkout time:

1. Storefront override (if set).
2. Location fulfillment settings (this page).
3. Workspace defaults.

Modules can use this pattern:

```ts
const settings = parseFulfillmentSettings(location.fulfillmentSettingsJson);
if (storefront?.deliveryFeeCents != null) settings.deliveryFeeCents = storefront.deliveryFeeCents;
```

## Capacity & delivery zones

Sibling JSON fields (`capacity_settings_json`, `delivery_zones_json`,
`kitchen_stations_json`) have parsers in
`lib/locations/location-fulfillment.ts`. UI for them ships in a follow-up
pass; the JSON read path is already in place so a future editor only has to
write the form and `updateLocation()` already knows the keys.

## Cents, not floats

All monetary values are integer cents to stay consistent with Order / Payment
columns. The editor input is a plain `number` field — no float arithmetic.
