# Pricing page honesty pass

## Source of truth

- Prices and plan keys: `lib/billing/plan-registry.ts` (`PLAN_REGISTRY`).
- Marketing bullets: `components/marketing/pricing-page.tsx` — must not contradict registry features.

## Changes

- Pro: WooCommerce/Shopify described as **setup-ready with credentials**.
- Team: Uber modules remain **partner/credentials + geography** explicit; webhook line now reads **ingestion log** and **operator replay only where audited actions exist** (no fake universal replay).
- Enterprise: SLA/API wording scoped with “as contracted” / “where contracted”.
- Feature comparison row renamed to “Forecasting & webhook ingestion log”.
- Pricing hero + FAQ: Toast replacement denial, marketplace partner-access honesty, Stripe scope.

## Still manual

- Annual discount toggle remains a labeled placeholder — finance should confirm numbers before external launch.
