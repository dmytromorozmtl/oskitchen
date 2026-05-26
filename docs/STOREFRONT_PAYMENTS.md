# Storefront payments

- **Default:** pay-later / request mode (`payLaterOnly`, `paymentMode=PAY_LATER`, `paymentStatus=NOT_REQUIRED`).
- **`onlinePaymentEnabled`:** UI flag only in this iteration—**does not** mount Stripe Checkout or PaymentIntents. Turning it on without backend wiring has no payment effect.
- When Stripe is integrated per-kitchen, gate hosted checkout on env + merchant configuration and keep pay-later as a fallback path.

See internal billing modules separately; do not conflate SaaS subscription billing with consumer storefront payments.
