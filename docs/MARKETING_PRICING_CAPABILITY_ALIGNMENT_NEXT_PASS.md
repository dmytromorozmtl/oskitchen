# Marketing / pricing — capability alignment (next pass)

## What changed this pass

- **Landing pricing (`components/landing/pricing.tsx`)** — TEAM tier bullet now states Uber modules require **partner access + credentials** (no implied live marketplace/dispatch).
- **Home metadata (`app/page.tsx`)** — clarifies marketplace channels need partner credentials/approvals.
- **Features grid (`components/landing/features.tsx`)** — POS Terminal row explicitly excludes Stripe Terminal hardware integration.
- **Capability matrix** — added `stripe_async_billing` as **DESIGN_READY**; webhook replay row references synchronous Stripe billing until outbox ships.
- **Platform health** — Sentry + rate limit + open webhook recovery counters reflect real configuration (no fake “all green”).

## Still review manually (content owners)

Cross-check narrative on:

- Homepage / product pages (`app/(marketing)`, `components/marketing/*`)
- Integrations hub (`app/integrations/*`)
- POS / storefront / trust / beta / demo pages

Use `CapabilityMatrixPanel`, `capability-copy`, and `CapabilityBadge` rather than absolute claims.

## Uber / SMS / offline / Terminal / compliance

Source of truth: `lib/capabilities/capability-matrix.ts`.

- **Uber Eats / Uber Direct** — partner-gated; no live dispatch without Uber program.
- **SMS** — `NOT_AVAILABLE` in matrix.
- **POS offline** — `NOT_AVAILABLE` / no offline checkout queue.
- **Stripe Terminal** — roadmap; KitchenOS stays browser-first.
- **SSO / SCIM / SOC2** — roadmap / legal positioning only.
