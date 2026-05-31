# Capital partner disclosures — OS Kitchen

**Effective:** 2026-05-31  
**Audience:** Product, Legal, Commercial, Support  
**Related:** [`docs/restaurant-capital-rfc.md`](../restaurant-capital-rfc.md) · [`config/commercial/capital-partners.json`](../../config/commercial/capital-partners.json)

---

## What KitchenOS provides (Phase 1)

- A **financing resources hub** at `/dashboard/analytics/capital` and `/resources/restaurant-financing`.
- Links to **third-party** government, educational, and (future) licensed lender resources.
- An **operational revenue summary** from KitchenOS order data — labeled honestly, not lender-certified.
- Audit logging when merchants click outbound partner links.

## What KitchenOS does **not** provide

- Loans, merchant cash advances, or revenue-based financing originated by KitchenOS.
- Credit decisions, pre-qualification, or approval guarantees.
- Personal credit pulls (FCRA).
- Tax, legal, or accounting advice.
- Automatic repayment holdbacks from POS or storefront checkout.

## Required copy on all capital surfaces

Use language equivalent to:

> OS Kitchen does not originate loans or make credit decisions. Financing resources link to third-party providers. Revenue figures shown are operational summaries from your KitchenOS orders — not bank deposits or lender-certified attestations.

## Referral compensation

If KitchenOS receives referral fees from a partner:

1. Disclose on the partner card before the outbound link.
2. Mark `referralFee: true` in `capital-partners.json`.
3. Update this document with effective date and partner name.

## Phase 3 — Lender offers (shipped)

Merchant flow on `/dashboard/analytics/capital#lender-offers`:

1. Generate signed revenue export (Phase 2).
2. Select lender offer partner and accept consent copy.
3. KitchenOS creates `CapitalPartnerReferral`, optional `CapitalAttestationShare` (7-day token).
4. Merchant opens partner apply URL with `referralId` + `shareToken` query params.

Partner integration:

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /api/capital/lender-share/[token]?partnerSlug=` | HMAC header `X-KitchenOS-Capital-Signature` over `{partnerSlug}:{token}` | Pull signed attestation JSON |
| `POST /api/webhooks/capital-lender/[partnerSlug]` | HMAC header over raw JSON body | Update referral status (`APPLIED`, `FUNDED`, `DECLINED`, etc.) |

Env: `CAPITAL_LENDER_WEBHOOK_SECRET` or per-partner `webhookSecretEnvKey` in `capital-partners.json`.

Audit actions: `capital.lender_consent_granted`, `capital.lender_webhook_status`.

## Partner onboarding checklist (future)

- [ ] Signed partner agreement reviewed by counsel
- [ ] State lending ad disclosures supplied by partner
- [ ] UDAAP review for targeting and copy
- [x] Data-sharing consent flow (Phase 3 prerequisite)
- [ ] Support macro for merchant questions

## Marketing blocklist

The following must **not** appear in sales or marketing without legal approval:

- instant funding
- guaranteed loan approval
- KitchenOS Capital (as a product name implying lending)
- pre-approved loan offer
- revenue-based loan approval

See also `config/commercial/capital-partners.json` → `forbiddenMarketingClaims`.

## Support guidance

When merchants ask about financing:

1. Direct them to **Analytics → Financing resources**.
2. Explain that KitchenOS summarizes **order volume** only.
3. Do not estimate approval likelihood.
4. Escalate partnership or attestation waitlist requests to Commercial.

---

## Phase roadmap reference

| Phase | Deliverable | Legal review |
|-------|-------------|--------------|
| 1 (shipped) | Resource hub + disclosures | Required — lightweight |
| 2 (shipped) | Signed revenue attestation export | Required — medium |
| 3 (shipped) | Embedded lender offers + partner pull API | Required — full program |
| 4 | Multi-lender marketplace | Required — full program |
