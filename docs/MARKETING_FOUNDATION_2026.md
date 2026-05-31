# OS Kitchen — Marketing Foundation (2026)

**Site:** https://os-kitchen.com  
**Positioning:** POS + Kitchen Operations  
**Last updated:** 19 May 2026

---

## Sprint map (completed)

| Sprint | Focus | Key URLs |
|--------|--------|----------|
| 1–4 | Design system, homepage, solutions hub, ICP | `/`, `/solutions/*` |
| 5 | Case studies, OG, blog, Google Ads LPs | `/customers`, `/lp/*` |
| 6 | Hero A/B, demo video hook, local SEO | `/service-areas`, `?h=a\|b` |
| 7 | Geo ad LPs, pilot strip, GTM playbook | `/lp/restaurant-pos/nyc`, docs |
| 8 | Compare hub, Meta/LinkedIn pixels | `/compare/*` |
| 9 | TCO calculator, HubSpot forms, story detail | `/pricing`, `/customers/[id]` |
| 10 | Get-started hub, resources overhaul | `/get-started`, `/resources` |
| 11 | Mobile nav drawer, header cleanup | Hamburger menu · removed header Get started |
| 12 | Capability sheet + signup trust layer | `/capabilities`, signup badges, final CTA links |
| 13 | Foundation 100% — SEO, nav parity, integration shell fix | Sitemap, metadata, footer, `/book-demo` |

---

## Foundation 100% checklist (Sprint 13)

| Item | Status |
|------|--------|
| Integration subpages: single header/footer (layout-only shell) | Done |
| Sitemap: product, demo verticals, integrations, book-demo | Done |
| `marketingPageMetadata` on book-demo + integration hub + demo slugs | Done |
| Footer nav parity: Product, Demo, Book demo, Fast casual | Done |
| Logo gradient matches header (`primary-600` → `primary-800`) | Done |
| `/get-started` proof lines link to compare/capabilities/trust | Done |
| Demo vertical CTA → `/book-demo` (not mailto) | Done |
| Unified brand copy (`lib/marketing/brand-copy.ts`) | Done |

---

## Conversion architecture

```
Top of funnel          Mid funnel              Bottom funnel
─────────────────────────────────────────────────────────────
Organic / Ads    →    /get-started      →    /signup (trial)
Blog / Compare   →    /compare          →    /contact-sales
Solutions        →    /customers        →    /book-demo
```

**Primary CTA:** Start free trial (14-day, no credit card)  
**Enterprise CTA:** Contact sales + capability sign-off  
**Never use:** Fake logos, guaranteed ROI, “all delivery apps connected”

---

## Environment variables (Vercel)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Conversion tracking |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta ads |
| `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` | LinkedIn Insight |
| `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` | Sales/demo forms |
| `NEXT_PUBLIC_HUBSPOT_SALES_FORM_ID` | Contact sales embed |
| `NEXT_PUBLIC_HUBSPOT_DEMO_FORM_ID` | Book demo embed |
| `NEXT_PUBLIC_DEMO_VIDEO_URL` | Hero product tour embed |

---

## Sales enablement docs

- [GTM_SALES_PLAYBOOK.md](GTM_SALES_PLAYBOOK.md)
- [GOOGLE_ADS_LP_INDEX.md](GOOGLE_ADS_LP_INDEX.md)
- [CAPABILITY_SIGNOFF_SALES.md](CAPABILITY_SIGNOFF_SALES.md)

---

## GA4 custom events (marketing)

| Event | When |
|-------|------|
| `hero_ab_view` / `hero_ab_cta` | Homepage A/B |
| `ads_landing_view` / `ads_landing_cta` | `/lp/*` |
| `compare_page_view` | `/compare/*` |
| `tco_calculator_update` | Pricing TCO tool |
| `customer_story_view` | `/customers/[id]` |
| `view_pricing` | Pricing page load |

---

## Next (optional)

- Published case studies with written logo permission  
- HubSpot live on production env  
- Product tour video URL in Vercel  
- Self-serve capability PDF download (generated from matrix)
