# Storefront completion report

Date: 2026-05-14 (workspace clock).  
Commands run: `npm run typecheck`, `npm run build`, `npm run lint`, `npm test` — all passing.

## Implemented

| Area | Details |
| --- | --- |
| Online payments | Real Stripe Checkout for `checkoutPayment=online` when Stripe env + settings allow; webhook branch distinguishes `metadata.purpose=storefront_order`; pay-later unchanged. |
| Delivery | `validateStorefrontDelivery` on checkout; JSON zones with postal/region matching; radius documented as non-enforced. |
| SEO / analytics injection | `StorefrontAnalyticsScripts` + `lib/storefront/storefront-seo.ts` export surface; GTM vs GA duplication avoided. |
| Preview | Signed HttpOnly preview cookie + API route; iframe flow in admin preview; `getStorefrontForPublicFromRequest` helper. |
| Discounts | `/dashboard/storefront/discounts` + server actions; subnav link; promo usage deferred for online payments until webhook. |
| Admin ordering | Stripe readiness card. |

## Explicitly not completed (next PRs)

- Forms builder MVP, domain DNS automation UI, advanced redirects/rules UI, guided test order, analytics charts, theme URL validator component, optional `?previewToken=` query support.

## Operational notes

- Configure Stripe webhook for `checkout.session.completed` on the same endpoint used for billing.
- Set `STOREFRONT_PREVIEW_SECRET` in production for predictable preview signing (or rely on long `AUTH_SECRET`).

## Suggested next PR order

1. Forms public + admin CRUD.  
2. Domain verification service + UI.  
3. Advanced tab CRUD + test-order action.  
4. Analytics charts + UTM breakdown.  
5. Theme validation helper + preview component.
