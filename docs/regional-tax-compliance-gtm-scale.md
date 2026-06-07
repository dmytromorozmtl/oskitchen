# Regional Tax Compliance — GTM & Sales Scale Playbook

<!-- pm-gtm: absolute-final-pm-marketing-full-scale-v1 task-133 feature-88 -->

> **pm-gtm-hero-banner** · Checkout tax presets — **not tax advice**, **not automated filing**
>
> Four jurisdiction modes at ~25% readiness. Operators configure rates; OS Kitchen does **not** register, file, or determine nexus. Do **not** claim automated tax compliance or jurisdiction certification.
>
> **pm-gtm-dark-mode-note:** Plain markdown — readable in GitHub light and dark themes.

**Policy:** `regional-tax-compliance-gtm-scale-absolute-final-v1`  
**Feature guide:** [`docs/regional-tax-compliance.md`](./regional-tax-compliance.md) · `regional-tax-compliance-absolute-final-v1`  
**Product surface:** Storefront → Ordering → **StorefrontTaxSettingsPanel** · [`lib/storefront/tax-settings.ts`](../lib/storefront/tax-settings.ts)  
**Related:** [`international-expansion-plan.md`](./international-expansion-plan.md) · [`objection-handling.md`](./objection-handling.md) · [`/trust`](/trust)

---

## pm-gtm-icp-profile

### Ideal buyer

| Attribute | Fit |
|-----------|-----|
| Model | US/CA single-jurisdiction operator needing manual rate slots on storefront checkout |
| Pain | Spreadsheet tax rates pasted into POS; needs labeled presets (`us_sales`, `ca_sales`, `eu_vat`) |
| Stack | OS Kitchen storefront + optional TaxJar key in staging — no separate Avalara contract |
| Disqualifier | Needs automated filing, nexus determination, zip-based US rates, or HMRC MTD out of the box |

### Sales-safe wedge

> “Operator-configured tax presets on checkout — **operator responsibility** for registration and filing. We are **not tax advice** and **Not available** for automated remittance.”

**Pilot wedge:** ≤5-location US operator with one home state — `single` or `us_sales` preset, accountant verifies rates.

---

## pm-gtm-demo-hook

**15-minute demo path** (discovery → tax settings → receipt):

1. Open **Storefront → Ordering → Tax settings** — show four jurisdiction modes (`single`, `us_sales`, `ca_sales`, `eu_vat`).
2. Configure **us_sales** — federal + state slots with manual `ratePercent` (no auto zip lookup).
3. Place test checkout order — show line-item tax breakdown from `tax-engine.ts`.
4. Open [`docs/regional-tax-compliance.md`](./regional-tax-compliance.md) — walk **~25%** readiness and gap table (UK VAT, EU OSS deferred).
5. Close with [`/trust`](/trust) — no “tax compliant” marketing; optional TaxJar path in Phase 2.

**Talk track:** “Presets, not a compliance program — your CPA owns nexus and filing.”

---

## pm-gtm-objection-handling

| Objection | Response |
|-----------|----------|
| “Are you tax compliant?” | **Do **not** claim** compliance — we provide calculation presets. **Operator responsibility** for registration, nexus, and filing. |
| “Do you file sales tax / VAT?” | **Not available** — no remittance to tax authorities. |
| “Toast/Square handle tax for me.” | Competitors vary — our wedge is honest presets + optional TaxJar hook, not certified filing. |
| “We need UK VAT / EU OSS.” | Phase 3 UK VAT pilot on roadmap — legal review required; defer EU cross-border until advisor sign-off. |
| “Is this tax advice?” | **not tax advice** — internal guide + product settings only; operator must verify with advisor. |

---

## pm-gtm-pricing-talk-track

- **Standard pilot:** Tax presets included — no separate “tax module” line item on [`/pricing`](/pricing).
- **TaxJar optional path:** Enterprise staging key — eng-assisted setup; not default production without SOW.
- **Multi-jurisdiction expansion:** Custom enterprise minimum when UK/EU presets required — never bundle “automated compliance” in list pricing.
- **Accountant export:** Phase 5 tax summary CSV — label **BETA** until cert tests pass; **sales-safe** only after `/trust` update.

---

## pm-gtm-primary-cta

| Motion | CTA |
|--------|-----|
| US single-state prospect | “Start pilot Week 1 — configure `single` preset; CPA confirms rates before go-live.” |
| Multi-state / CA operator | “Discovery call — map to `us_sales` or `ca_sales`; share gap table from `docs/regional-tax-compliance.md`.” |
| UK/EU RFP | “Route to founder + finance — attach RFP tax clause; no verbal-commit on OSS/MTD dates.” |

Primary links: [`/trust`](/trust) · [`docs/regional-tax-compliance.md`](./regional-tax-compliance.md)

---

## pm-gtm-honesty-guardrails

**Do **not** claim:**

- Automated tax compliance, filing, nexus determination, or jurisdiction-specific certification  
- That preset labels imply correct rates for every province/state without operator verification  
- TaxJar or Shopify Markets tax sync as certified production defaults  
- UK HMRC Making Tax Digital or EU OSS/IOSS support today  

**Always label:** **not tax advice** · **operator responsibility** · **Not available** (automated filing) · **~25%** readiness · **sales-safe** talk tracks only  

**Human gate:** Founder + finance sign-off before any enterprise slide or contract appendix stating tax compliance scope.

---

## Wiring checklist

- [ ] `/trust` and `/pricing` free of “tax compliant” forbidden claims  
- [ ] Sales deck links to `docs/regional-tax-compliance.md` not verbal promises  
- [ ] Tax settings panel shows operator disclaimer (P0 backlog)  
- [ ] RFP template includes **operator responsibility** clause for multi-jurisdiction prospects  
