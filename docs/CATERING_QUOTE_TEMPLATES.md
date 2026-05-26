# Catering Quote Templates

## Sources

1. **Built-in** — defined in `lib/catering/quote-templates.ts`. Nine
   curated templates:
   - Corporate Lunch Drop-off
   - Boxed Lunch Package
   - Buffet Catering
   - Family-Style Catering
   - Breakfast Meeting
   - Bakery Event Order
   - Bar Private Event *(with explicit alcohol-licensing reminder)*
   - Meal Prep Corporate Rotation
   - Custom Event Proposal
2. **Workspace** — saved in `catering_quote_templates`. Created from
   `/dashboard/catering-quotes/templates`. A workspace template can
   reference a built-in via `builtInKey`.

## What a template carries

- `eventType`, `serviceStyle`, `pricingMode`
- `defaultLinesJson` — array of starter lines with `title`, `quantity`,
  `unitPrice`, `lineType`
- `defaultFeesJson` — `serviceFee/deliveryFee/setupFee/staffingFee`
- `clientCopy` — the client-facing description shown on the public link
- `internalChecklist` — operator-facing reminders

## Applying a template

The current wizard takes manual entry. Template application is a
future enhancement (apply via dropdown in step 4/5). The data model and
helpers are already in place.

## Safety

The Bar Private Event template explicitly does **not** promise
alcoholic beverage service; its `clientCopy` reads "Alcohol service
depends on local licensing and is confirmed separately." This matches
the project rule "no unsupported alcohol compliance claims."
