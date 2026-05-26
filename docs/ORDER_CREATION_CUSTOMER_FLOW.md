# Customer flow

The customer step supports two paths:

1. **Existing** — pick a record from `KitchenCustomer` (top 100 by last
   order date). The order is linked via `Order.customerId`.
2. **Guest / new** — type a name / email / phone manually. The CRM
   upsert path (`upsertCustomerFromOrder`) then creates or updates a
   `KitchenCustomer` keyed by `(userId, email)` after the order is
   saved.

## Required fields

- Name and email are technically optional, since some flows (catering
  request, storefront request, draft) legitimately don't have them yet.
- When both are blank, the service writes the order as
  `Walk-in customer` with a synthetic email
  `no-email+<timestamp>@local.kitchenos.invalid` so existing NOT NULL
  columns stay satisfied. These rows are explicitly **skipped** by the
  CRM upsert.

## Allergy / dietary notes

Stored on the order itself (`Order.allergyNotes`, `Order.dietaryNotes`).
Surfaced in the Review step. They are *additive* — overwriting the
linked customer's existing allergies is not done here, to avoid silent
data drift between order intake and CRM records.

## CRM side effects

`upsertCustomerFromOrder` and `recomputeMetricsForOrderEmail` run as
fire-and-forget after the order is saved. They never block the
response. Failures are swallowed.

## Permissions

- Personal data fields are only rendered when the user has the role
  `OWNER` / `ADMIN` / `MANAGER` / `CUSTOMER_SERVICE` / `CATERING_SALES`.
- `workspace.moroz@gmail.com` always has access.
