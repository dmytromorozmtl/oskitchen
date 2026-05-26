# CRM marketing consent &amp; privacy

KitchenOS tracks consent but **never** sends marketing automatically.

## Storage

- `kitchen_customers.marketing_consent` (bool, default `false`)
- `kitchen_customers.sms_consent` (bool, default `false`)
- `kitchen_customers.consent_source` (varchar) — e.g. "verbal", "form", "csv"
- `kitchen_customers.consent_at` (timestamp)
- `customer_consent_events` (audit log)

## Why we audit every change

Even if KitchenOS never sends the email itself, regulators (CASL, GDPR, etc.)
require us to **prove** the consent existed at the moment a customer received
an email. The audit log is append-only and records:

- consent type (`EMAIL_MARKETING`, `SMS_MARKETING`, `TRANSACTIONAL`, `THIRD_PARTY_SHARING`)
- value (true/false)
- source string
- performedBy (whoever was logged in)
- timestamp

## What's exposed where

- **Customer detail page → Consent card** — toggle and view full history.
- **Reports** — "marketing-consented" segment + counts.
- **Exports (planned)** — segments filter; only consented contacts go into the export.

## No automatic sending

The product does not connect to Mailchimp / Klaviyo / SendGrid in this
milestone. When an integration ships, it must read `marketing_consent` and
`customer_consent_events` before any send.

## PII rules

- Kitchen and driver roles only see allergy and delivery notes for an order
  they are actively working — never the full profile (`lib/crm/customer-permissions.ts`).
- `maskPhone` / `maskEmail` helpers in `lib/crm/customer-privacy.ts` are used
  whenever a customer is rendered outside the CRM context.
- Archiving a customer keeps their order history intact (no destructive cascade).
- Customers are scoped to a workspace via `user_id`; cross-workspace reads are
  rejected at every layer.

## Superadmin

`workspace.moroz@gmail.com` retains full read access regardless of role —
implemented via `isSuperAdminEmail` in `lib/platform-owner.ts` and wired
through `canDoCrm`.
