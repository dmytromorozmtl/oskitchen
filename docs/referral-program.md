# Referral program — owner-to-owner growth

**Policy:** `referral-program-absolute-final-v1` (Absolute Final Task 74) · upstream `referral-program-mkt32-v1`  
**Status:** **Product BETA** in-app · **GTM PRE-LAUNCH** until portfolio NPS ≥40  
**Updated:** 2026-06-06  
**Parent:** [`forbidden-claims-training.md`](./forbidden-claims-training.md) · [`product-hunt-launch-defer.md`](./product-hunt-launch-defer.md) · [`pilot-metrics-review-process.md`](./pilot-metrics-review-process.md) · [`free-pilot-tier-program.md`](./free-pilot-tier-program.md)

Restaurant owners share a unique link; when a new restaurant signs up, **both** receive one free month (30 days) on their OS Kitchen subscription. The **in-product mechanic is wired**; **public GTM** (homepage CTA, paid ads, sales deck emphasis) stays **PRE-LAUNCH** until pilot NPS proves operators would recommend us.

**Honest baseline (June 2026):** **0 paid pilots**, **NPS not captured**. Do not run referral-heavy campaigns until launch gates below pass. Program is for **kitchen operators only** — not unlimited consumer invites.

---

## Restaurateur program

| Surface | Route |
|---------|-------|
| **Primary hub** | `/dashboard/referrals` |
| **Settings** | `/dashboard/settings/referrals` |
| **Short link** | `https://os-kitchen.com/r/{CODE}` |
| **Growth analytics** | `/dashboard/growth/referrals` |

### Who qualifies as a referee

- Ghost kitchen, meal prep, commissary, or multi-concept operator ([`icp-definition-final.md`](./icp-definition-final.md))
- New OS Kitchen account — not self-referral or duplicate workspace
- Completes signup with valid referral code or `kos_ref` cookie

### Reward (not unlimited)

| Party | Credit |
|-------|--------|
| **Referrer** | 30 days free subscription extension |
| **Referee** | 30 days free on signup |
| **Billing audit** | `REFERRAL_FREE_MONTH` event per grant |

Do **not** promise stacked unlimited months in sales copy — tier bonuses require legal review.

---

## GTM enable gate (NPS ≥40)

| # | Gate | Threshold | Evidence |
|---|------|-----------|----------|
| **RG1** | Active pilots with NPS survey | **≥3** | Week-4 retro per [`pilot-metrics-review-process.md`](./pilot-metrics-review-process.md) |
| **RG2** | Portfolio NPS (promoters − detractors) | **≥40** | `artifacts/referral-program-nps-summary.json` (create on first capture) |
| **RG3** | Referral conversion smoke | ≥1 referee signup in staging | `e2e/referral-program.spec.ts` green |
| **RG4** | Forbidden claims lint | 0 violations on GTM copy | `lintReferralProgramCopy()` |
| **RG5** | ICP-only positioning | No consumer-style “invite anyone” ads | [`icp-definition-final.md`](./icp-definition-final.md) |

Run: `isReferralProgramGtmEnabled(npsScore, pilotsWithNps)` — returns `true` only when **RG1 + RG2** satisfied (`npsScore >= 40` and `pilotsWithNps >= 3`).

**Product remains available** in Settings → Referrals for early pilots — gate applies to **marketing amplification**, not code deletion.

---

## How it works (product — live in engineering)

1. **Link** — `https://os-kitchen.com/r/{CODE}` (also **Settings → Referrals**).
2. **Cookie** — Visiting the short link sets `kos_ref` for 90 days.
3. **Signup** — New account with a valid code creates a `ReferralEvent` and extends trial/subscription end dates for referee and referrer.
4. **Billing audit** — Each grant is recorded as `REFERRAL_FREE_MONTH` in `billing_events`.

| Constant | Value |
|----------|-------|
| Free month duration | 30 days (`REFERRAL_FREE_MONTH_DAYS`) |
| Billing event | `REFERRAL_FREE_MONTH` |
| Code format | `R-{HEX}` |

