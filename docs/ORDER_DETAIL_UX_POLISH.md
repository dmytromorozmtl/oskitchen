# Order detail UX polish

## Header

- Title prefers **POS receipt number** when available; otherwise dated label; UUID demoted to monospace subline.
- **Order type** badge from `ORDER_TYPE_LABEL` when key exists.
- **Status** + **operational stage** badges use sentence case helpers.
- **Customer** block uses guest-safe copy (`OrderCustomerSummary`).
- **Customer lookup** only with real email + token.

## Pipeline card

- Blocking summary when fulfillment / mapping prevents progress.
- **Next action bundle** (`resolveOrderNextActionBundle`) with primary CTA + secondary CRM hints.
- Status buttons unchanged; enum transitions still server-validated.

## Tabs

- Tab labels show **counts** for Items, Production, Packing, Activity.

## Fulfillment & routing

- Pickup / service date uses **“Pickup now”** when policy allows.
- Routing card explains **no route** for non-delivery fulfillment.

## Items

- Ops route + kitchen columns + short explanation per line.
