# Google Ads — Landing Page Index

**Last updated:** 20 May 2026  
**All `/lp/*` pages:** `noindex, follow` (paid traffic only — do not compete with organic solution pages)

**UTM pattern:** `utm_source=google&utm_medium=cpc&utm_campaign={campaign}` or `{campaign}-{metro}` for geo LPs.

---

## Base campaigns

| Campaign slug | URL | Conversion label | Primary keyword intent |
|---------------|-----|------------------|------------------------|
| restaurant-pos | https://os-kitchen.com/lp/restaurant-pos | `LP_RESTAURANT_SIGNUP` | restaurant POS, KDS |
| meal-prep-software | https://os-kitchen.com/lp/meal-prep-software | `LP_MEALPREP_SIGNUP` | meal prep software |
| catering-software | https://os-kitchen.com/lp/catering-software | `LP_CATERING_SIGNUP` | catering software |
| ghost-kitchen-software | https://os-kitchen.com/lp/ghost-kitchen-software | `LP_GHOST_SIGNUP` | ghost kitchen software |

---

## Geo campaigns (localized headline)

Use in ad groups targeted by city/metro. Final URL must match geo path.

| Metro | Restaurant POS | Meal prep | Catering | Ghost kitchen |
|-------|----------------|-----------|----------|---------------|
| NYC | `/lp/restaurant-pos/nyc` | — | — | `/lp/ghost-kitchen-software/nyc` |
| Los Angeles | `/lp/restaurant-pos/la` | `/lp/meal-prep-software/la` | — | — |
| Chicago | `/lp/restaurant-pos/chicago` | — | `/lp/catering-software/chicago` | — |
| Toronto | — | `/lp/meal-prep-software/toronto` | — | `/lp/ghost-kitchen-software/toronto` |
| Austin | `/lp/restaurant-pos/austin` | — | — | `/lp/ghost-kitchen-software/austin` |
| Miami | `/lp/restaurant-pos/miami` | — | `/lp/catering-software/miami` | — |

---

## GA4 events

| Event | When |
|-------|------|
| `ads_landing_view` | Page load (`landing`, `metro`) |
| `ads_landing_cta` | Primary CTA click |
| Google Ads conversion | `send_to` with label from table above |

---

## Copy rules

1. **No fake logos** on ad LPs — quotes labeled pilot cohort / illustrative.  
2. **Disclose beta** for catering deposits in sales call if LP drives catering leads.  
3. **Canonical organic pages** remain `/solutions/*` — ad LPs are conversion shells only.  
4. Match **keyword → headline** (geo LP must mention city in ad creative and URL).

---

## Adding a new metro

1. Add row to `lib/marketing/ads-geo-overrides.ts`  
2. Assign `campaigns: [...]` slugs  
3. Deploy — `generateStaticParams` builds static geo routes  
4. Update this index table  
