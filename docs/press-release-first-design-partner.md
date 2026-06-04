# Press release — first design partner announcement

**Task:** MKT-29  
**Status:** Draft template — **do not publish** until LOI countersigned + customer written approval  
**Updated:** 2026-06-03  
**Parent:** [`loi-design-partner-template.md`](./loi-design-partner-template.md) · [`loi-template-walkthrough.md`](./loi-template-walkthrough.md) · [`series-a-hold-notice.md`](./series-a-hold-notice.md) · [`forbidden-claims-training.md`](./forbidden-claims-training.md)

Use this doc when OS Kitchen signs its **first design-partner LOI** and the partner agrees to a **named public announcement**. This is not a launch press blast — it is a **single-partner pilot story** with honest BETA framing.

**Honest baseline (June 2026):** **0 signed LOIs** on file. Keep this doc internal until publish gates below are satisfied.

---

## Publish gates (all required)

| # | Gate | Evidence |
|---|------|----------|
| **G1** | Countersigned LOI on file | LOI-DP-001 PDF in legal folder |
| **G2** | Partner written approval for name + quote | Email or signed PR exhibit |
| **G3** | `verify-claims` CI green on draft | `.github/workflows/verify-claims.yml` |
| **G4** | No forbidden superlatives in final copy | `lintPressReleaseFirstDesignPartnerCopy()` |
| **G5** | Founder + partner PR contact identified | Media list row complete |
| **G6** | Series A hold respected | No investor KPIs or “Series A” language ([`series-a-hold-notice.md`](./series-a-hold-notice.md)) |

**Do not publish** if partner requests anonymity — use internal case study path ([`case-study-template.md`](./case-study-template.md)) instead.

---

## Pre-publish checklist

1. Replace all `[TOKENS]` below; run forbidden-claims lint on final HTML/plaintext.
2. Legal review: non-binding LOI language must **not** appear as contractual SLA in PR body.
3. Confirm partner segment matches ICP ([`icp-definition-final.md`](./icp-definition-final.md)) — ghost kitchen, commissary, or meal-prep.
4. Integration mentions: only modules in LOI Exhibit A with correct **BETA / pilot_ready / SKIPPED** labels.
5. Route press inquiries to `[MEDIA_CONTACT]` — not engineering Slack.
6. Archive final PDF + wire copy in `artifacts/press-release-first-design-partner/` (create on publish).

---

## Press release template (wire format)

### Headline options (pick one)

| ID | Headline |
|----|----------|
| **H1** | `[COMPANY]` partners with OS Kitchen on design-partner pilot for kitchen operations software |
| **H2** | OS Kitchen and `[COMPANY]` launch design-partner pilot for commissary and production workflows |
| **H3** | `[COMPANY]` joins OS Kitchen design-partner program to unify preorder, production, and margin visibility |

**Forbidden headlines:** “thousands of restaurants,” “replaces Toast,” “enterprise-ready day one,” “Series A,” “SOC 2 certified.”

---

### Subhead (required)

> `[CITY, STATE]` — `[COMPANY]`, a `[SEGMENT_LABEL]` operator, today announced a **non-binding design-partner letter of intent** with OS Kitchen to pilot a software-first kitchen operations platform spanning preorder storefront, production board, and owner briefing — with honest **BETA** labels on modules still in staged proof.

---

### Body — paragraph 1 (lead)

> `[COMPANY]` operates `[LOCATION_COUNT]` location(s) serving `[SEGMENT_DESCRIPTION]`. The operator signed a design-partner LOI with OS Kitchen to evaluate unified order intake, kitchen display workflows, and margin visibility on devices the team already owns — without proprietary POS terminal lock-in.

---

### Body — paragraph 2 (partner quote)

> “`[PARTNER_QUOTE]`” said `[PARTNER_NAME]`, `[PARTNER_TITLE]` at `[COMPANY]`. “`[PARTNER_QUOTE_CONTINUATION]`”

**Quote rules:** No fabricated metrics. No “production-certified integrations.” Partner must approve verbatim text.

---

### Body — paragraph 3 (OS Kitchen quote)

> “Design partners help us prove commissary and ghost-kitchen workflows in live kitchens before we scale sales narratives,” said `[FOUNDER_NAME]`, founder of OS Kitchen. “This LOI is a collaboration framework — not a claim that every integration is LIVE nationwide.”

---

### Body — paragraph 4 (scope — Exhibit A alignment)

