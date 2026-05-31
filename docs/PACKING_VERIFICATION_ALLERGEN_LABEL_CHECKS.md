# Allergen and label checks

## UI

- Product allergens surface on order load and on verification lines (`productAllergens` on session detail).
- Explicit actions mark allergen and label checks per line (`markAllergenCheckedAction`, `markLabelCheckedAction`).
- High-risk SKUs should use **large, high-contrast** badges in the console (tablet layout).

## Supervisor override

When data is missing or checks cannot pass in good faith:

- Supervisor (see `PACKING_VERIFICATION_PERMISSIONS.md`) uses override action with **required reason**.
- Creates `PackingVerificationOverride` and `SUPERVISOR_OVERRIDE` QC event.
- Platform superadmin email (`isSuperAdminEmail`) is always allowed by validation helper.

## Disclaimer

OS Kitchen surfaces **catalog-stored** allergen and nutrition metadata for operational speed. It does **not** replace:

- Your legal allergen program,
- Label artwork approval,
- Or jurisdiction-specific disclosure rules.

Staff must verify printed materials against the live recipe and supplier specs.

## Links

Deep-link to Nutrition Labels / item admin from the product row when you add `productId` routes in UI (IDs are available on verification items).
