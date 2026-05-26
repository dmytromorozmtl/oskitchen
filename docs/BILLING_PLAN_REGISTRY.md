# Plan registry

`lib/billing/plan-registry.ts` is the single source of truth for plans.
Marketing (`/pricing`) and dashboard (`/dashboard/billing/*`) both read
from it. The Stripe price id is resolved from the env key declared on
each plan — clients never supply a price id.

## STARTER — $29 / month
- 1 active menu, 100 orders/month, 0 integrations, 3 staff, 1 brand / 1 location, 1 storefront.
- Manual orders + storefront.
- Modules: orders, production, menu, staff, training, billing.
- Support: community.

## PRO — $79 / month
- Unlimited menus, 1,000 orders/month, 3 integrations, 10 staff, 2 brands / 2 locations.
- WooCommerce + Shopify + storefront + packing labels.
- Analytics, CRM, inventory lite, costing.
- Support: email.

## TEAM — $199 / month
- 10,000 orders/month, unlimited integrations, unlimited staff, 5 brands / 5 locations.
- WooCommerce + Shopify + Uber Eats + Uber Direct.
- Packing verification, routes, forecasting, advanced production, white-label, webhook replay.
- Support: priority.

## ENTERPRISE — Custom
- All limits unlimited.
- Multi-location, API access, SSO/OIDC, dedicated support.
- Not checkoutable via Stripe self-serve; contact sales.

## Adding a plan

1. Add the enum value in `prisma/schema.prisma` (`SubscriptionPlan`) and migrate.
2. Add the matching entry in `PLAN_REGISTRY`.
3. Add the env key to `clientEnvSchema` in `lib/env.ts`.
4. Decide checkoutable yes/no.

## Adding a feature flag

1. Add the key to `PlanFeatureSet` in `lib/billing/plan-registry.ts`.
2. Set its default per plan in each plan entry.
3. Add the label in `FEATURE_LABEL` in `lib/billing/entitlements.ts`.
4. (Optional) Add a `PlanGate` server check at the entry point.
