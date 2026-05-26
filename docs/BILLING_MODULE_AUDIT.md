# Billing module audit (KitchenOS)

**Date:** 2026-05-11
**Scope:** `/dashboard/billing`, `/pricing`, `/api/checkout`,
`/api/billing-portal`, `/api/webhooks/stripe`, the `Subscription` Prisma
model, the existing `lib/billing/access.ts` trial machinery, and the
shared `lib/plans/feature-registry.ts`.

## TL;DR

The current Billing surface is a **placeholder** that mostly works:

- It renders 4 plan cards + 1 enterprise mailto.
- It offers a Stripe Checkout button when env keys are present.
- It offers a Stripe customer-portal button when a customer exists.
- It has a working webhook endpoint that updates `Subscription` rows.
- It has a local-trial state machine via `TrialState`.

But there is **no audit trail, no invoice persistence, no usage counters,
no entitlement-override table, no plan-comparison page, and no
diagnostics UI**. The plan registry is duplicated in three files
(`lib/constants.ts`, `lib/plans.ts`, `lib/plans/feature-registry.ts`,
`components/marketing/pricing-page.tsx`). The webhook is **not
idempotent** (no `stripeEventId` storage), and the cancel page is a
single feedback form behind owner check.

## Findings

| # | Area | Current state | Risk | User impact | Recommended fix | Priority |
|---|------|---------------|------|--------------|------------------|----------|
| 1 | Plan registry | Duplicated across 4 files | Drift between marketing + dashboard | Confusing pricing | Single `lib/billing/plan-registry.ts` consumed everywhere | P0 |
| 2 | Subscription status enum | 4 values | Cannot represent past_due/unpaid/paused/incomplete properly | Wrong gating | Add `INCOMPLETE`, `INCOMPLETE_EXPIRED`, `UNPAID`, `PAUSED`, `NONE`, `INTERNAL` (kept additive) | P0 |
| 3 | Billing mode | Implicit only | Cannot mark workspace as INTERNAL/ENTERPRISE | Missing for free/internal workspaces | `BillingMode` enum on `Subscription` | P0 |
| 4 | Webhook idempotency | None | Duplicate Stripe events double-process | Wrong state | `BillingEvent.stripeEventId UNIQUE` | P0 |
| 5 | Invoice persistence | None | No invoice history in app | UX gap | `InvoiceRecord` table + `invoice.*` event handlers | P1 |
| 6 | Usage tracking | None | No clarity on limits used | Hard to plan upgrades | `UsageCounter` table + recomputation utility | P1 |
| 7 | Entitlement override | None | Cannot grant exceptions | Sales gating | `EntitlementOverride` table | P1 |
| 8 | Customer record | Implicit via Subscription.stripeCustomerId | Cannot pre-create a customer before subscription | Portal disabled until checkout | `BillingCustomer` table | P1 |
| 9 | Diagnostics UI | Banner only | Operators don't know what's missing | Friction | Diagnostics card with present/missing rows (no values) | P1 |
| 10 | Audit log | None | Cannot show "what changed" | Compliance | `BillingEvent` table | P1 |
| 11 | Period dates | Not stored | Cannot show next-bill date | UX | `currentPeriodStart/End`, `trialStart/End`, `cancelAtPeriodEnd` on Subscription | P1 |
| 12 | Checkout client trust | Plan-only enum from client | OK today but no price-id rejection in webhook | None today | Validate via registry on server; keep | P2 |
| 13 | Portal owner check | Owner only | Staff cannot open | OK; document | Keep server-side gate | P2 |
| 14 | Cancel page | Feedback form | OK | Friction | Add downgrade-blocker view (usage vs target) | P2 |
| 15 | Trial visibility | `lib/billing/access.ts` works | Trial only surfaces in middleware | Hard to see remaining days | Surface in Billing Center header | P2 |
| 16 | Plan comparison | No matrix | Cannot compare | UX | Plans tab with feature table | P2 |
| 17 | Pricing page reuse | Hardcoded duplicate | Drift | Marketing/app diverge | Render from `plan-registry.ts` | P2 |
| 18 | Enterprise CTA | mailto | OK | Friction | Keep + link contact form | P3 |
| 19 | Card data | Stripe-handled | OK | None | Document explicitly | P3 |
| 20 | Superadmin | Bypasses billing | Verified via `lib/billing/access.ts` | None | Reuse in new center | P0 |
| 21 | Dev safety | `DEV_BYPASS_BILLING` works | OK | None | Surface in diagnostics | P3 |
| 22 | Go-live readiness | No billing-readiness inputs beyond `hasBilling` | Workspace can launch without plan | Friction at growth | Add `billingMode`/`status` signals (out of scope: re-uses existing flag) | P3 |

## Priority legend

- **P0** — Payments, security, data integrity, non-regression.
- **P1** — Subscription lifecycle / operator visibility.
- **P2** — UX or future automation.
- **P3** — Nice to have.

## Safety contract

1. Do not break `/dashboard/billing`. The page must keep loading even when
   Stripe is fully unconfigured.
2. Do not enable checkout without `STRIPE_SECRET_KEY` + 3 price IDs.
3. Do not expose secret values in any rendered HTML (only present/missing).
4. Do not fake a paid subscription. The `Subscription.status` only
   advances to ACTIVE through a verified Stripe webhook event or an
   explicit superadmin override.
5. Do not delete or mutate existing rows; the migration is additive.
6. `workspace.moroz@gmail.com` bypasses every gate via the existing
   `isSuperAdminUser` helper.
7. Strict TypeScript and stable Prisma client.
