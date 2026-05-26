# Meal plan billing — current limitations

This module **does not** charge customers. It records the operator's
chosen billing mode and an optional `pricePerCycle`, and uses those
fields to estimate recurring revenue on the Reports tab.

## Why

The product spec explicitly forbids faking Stripe or any subscription
billing flow before a real integration is wired. Customer trust is
better served by an honest "Pay later / Manual invoice / Stripe
(placeholder — not connected) / Free trial" set than a button that
implies an automatic charge that doesn't happen.

## What is implemented

- `MealPlanBillingMode` enum.
- `MealPlan.pricePerCycle` and `MealPlan.currency` fields.
- "Estimated recurring revenue / month" KPI on the Command Center and
  Reports tabs.

## What is **not** implemented

- No Stripe customer/subscription create.
- No charges, refunds, or invoice generation.
- No webhook handling for payment events.
- No payment status tracking on the plan or cycle.
- No reservation of payment methods.

## Operator workflow today

1. Operator picks a billing mode that describes reality:
   - `PAY_LATER` — invoice the customer when the order is delivered.
   - `MANUAL_INVOICE` — operator generates an invoice elsewhere.
   - `STRIPE_PLACEHOLDER` — labeled as "(placeholder — not connected)"
     in the UI. Operators may use it to mark plans that are *intended*
     for Stripe once it ships.
   - `FREE_TRIAL` — used for trial periods.
2. Generated orders carry the plan name in `Order.notes`, so any
   external invoicing process can use that hook.

## Roadmap

A future milestone will:
- Add Stripe customer + subscription handling.
- Add `MealPlan.stripeSubscriptionId`, `MealPlanCycle.invoiceId`,
  and payment status enums.
- Optionally enable `AUTO_CREATE_CONFIRMED_ORDERS` only when a payment
  method is on file.
