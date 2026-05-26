# Billing architecture

## Layers

```
lib/billing/*                pure utilities (no I/O)
services/billing/*           Prisma I/O, side-effects, Stripe sync
actions/billing.ts           Next.js server actions (auth+zod gated)
app/api/billing/*            REST endpoints (checkout, portal)
app/api/webhooks/stripe      verified Stripe webhook
app/dashboard/billing/*      Billing Center UI (React server components)
```

## Source files (this project)

| File | Purpose |
|------|---------|
| `lib/billing/plan-registry.ts` | Single source of truth for plan keys, prices, limits, features. |
| `lib/billing/billing-status.ts` | Widened status enum + tone map + Stripe mapping. |
| `lib/billing/stripe-config.ts` | Presence-only env diagnostics (never returns values). |
| `lib/billing/stripe-client.ts` | Stripe client factory + price resolver. |
| `lib/billing/usage-limits.ts` | Limit lookup + UI bar helpers. |
| `lib/billing/entitlements.ts` | Feature flags, plan-derived defaults, override merge. |
| `lib/billing/billing-permissions.ts` | Capability gating for billing actions. |
| `lib/billing/access.ts` (existing) | Trial + paid state; reused as-is. |
| `services/billing/billing-service.ts` | `BillingEvent` audit log + customer upsert. |
| `services/billing/subscription-service.ts` | Stripe → DB sync; invoices; admin assign. |
| `services/billing/usage-service.ts` | Recompute counters + persist `UsageCounter` rows. |
| `services/billing/entitlement-service.ts` | Effective flags + override CRUD + limit checks. |
| `services/billing/billing-readiness-service.ts` | Billing snapshot fed to Go-live. |
| `actions/billing.ts` | Overrides + admin plan assignment. |
| `app/api/billing/checkout/route.ts` | Verified server-side Stripe Checkout session. |
| `app/api/billing/portal/route.ts` | Verified server-side Stripe Portal session. |
| `app/api/webhooks/stripe/route.ts` | Idempotent Stripe webhook (signature-verified). |

## Plan keys

`STARTER` · `PRO` · `TEAM` · `ENTERPRISE`. Defined in `PLAN_REGISTRY`.

## Billing modes

`STRIPE` · `MANUAL` · `INTERNAL_FREE` · `ENTERPRISE_CONTRACT` · `DEV_DISABLED`.

## Status detail

`TRIALING` · `ACTIVE` · `PAST_DUE` · `INCOMPLETE` · `INCOMPLETE_EXPIRED` ·
`CANCELLED` · `UNPAID` · `PAUSED` · `NONE` · `INTERNAL`.

The DB enum stays at 4 values; the widened status lives in
`subscriptions.status_detail` and is the UI source of truth.
