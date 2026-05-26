# POS customer handling

## Display (`lib/customers/customer-display.ts`)

- Detects `@local.kitchenos.invalid` placeholder emails.
- **Primary label:** “Walk-in customer” for typical guest POS flows.
- **Subtitle:** real phone if any; otherwise “No email captured” — never shows the synthetic email in normal UI.

## CRM (`services/crm/guest-customer-service.ts`)

- Describes guest vs marketable email for receipt/marketing gating.
- `order-creation-service` already skips CRM upsert for placeholder domain.

## Order detail (`components/orders/order-customer-summary.tsx`)

- CTA to Customer tab; explains guest checkout is allowed.

## Customer lookup link

- Shown only when `publicLookupToken` exists **and** a marketable email exists — avoids sending guests to a token flow that assumes email comms.
