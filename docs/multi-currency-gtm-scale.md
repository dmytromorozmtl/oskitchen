# Multi-Currency Support — GTM & Sales Scale Playbook

<!-- pm-gtm: absolute-final-pm-marketing-full-scale-v1 task-131 feature-86 -->

> **pm-gtm-hero-banner** · Lightspeed-style per-location currency — **BETA** depth, not treasury-grade FX
>
> Per-location display currency + Stripe alignment. **No FX conversion** across the network rollup. Do **not** claim automatic conversion, treasury hedging, or Lightspeed-certified multi-currency until enterprise addendum.
>
> **pm-gtm-dark-mode-note:** Plain markdown — readable in GitHub light and dark themes.

**Policy:** `multi-currency-gtm-scale-absolute-final-v1`  
**Feature policy:** `multi-currency-support-absolute-final-v1`  
**Product surface:** [`/dashboard/settings/currency`](/dashboard/settings/currency)  
**Related:** [`transparent-pricing-sales-guide.md`](./transparent-pricing-sales-guide.md) · [`objection-handling.md`](./objection-handling.md)

---

## pm-gtm-icp-profile

### Ideal buyer

| Attribute | Fit |
|-----------|-----|
| Model | Multi-location operator with one storefront per region (US + EU pop-up, US + Canada commissary) |
| Pain | Reporting in USD while locations sell in EUR/CAD; Stripe charge currency mismatches |
| Stack | OS Kitchen storefront + Stripe Connect; no separate ERP FX module |
| Disqualifier | Needs automatic FX conversion, intercompany revaluation, or certified treasury reporting |

### Sales-safe wedge

> “Set display and charge currency per location — honest network rollups with **No FX conversion — network totals shown per currency only**.”

---

## pm-gtm-demo-hook

**15-minute demo path** (discovery → settings → storefront):

1. Open **Settings → Currency** — show workspace default USD.
2. Override **Paris location** to EUR via tax settings JSON — show inherits vs explicit badge.
3. Open **storefront row** — confirm Stripe-aligned currency for that slug.
4. Show **network rollup label** — totals stay per currency; no blended FX math.
5. Close with pilot scope: ≤5 locations, manual accountant export if multi-currency books required.

**Talk track:** “This is Lightspeed-style location currency — we label BETA because we do not auto-convert or hedge.”

---

## pm-gtm-objection-handling

| Objection | Response |
|-----------|----------|
| “Can you convert everything to USD for my P&L?” | Not today — **No FX conversion** on network rollups. Export per-currency totals; accountant maps FX offline. |
| “Is this Lightspeed parity?” | **Lightspeed-style** per-location display currency — honest **BETA** label; do not claim certified parity. |
| “Stripe already handles currency.” | We align storefront charge currency to location settings — reduces mischarge disputes; Stripe fees still apply per their schedule. |
| “We need ECB daily rates.” | **SKIPPED** — no live rate feed. Do not promise central-bank FX tables. |

---

## pm-gtm-pricing-talk-track

- **Pilot tier:** Multi-currency included in Enterprise pilot when ≤5 locations — no FX module surcharge.
- **Expansion:** Custom FX export or ERP bridge is **partner-gated** — quote separately after LOI.
- **Competitive frame:** Toast/Square often single-currency per account; our wedge is **explicit per-location override** with honest rollups.
- Anchor to [`/pricing`](/pricing) — use **sales-safe** list pricing; never quote uncertified FX automation.

---

## pm-gtm-primary-cta

| Motion | CTA |
|--------|-----|
| Discovery call | “Send your location list + current charge currencies — we’ll map a pilot currency matrix in 48h.” |
| Demo follow-up | “Configure your first non-USD location in `/dashboard/settings/currency` during Week 1.” |
| Enterprise RFP | “Request multi-currency addendum — includes per-location matrix + accountant export checklist.” |

Primary link: [`/dashboard/settings/currency`](/dashboard/settings/currency)

---

## pm-gtm-honesty-guardrails

**Do not claim:**

- Automatic FX conversion or blended network totals in a single reporting currency  
- Lightspeed-certified or treasury-grade multi-currency  
- Live central-bank rate tables or hedging  
- Production-certified for all Stripe Connect edge cases  

**Always label:** **BETA** on currency override UI · **No FX conversion** on rollups · **sales-safe** talk tracks only  

**Human gate:** Founder approval before any enterprise slide stating “multi-currency certified.”

---

## Wiring checklist

- [ ] Currency settings demo environment with ≥2 location codes  
- [ ] Storefront slug aligned to non-USD test location  
- [ ] Battle card updated with honesty guardrails above  
- [ ] LOI template notes FX limitation when prospect mentions consolidation reporting  
