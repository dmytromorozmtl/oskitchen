# Storefront completion audit (KitchenOS)

This audit reflects the codebase after the storefront hardening pass. Priorities: **P0** trust / payments / delivery, **P1** completeness, **P2** SEO / analytics / UX maturity, **P3** future.

## Admin: `/dashboard/storefront/*`

| Route | Current behavior | Gaps / risks | Priority |
| --- | --- | --- | --- |
| Overview | Slug, publish flags, basics | Multi-brand still workspace-scoped | P3 |
| Launch | Launch checklist | Depends on other tabs truthfulness | P2 |
| Website | CMS-ish settings | — | P2 |
| Pages | Custom pages | — | P2 |
| Theme | URL-based assets | No first-party media upload without storage provider | P2 |
| Menu / Products | Links to catalog | — | P2 |
| Ordering | Rules + Stripe readiness card | Webhook must receive `checkout.session.completed` | P0 |
| Fulfillment | Fees, JSON zones, radius note | Radius not enforced without geocoding (documented) | P0 |
| Forms | Mostly placeholder | Full builder + public renderer not completed in this pass | P1 |
| Domains | Settings display | Automated DNS/SSL verification service not completed | P1 |
| SEO | Saves fields | Metadata pipeline OK; consent-aware analytics is manual | P2 |
| Analytics | Counters / events | Funnel dashboard maturity partial | P2 |
| Notifications | Templates | — | P2 |
| Settings | Owner-scoped | Multi-brand strategy doc | P3 |
| Advanced | Counts + notes | CRUD UI for redirects/rules/test order not completed | P1 |
| Preview | Signed cookie + iframe | Requires `STOREFRONT_PREVIEW_SECRET` or long `AUTH_SECRET` | P2 |
| **Discounts** | CRUD promo codes | Per-customer limits / scoped applies-to not in UI | P1 |

## Public: `/s/[storeSlug]/*` and `/order/[token]`

| Route | Behavior | Server / copy risks | Priority |
| --- | --- | --- | --- |
| Store home | Public shell | Draft hidden without owner session or preview cookie | P0 |
| Menu / cart | Client cart | Server still validates lines on submit | P0 |
| Checkout | Pay later + Stripe Checkout when configured | Client totals are indicative; server is source of truth | P0 |
| Product | PDP | Metadata should use `buildStorefrontMetadata` patterns | P2 |
| Contact / catering / FAQ / policies / `p/[pageSlug]` | Static + CMS | Forms attachment not wired end-to-end | P1 |
| Order confirmation | Token page | Pending payment state surfaced | P0 |
| `/order/[token]` | Guest lookup | Separate from storefront token flow | P2 |

## Required fixes (summary)

1. **P0**: Stripe keys + webhook for storefront `purpose=storefront_order` sessions; never mark paid without webhook.
2. **P0**: Delivery zones with postal/region matching enforced in `submitPublicStorefrontOrder`; radius honest.
3. **P1**: Forms builder, domains verification automation, advanced CRUD, analytics charts.
4. **P2**: Theme URL validation component, media library when storage exists, checkout promo preview server action.