> Under the LOI, the pilot scope includes `[MODULE_LIST]` — each labeled **pilot_ready**, **BETA**, or **PREVIEW** in product UI. Integrations outside scope remain **SKIPPED** until staging smoke artifacts PASS. OS Kitchen does not claim Toast-, Square-, or Lightspeed-class hardware certification.

---

### About `[COMPANY]` (boilerplate — partner supplies)

> `[COMPANY_BOILERPLATE]`

---

### About OS Kitchen (boilerplate)

> OS Kitchen is a kitchen operations platform for meal prep, ghost kitchens, and commissary operators — POS, storefront, production, packing, and owner briefing on web-first devices. The product is in **qualified beta / pilot_ready** for core workflows with **0 paid customers** as of `[PUBLISH_DATE]`. Learn more at [https://oskitchen.com](https://oskitchen.com) · [`/trust`](/trust) for BETA/PREVIEW definitions.

---

### Contact

> **Media:** `[MEDIA_CONTACT_NAME]`, `[MEDIA_EMAIL]`, `[MEDIA_PHONE]`  
> **Partner (optional co-contact):** `[PARTNER_MEDIA_CONTACT]`

---

## Personalization tokens

| Token | Source |
|-------|--------|
| `[COMPANY]` | Legal entity on LOI |
| `[CITY, STATE]` | Primary kitchen address |
| `[SEGMENT_LABEL]` | ghost kitchen · commissary · meal-prep |
| `[SEGMENT_DESCRIPTION]` | One line from [`icp-definition-final.md`](./icp-definition-final.md) |
| `[LOCATION_COUNT]` | LOI Exhibit B |
| `[PARTNER_NAME]` / `[PARTNER_TITLE]` | LOI signer |
| `[PARTNER_QUOTE]` | Partner-approved (≤40 words each half) |
| `[MODULE_LIST]` | LOI Exhibit A modules only |
| `[COMPANY_BOILERPLATE]` | Partner marketing one-paragraph |
| `[FOUNDER_NAME]` | Internal roster |
| `[PUBLISH_DATE]` | Embargo lift |
| `[MEDIA_CONTACT_*]` | Founder or PR delegate |

---

## Distribution channels (post-approval only)

| Channel | Timing | Notes |
|---------|--------|-------|
| Company blog `/blog` | Embargo +0 | Link `/trust` |
| LinkedIn (founder + company) | Embargo +0 | No paid boost until Week 2 |
| Local trade press | Embargo +1 | Commissary / ghost-kitchen vertical |
| Product Hunt | **Defer** — see [`product-hunt-launch-defer.md`](./product-hunt-launch-defer.md) (MKT-30) | Requires 3 pilots |

---

## Forbidden press release claims

Do not include in any published variant:

- “Thousands of restaurants” or implied install base
- “Production-certified” / “LIVE nationwide” for WooCommerce, Shopify, DoorDash, or Uber Eats unless artifact PASS
- “Beat Toast/Square on everything”
- “Enterprise-ready day one” / SOC 2 / SCIM in production
- “Toast-class rush hour KDS” or unsubstantiated SLO numbers
- “Unified delivery ops live today”
- Investor KPIs, ARR, or Series A narrative ([`series-a-hold-notice.md`](./series-a-hold-notice.md))
- Fabricated order-volume or margin percentages

Run: `lintPressReleaseFirstDesignPartnerCopy(draft)` before wire send.

---

## Post-publish checklist

| # | Action | Owner |
|---|--------|-------|
| 1 | Save PDF + plaintext to `artifacts/press-release-first-design-partner/` | Marketing |
| 2 | Update [`case-study-template.md`](./case-study-template.md) short-form slot (if partner approves) | Marketing |
| 3 | Log inbound media in CRM with UTM `utm_source=press&utm_campaign=first-dp-mkt29` | Marketing |
| 4 | **Do not** upgrade integration maturity labels based on PR alone | PM + Eng |
| 5 | Schedule Week 4 internal review — did PR create oversell objections on demo calls? | Sales |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`loi-outreach-email.md`](./loi-outreach-email.md) | Pre-LOI outreach (MKT-03) |
| [`loi-template-walkthrough.md`](./loi-template-walkthrough.md) | Live LOI review (MKT-28) |
| [`case-study-template.md`](./case-study-template.md) | Post-pilot metrics story |
| [`series-a-hold-notice.md`](./series-a-hold-notice.md) | Investor narrative hold (MKT-10) |
