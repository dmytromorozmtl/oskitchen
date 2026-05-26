# Monetization ready report

## Implemented

- **Pricing:** `/pricing` with Starter ($29), Pro ($79), Team ($199), Enterprise CTA, comparison grid, FAQ, Uber honesty banner.
- **Trials:** `TrialState` model, automatic upsert on signup, Stripe webhook converts trial, billing banner + owner redirect post-expiry, `DEV_BYPASS_BILLING` local bypass.
- **Gates:** Central `feature-registry`, `PlanGate` across integrations (Woo/Shopify/Uber), analytics, CRM, inventory, costing, forecast, routes, staff, locations, webhooks log, packing verify.
- **Billing UX:** Cancel flow `/dashboard/billing/cancel`, portal hook reuse, billing panel links.
- **Lifecycle:** `LifecycleEvent` / `LifecycleEmail` tables + safe enqueue helper + hooks on signup / onboarding / first menu.
- **Customer success:** `/dashboard/growth/customer-success` with health + retention snapshot + CSV export route.
- **Integrations health:** `/dashboard/integrations/health` manual checks persist `IntegrationHealthCheck`.
- **Branding:** `/dashboard/settings/branding` (Team gate) + Enterprise-only hide-brand toggle.
- **Reports hub:** `/dashboard/reports` linking CSV + operational surfaces.
- **Public Enterprise API:** `/api/public/v1/{orders,products,customers}` + `/dashboard/developer/api-keys`.
- **Retention helper:** `lib/customer-health.ts` combines growth health + textual risk hints.
- **Marketplace docs:** `docs/SHOPIFY_APP_MARKETPLACE_READINESS.md`, `docs/WOOCOMMERCE_EXTENSION_READINESS.md`.
- **Positioning docs:** `docs/POSITIONING.md`, `docs/ICP.md`, `docs/COMPETITIVE_ANALYSIS.md`.
- **Policies:** `docs/DATA_RETENTION_POLICY.md`, `docs/API_REFERENCE.md`.

## Billing status

Stripe Checkout + portal remain the system of record — configure live keys only after `docs/STRIPE_LIVE_MODE_SETUP.md` (existing).

## Remaining blockers

- Apply migration `20260506200000_monetization_layer` to production Postgres.
- Wire automated lifecycle emails (currently logs / manual via Resend).
- Add rate limiting + request signing audit for public API at infra edge.

## Recommended launch offer

14-day Pro trial + concierge onboarding for first 25 kitchens; Team upsell after Woo/Shopify channels stabilize.
