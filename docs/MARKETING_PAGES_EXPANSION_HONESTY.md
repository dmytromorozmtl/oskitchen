# Marketing pages expansion — honesty notes

## Updated / added

- `/integrations` metadata now references honest status vocabulary (Live / Beta / setup-ready / partner-required / roadmap).
- `/solutions` index redirects to `/solutions/meal-prep` for a stable entry point.
- New solution slugs: `/solutions/cafes`, `/solutions/multi-brand` with presets + copy in `lib/public-copy.ts`.
- Solution marketing cards no longer imply Uber Eats is live-by-default — partner-gated language.

## Product hub

- `/product` lists POS Terminal plus honest module pages: order-hub, production, packing, routes, product-mapping, analytics (`lib/product-marketing.ts`, `app/product/[slug]/page.tsx`).
- `/product/pos-terminal` remains the deeper POS narrative.

## Still shallow (acceptable deferral)

- Per-page SEO deep dives for every product slug; pricing component copy not fully re-audited line-by-line in this pass.

## Guardrails

No SOC2/PCI claims, no Toast replacement, no fake Stripe Terminal hardware, no live DoorDash/Toast/Square claims without credentials.
