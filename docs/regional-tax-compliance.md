# Regional Tax Compliance Guide

**Status:** Internal compliance guide — **not tax advice**, **not automated filing**  
**Audience:** Founder, finance, engineering, enterprise sales, operators  
**Policy:** `regional-tax-compliance-absolute-final-v1` (`lib/compliance/regional-tax-compliance-absolute-final-policy.ts`)  
**Related:** [`international-expansion-plan.md`](./international-expansion-plan.md) · [`eu-data-residency-roadmap.md`](./eu-data-residency-roadmap.md) · [`lib/storefront/tax-settings.ts`](../lib/storefront/tax-settings.ts) · [`/trust`](/trust)

---

## Purpose

Single reference for **what OS Kitchen supports today** vs **what operators must configure externally** for sales tax, VAT, and GST across regions. Restaurant operators remain **tax registrants** — OS Kitchen provides checkout calculation presets and optional TaxJar hooks, not CPA-grade compliance.

**Honesty rule:** Do **not** claim automated tax compliance, filing, nexus determination, or jurisdiction-specific certification. Use "operator-configured rates" and "BETA tax presets" in sales and `/trust` copy.

---

## Current posture

| Dimension | Status | Notes |
|-----------|--------|-------|
| Automated filing | **Not available** | No remittance to tax authorities |
| Nexus / registration | **Operator responsibility** | OS Kitchen does not register on behalf of tenants |
| Tax engine | **Manual presets + stacked components** | `lib/storefront/tax-engine.ts` |
| Jurisdiction modes | **4 presets** | `single`, `us_sales`, `ca_sales`, `eu_vat` in `tax-settings.ts` |
| Live rate lookup | **Optional TaxJar** | `TAXJAR_API_KEY` — not default in production |
| POS register tax | **Single rate from kitchen settings** | No multi-jurisdiction POS auto-detect |
| Shopify Markets tax | **BETA sync guard** | Bidirectional guard — not certified |
| Readiness (directional) | **~25%** | Presets exist; no compliance program |

---

## Supported calculation modes (product)

Configured under **Storefront → Ordering → Tax settings** (`StorefrontTaxSettingsPanel`).

| Mode | Region hint | Components | Included-in-price default |
|------|-------------|------------|-------------------------|
| **single** | Any | One configurable rate | Operator choice |
| **us_sales** | US | Federal + state slots (rates manual) | Excluded |
| **ca_sales** | CA | GST + PST/QST slots | Excluded |
| **eu_vat** | EU | Single VAT component (default 20% placeholder) | Included |

**Important:** Preset labels do **not** imply correct rates for every province/state — operators must set `ratePercent` per component and verify with their advisor.

---

## Gap analysis by region

| Region | Today | Gap | Phase 1 action |
|--------|-------|-----|----------------|
| **US sales tax** | Manual state + federal component slots | No zip-based nexus; no marketplace facilitator rules | Document TaxJar optional path; operator nexus checklist |
| **Canada GST/PST** | GST 5% preset + PST slot | No provincial auto-rates; no QST split for QC | CA operator setup guide in `/kb` |
| **UK VAT** | `eu_vat` preset reusable | No HMRC Making Tax Digital; no UK-specific receipt fields | UK advisor review before UK pilot ([`international-expansion-plan.md`](./international-expansion-plan.md)) |
| **EU VAT** | Single VAT rate placeholder | No OSS/IOSS; no B2B reverse charge | Legal review for cross-border food sales |
| **AU/NZ GST** | Not preset | No dedicated mode | Defer until Phase 3 demand |
| **Marketplace / delivery tax** | Channel fees tracked separately | Tax on marketplace commissions not modeled | Disclose in delivery commission docs |

### Priority backlog (P0 → P2)

| Priority | Item | Owner | Target |
|----------|------|-------|--------|
| **P0** | Forbidden claims audit — no "tax compliant" marketing | GTM | Immediate |
| **P0** | Operator disclaimer on tax settings panel | Product | Q3 2026 |
| **P1** | TaxJar smoke in staging when key present | Eng | Q3 2026 |
| **P1** | Receipt line-item tax breakdown on POS | Eng | Q4 2026 |
| **P1** | Export tax summary CSV for accountant | Eng | Q4 2026 |
| **P2** | UK VAT pilot preset (en-GB labels) | Product | Q1 2027 |
| **P2** | Province/state rate import (advisor CSV) | Eng | Q2 2027 |

---

## Timeline

