# KitchenOS — GTM & Sales Playbook

**Version:** 1.0 · **Date:** 20 May 2026  
**Site:** https://os-kitchen.com  
**Positioning:** **POS + Kitchen Operations** (one system for front-of-house and back-of-house)

**Related:** [CAPABILITY_SIGNOFF_SALES.md](CAPABILITY_SIGNOFF_SALES.md) · [GOOGLE_ADS_LP_INDEX.md](GOOGLE_ADS_LP_INDEX.md) · Compare hub: `/compare`

---

## Positioning statement (use verbatim in decks)

> KitchenOS is a **cloud POS and kitchen operations platform** for food businesses that need the floor, the line, and production to stay in sync — without proprietary terminal leases or a patchwork of apps.

### Who we win with (ICP priority)

| Priority | Segment | Why now | Primary URL |
|----------|---------|---------|-------------|
| 1 | Weekly meal prep | Strongest product fit, preorder → production | `/solutions/meal-prep` |
| 2 | Full-service restaurant | POS + KDS + tables narrative | `/solutions/restaurants` |
| 3 | Ghost / multi-brand | Brand routing + shared KDS | `/solutions/ghost-kitchens` |
| 4 | Catering | Quotes + deposits (beta — disclose) | `/solutions/catering` |
| 5 | Fast-casual / café / bar | Quick POS + QR | `/solutions/fast-casual` |

### Who to qualify out early

- Needs **offline POS** or **Stripe Terminal** hardware → not 2026 scope  
- Expects **native Uber Eats / DoorDash** sync → redirect to Woo/Shopify or manual  
- Requires **SSO / SOC2** today → enterprise Q4 path only  
- Wants **SMS** as primary guest channel → email + in-app today  

---

## Homepage hero A/B test (May 2026)

| Variant | URL override | Message angle |
|---------|--------------|---------------|
| **A (control)** | `?h=a` | Outcome — FOH/BOH in sync |
| **B** | `?h=b` | Objection — no hardware lease |

**GA4 setup**

1. Custom dimension: `hero_variant` (event parameter)  
2. Experiment name: `homepage_hero_may2026`  
3. Events: `hero_ab_view`, `hero_ab_cta` (primary / secondary / video)  
4. Primary success metric: signup conversion within 7 days  

**Sales tip:** If a prospect mentions terminal cost, send Variant B link: `https://os-kitchen.com/?h=b`

---

## Pilot vs general availability (language)

| Say | Do not say |
|-----|------------|
| Paid pilot with white-glove onboarding | “Enterprise-ready day one” |
| 14-day trial to validate fit | “Unlimited free forever” |
| Beta features with written disclosure | “Fully GA” for catering deposits, Shopify, etc. |
| Illustrative operator quotes (pilot cohort) | Named logos without written permission |

Until GA gates in roadmap: sell **paid pilot**, not self-serve enterprise SLA.

---

## Objection handling

### “We already have a POS.”

> Most teams keep a legacy POS for payments but still run kitchen on paper or a second tablet. KitchenOS replaces the **second system** — KDS, production, and preorder — on devices you own. We can start with kitchen + preorder while you evaluate full floor POS.

### “Do you work in [city]?”

> Yes — we’re **cloud-delivered** across the US and Canada. No regional install visit. See `/service-areas` or send a geo ad LP (e.g. `/lp/restaurant-pos/nyc`).

### “What about delivery apps?”

Use redirect script from [CAPABILITY_SIGNOFF_SALES.md](CAPABILITY_SIGNOFF_SALES.md#partner--out-of-scope-redirect-script).

### “Is this SOC2?”

> Security practices are documented on `/trust`. Formal SOC2 attestation is roadmap — we do not claim it today.

---

## Demo flow (15 minutes)

1. **Hook (2 min):** One ticket from order → KDS → ready (match their segment)  
2. **Pain (3 min):** Ask what breaks today (missed tickets, Sunday spreadsheet, brand chaos)  
3. **Product (7 min):** Show only modules in capability matrix for their segment  
4. **Close (3 min):** 14-day trial + pilot onboarding; send capability sign-off PDF  

**Optional:** Set `NEXT_PUBLIC_DEMO_VIDEO_URL` in Vercel for homepage product tour embed.

---

## Pricing & TCO tools

| Asset | URL | Use when |
|-------|-----|----------|
| Pricing + TCO calculator | `/pricing` | CFO / owner asks about terminal lease vs cloud |
| ROI estimator | `/pricing` (lower section) | Ops lead — hours saved framing |
| Contact sales | `/contact-sales` | Enterprise, multi-location, custom SOW |

**HubSpot:** Set `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` + form IDs in Vercel to replace native inquiry forms.

**GA4 events:** `tco_calculator_update`, `customer_story_view`

---

## Customer stories

| Story | URL |
|-------|-----|
| Hub | `/customers` |
| Meal prep playbook | `/customers/meal-prep-weekly` |
| Restaurant KDS | `/customers/restaurant-floor-kds` |
| Ghost kitchen | `/customers/ghost-multi-brand` |

Monograms = **segment type**, not client logos. Upgrade to `verified` + logo only with written permission.

---

## Comparison pages (competitive deals)

| Page | Use when |
|------|----------|
| [/compare](https://os-kitchen.com/compare) | Hub — send early in evaluation |
| [/compare/restaurant-pos](https://os-kitchen.com/compare/restaurant-pos) | Toast / Square displacement |
| [/compare/meal-prep-software](https://os-kitchen.com/compare/meal-prep-software) | Spreadsheet / storefront-only stack |

**Rules:** Trademarks are identification only — not endorsement. Always pair with [CAPABILITY_SIGNOFF_SALES.md](CAPABILITY_SIGNOFF_SALES.md). GA4 event: `compare_page_view`.

---

## Email snippets

**After discovery**

> Thanks for the time today. KitchenOS unifies **[POS / preorder / KDS / production]** for **[segment]**. Here’s our capability sheet so we only commit to what’s live for your go-live: [link to CAPABILITY_SIGNOFF_SALES]. Start a trial: https://os-kitchen.com/signup

**Hardware objection**

> You can run counter and table service on iPad or Android — no proprietary terminal lease. Overview: https://os-kitchen.com/?h=b

---

## Sign-off

| Role | Date |
|------|------|
| Marketing | 20 May 2026 |
| Sales lead | |

*Update when capability matrix or ad LP index changes.*
