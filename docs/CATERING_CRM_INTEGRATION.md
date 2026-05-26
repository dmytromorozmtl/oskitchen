# Catering — CRM Integration

## Customer lifecycle

- `createQuote()` calls `upsertCustomerByEmail` (from
  `services/crm/customer-service`) with `source = "CATERING_QUOTE"` and
  `type = "CATERING_CLIENT"` (or `INDIVIDUAL` when no company is
  provided). The upsert is best-effort; failures don't block the quote
  create.
- The resulting `KitchenCustomer.id` is stored on the quote
  (`customerId`). All future quote actions for the same email will
  reuse it.

## CRM timeline events

Recorded as `CustomerTimelineEvent` rows with `sourceType =
"catering_quote"` (or `"catering_quote_order"` on conversion):

- on create — `"Catering quote <Q-...> created"`
- on status change — `"Catering quote <Q-...> → <STATUS>"`
- on conversion — `"Catering quote <Q-...> converted to draft order"`

## Metrics

`recomputeMetricsForOrderEmail` is called after conversion so the
customer's LTV / order count reflect the new draft order.

## Privacy

- We never overwrite customer fields on upsert; the upsert helper only
  sets fields it created.
- The public proposal page never exposes the CRM customer ID or other
  customer profile fields.