---

## Competitor comparison (honest)

| Product | Referral reward | Caveat |
|---------|-----------------|--------|
| Toast | Partner/reseller programs | No built-in owner-to-owner month credit |
| Square | Consumer referral credits | Not B2B restaurant chain |
| **OS Kitchen** | Both restaurants get **1 free month** automatically | **BETA** — prove conversion + NPS before scaling GTM |

---

## Sales pitch (after RG1–RG2 PASS)

> "Know another commissary or ghost-kitchen operator drowning in channel chaos? Send your OS Kitchen link. When they complete pilot onboarding, you both get a month free — tracked in billing, no support ticket."

**Before NPS gate:** use only in **1:1 pilot conversations** with BETA label — not homepage hero or paid social.

---

## Referral tiers (GTM — illustrative)

| Tier | Referrer milestone | Reward (planning) |
|------|-------------------|-------------------|
| **Starter** | 1 successful referee | 1 free month (current product default) |
| **Advocate** | 3 referees in 12 months | +1 bonus month (legal review before enable) |
| **Champion** | 5+ referees + NPS ≥9 personal | Co-marketing opt-in (case study path) |

**No tier promises** in public copy until legal SOW updates commission/bonus rules.

---

## NPS capture script (pilot Week 4)

Ask the owner: *"How likely are you to recommend OS Kitchen to another operator (0–10)?"*

| Score | Bucket |
|-------|--------|
| 9–10 | Promoter |
| 7–8 | Passive |
| 0–6 | Detractor |

**Portfolio NPS** = % promoters − % detractors (target **≥40** before RG2 PASS).

Store summary in `artifacts/referral-program-nps-summary.json`:

```json
{
  "pilotsSurveyed": 3,
  "promoters": 2,
  "passives": 1,
  "detractors": 0,
  "npsScore": 67,
  "gtmEnabled": true
}
```

---

## Forbidden referral program claims

- “Unlimited free months” or stacked credits beyond documented policy
- “Thousands of operators already referred”
- “Guaranteed income” / affiliate pyramid language
- “Works for any business” — ICP is kitchen operators only
- “Production-certified” or “enterprise-ready” because referral exists
- Public launch while **NPS unknown** or **<40**

Run `lintReferralProgramCopy(draft)` before homepage, email nurture, or sales deck updates.

---

## GTM launch checklist (when RG1–RG2 PASS)

1. Confirm `e2e/referral-program.spec.ts` green on staging.
2. Publish NPS summary artifact with `gtmEnabled: true`.
3. Add secondary CTA on `/pricing` — “Refer an operator” → Settings referrals (not hero until Week 8 review).
4. UTM convention: `utm_source=referral&utm_medium={owner_code}`.
5. Monthly review: referral→paid conversion vs support load.
6. Do **not** combine with Product Hunt launch same week ([`product-hunt-launch-defer.md`](./product-hunt-launch-defer.md)).

---

## Implementation

| Layer | Path |
|-------|------|
| Service | `services/referral/referral-service.ts` |
| Settings UI | `app/dashboard/settings/referrals/page.tsx` |
| Short link | `app/r/[code]/route.ts` |
| Signup hook | `lib/growth/referrals.ts` → `processReferralConversion` |
| E2E | `e2e/referral-program.spec.ts` |
| Policy | `lib/marketing/referral-program-policy.ts` (MKT-32) |
| Absolute Final policy | `lib/marketing/referral-program-absolute-final-policy.ts` |
| Panel UI | `components/dashboard/referral-program-panel.tsx` |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`GROWTH_REFERRALS.md`](./GROWTH_REFERRALS.md) | Engineering notes |
| [`partner-program-shopify-agencies.md`](./partner-program-shopify-agencies.md) | Agency referrals (MKT-31) — separate track |
| [`case-study-template.md`](./case-study-template.md) | Social proof before scaling referrals |