| Phase | Window | Goal | Exit criteria |
|-------|--------|------|---------------|
| **Phase 0 — Baseline** | Jun 2026 (now) | Document presets + operator responsibility | This guide published; `/trust` honest labels |
| **Phase 1 — US/CA hardening** | Q3 2026 | Tax settings UX + disclaimers | Panel disclaimer; preset validation in CI |
| **Phase 2 — TaxJar path** | Q4 2026 | Optional live rates for US checkout | Staging smoke PASS with `TAXJAR_API_KEY` |
| **Phase 3 — UK VAT pilot** | Q1 2027 | en-GB receipt labels + advisor sign-off | 1 UK pilot operator configured |
| **Phase 4 — EU advisory** | Q2 2027 | OSS/IOSS decision memo (legal) | Written go/no-go — not product claim |
| **Phase 5 — Reporting exports** | H2 2027 | Accountant-friendly tax period CSV | Export API documented — **not filing** |

---

## Engineering wiring

| Module | Role | Path |
|--------|------|------|
| Tax presets | Jurisdiction modes | `lib/storefront/tax-settings.ts` |
| Checkout math | Stacked components | `lib/storefront/tax-engine.ts` |
| Admin UI | Rate configuration | `components/dashboard/storefront/storefront-tax-settings-panel.tsx` |
| Optional live rates | TaxJar API | `services/accounting/tax-service.ts` |
| Shopify cross-border | Market tax guard | `services/integrations/shopify-market-tax-service.ts` |
| Multi-currency | Display currency (not tax) | [`/dashboard/settings/currency`](/dashboard/settings/currency) |

Run preset tests: `tests/unit/storefront/tax-engine.test.ts`, `tests/unit/storefront/tax-provider.test.ts`.

---

## Human gate checklist

Before answering tax compliance questionnaires or RFPs:

- [ ] Confirm **no automated filing or nexus engine**
- [ ] State operator configures rates — OS Kitchen is **not tax advice**
- [ ] TaxJar = optional integration, not default production behavior
- [ ] UK/EU tax claims require legal + [`eu-data-residency-roadmap.md`](./eu-data-residency-roadmap.md) alignment
- [ ] Log questionnaire in CRM with readiness % from gap table above
- [ ] Run `npm run test:ci:regional-tax-compliance:cert` after guide updates

---

## Sales guidance

| Buyer ask | Safe response |
|-----------|---------------|
| "Do you handle sales tax?" | **Operators configure rates.** We provide checkout presets (US/CA/EU modes) and optional TaxJar — not filing or nexus. |
| "Are you tax compliant?" | **We are not a tax compliance product.** Your accountant remains responsible for registration and remittance. |
| "UK VAT ready?" | **Preset available** — UK pilot requires advisor-led setup; not HMRC-certified. |
| "Multi-state US automatic?" | **Not automatic** without TaxJar configured; even then, operator validates nexus. |
| "Shopify tax sync?" | **BETA** — bidirectional guard; verify per market before claiming parity. |

---

## Operator setup (quick reference)

1. Choose jurisdiction mode in **Storefront → Ordering → Tax**.
2. Set component rates (`ratePercent`) per your advisor's guidance.
3. Toggle **tax included in prices** for EU-style VAT menus.
4. Set workspace currency ([`/dashboard/settings/currency`](/dashboard/settings/currency)) — currency ≠ tax jurisdiction.
5. For US live rates (optional): configure `TAXJAR_API_KEY` in staging first.
6. Export orders periodically for accountant reconciliation — no built-in remittance.

---

## References

- [`international-expansion-plan.md`](./international-expansion-plan.md) — UK-first tax + VAT sequencing
- [`eu-data-residency-roadmap.md`](./eu-data-residency-roadmap.md) — GDPR / hosting (separate from tax)
- [`forbidden-claims-training.md`](./forbidden-claims-training.md) — no "tax compliant" claims
- [`docs/STOREFRONT_STRIPE_CURRENCY_ALIGNMENT.md`](./STOREFRONT_STRIPE_CURRENCY_ALIGNMENT.md) — currency vs tax display

---

## Reconsideration trigger

Engage tax advisor + engineering spike when:

1. First operator in a **new country** beyond US/CA requests go-live, or  
2. Enterprise RFP requires **automated sales tax** as hard requirement.

```bash
npm run test:ci:regional-tax-compliance:cert
```

Document advisor outcome in execution log — do not ship marketing claims until Phase exit criteria pass.
