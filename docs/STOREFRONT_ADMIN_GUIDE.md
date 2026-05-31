# Storefront admin guide

## Console tabs

Use `/dashboard/storefront` and the horizontal tabs:

| Tab | Purpose |
| --- | --- |
| **Launch** | Readiness checklist before inviting customers |
| **Website** | Links to where public name, hero, and contact fields are edited |
| **Pages** | CMS pages and sections (builder iteration) |
| **Theme** | Logo, favicon, hero, colors, fonts |
| **Menu** | Active menu guidance; links to Weekly menus |
| **Products** | Storefront visibility, public URL slug, max quantity per order |
| **Overview** | Publishing, slug, toggles, active menu, SEO basics, terms |
| **Ordering** | Preorder / pay-later / online payment placeholder |
| **Fulfillment** | Pickup/delivery, fees, cutoff, closures |
| **Forms** | Contact/catering pipeline (submissions also under **Settings**) |
| **Domains** | Path / subdomain / custom domain — honest DNS checklist |
| **SEO** | Global and page-level SEO tools |
| **Analytics** | Visits and conversion events |
| **Notifications** | Email / Resend expectations |
| **Settings** | Contact email/phone, privacy text, recent submissions |
| **Advanced** | Test orders, redirects, JSON rules (placeholders) |
| **Preview** | Live iframe preview |

## Core workflow

1. **Menus** — create a weekly menu with active products.
2. **Storefront → Overview** — enable storefront, set slug, publish toggle, branding, fulfillment toggles, tagline, SEO fields, minimum order, optional checkout terms.
3. **Products** — set optional **public URL slugs** so guests can use `/s/{slug}/products/{slug}` as well as UUID links.
4. **Preview** — open public URL; drafts visible only when signed in as the owner.
5. **Domains** — read the checklist; configure DNS + hosting (e.g. Vercel), then set subdomain/custom domain fields. DNS is **not** automated from OS Kitchen.
6. **Analytics** — view aggregate visit + funnel events (privacy-hashed IP/UA on visits).

## Discount codes (MVP)

Create rows in `StorefrontDiscount` (admin UI for codes can follow). Checkout accepts **promo codes** server-side: percent off, fixed off, or free delivery. Uses are incremented in the same database transaction as the order.

## Further reading

- `docs/STOREFRONT_FINAL_AUDIT.md` — gaps, risks, priorities  
- `docs/STOREFRONT_CUSTOM_DOMAINS.md` — legacy domain doc; see `STOREFRONT_CUSTOM_DOMAINS_FINAL.md` for the condensed production checklist  
