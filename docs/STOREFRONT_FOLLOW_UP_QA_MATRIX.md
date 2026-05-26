# Storefront follow-up QA matrix

| # | Check | How |
| --- | --- | --- |
| 1 | Pay-later checkout | Public checkout, pay later selected, completes |
| 2 | Online Stripe | Stripe keys + aligned currency, completes redirect |
| 3 | Online blocked | Mismatch currency or Stripe off → radio disabled + message |
| 4 | Currency alignment | Ordering tab shows storefront + Stripe currencies |
| 5 | Forms CRUD | `/dashboard/storefront/forms` create/edit/archive |
| 6 | Public form | Linked contact/catering renders builder form |
| 7 | Missing Resend | Submit still stores row; email optional |
| 8 | Domain UI | Domains tab shows TXT instructions + verify buttons |
| 9 | No secrets in UI | Domains prose does not print middleware secret |
| 10 | Redirect CRUD | Advanced tab add/delete |
| 11 | Rule CRUD | Advanced tab add/delete JSON rule |
| 12 | Rules block checkout | closure JSON blocks submit |
| 13 | Test order | Advanced create; optional analytics flag |
| 14 | Analytics empty | New storefront shows empty state |
| 15 | Analytics funnel | After traffic, funnel chart populates |
| 16 | Consent | SEO: ENABLED_WITH_CONSENT → banner before tags |
| 17 | Theme HTTPS | Non-HTTPS logo URL flagged in theme tab |
| 18 | Contrast warning | Low contrast shows warning |
| 19 | Checkout UX | Terms/privacy details + checkout_submit event |
| 20 | Multi-brand | Overview shows note when `brandCount>1` |
| 21–24 | typecheck/build/lint/test | `npm run typecheck && npm run build && npm run lint && npm test` |
