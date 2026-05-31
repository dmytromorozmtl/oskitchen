# CRM allergy &amp; dietary safety

OS Kitchen treats allergy and dietary preferences as **operational** data. They
must be visible where they affect food safety — not hidden behind a CRM page.

## Storage

- `kitchen_customers.allergies_json` — array of strings (e.g. `["peanut", "shellfish"]`)
- `kitchen_customers.dietary_preferences_json` — array of strings (e.g. `["vegetarian", "halal"]`)
- `kitchen_customers.dislikes_json` — non-safety dislikes (cilantro, etc.)
- `kitchen_customers.favorite_items_json` — for VIP greetings, never safety
- `kitchen_customers.notes` — free text

## Helpers

`lib/crm/customer-privacy.ts`:

- `parseAllergies(json)` — forgiving parse: array | comma-separated string | `{ list: [...] }`
- `parseDietaryPreferences`, `parseDislikes`, `parseFavoriteItems`, `parseTags`
- `hasKitchenRelevantNotes(customer)` — quick boolean for chip badges

These helpers are intended for use by:

- Order Hub (allergy chip per order line)
- Production / Kitchen Screen (food-safety note panel)
- Packing Verification (extra confirmation gate)
- Catering Quotes (include allergy notice in proposal)
- Storefront checkout (echo back the customer's stored allergies if logged in)

## Rules

1. Allergy info **must** be visible to kitchen / packer roles whenever the
   customer is tied to an order they're working — handled by
   `lib/crm/customer-permissions.ts → crm.read.allergies_only`.
2. Allergy info **must not** drag along the rest of the CRM profile.
3. The operator is responsible for verification — the UI states this clearly.
4. We surface a one-line disclaimer on every allergy panel.

## Confirmation follow-up

`CustomerFollowUpType.ALLERGY_CONFIRMATION` exists so operators can schedule a
phone call to confirm severity, EpiPen presence, or cross-contamination
tolerance before a large catering order.
