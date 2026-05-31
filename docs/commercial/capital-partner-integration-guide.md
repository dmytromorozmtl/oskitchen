# Capital partner integration guide

**Audience:** Lender engineering + KitchenOS Commercial  
**Related:** [`capital-partner-disclosures.md`](./capital-partner-disclosures.md) · [`config/commercial/capital-partners.json`](../../config/commercial/capital-partners.json)

---

## Overview

KitchenOS Restaurant Capital Phase 5 connects **live lender partners** to merchant revenue attestations and referral lifecycle webhooks. KitchenOS does not originate loans — partners pull signed revenue JSON and push status updates.

---

## Merchant flow (reference)

1. Merchant generates signed revenue export (`RevenueAttestation`).
2. Merchant consents on `/dashboard/analytics/capital#lender-offers`.
3. KitchenOS creates `CapitalPartnerReferral` + optional 7-day `CapitalAttestationShare`.
4. Merchant opens partner apply URL with `referralId` and `shareToken` query params.

---

## Partner pull API

```
GET /api/capital/lender-share/{shareToken}?partnerSlug={slug}
```

| Header | Value |
|--------|-------|
| `X-KitchenOS-Capital-Signature` | HMAC-SHA256 hex of `{partnerSlug}:{shareToken}` using webhook secret |

**Response 200:**

```json
{
  "ok": true,
  "referralId": "uuid",
  "partnerSlug": "flexcap-rbf-us",
  "attestation": { "payload": { ... }, "signature": "...", "verifyUrl": "..." }
}
```

**Errors:** `401` invalid signature · `403` IP not allowlisted · `404` expired/missing share

Optional IP allowlist: configure `pullIpAllowlist` on partner entry in `capital-partners.json`.

---

## Partner OAuth pull API (Phase 6)

Alternative to share-token HMAC when partner has `oauthEnabled: true`.

### Authorization flow

1. Merchant consents on `/dashboard/analytics/capital#lender-offers` with OAuth checkbox.
2. KitchenOS creates referral and redirects merchant to `/api/oauth/authorize` (`state=capital:{referralId}`).
3. Merchant approves scopes on KitchenOS consent screen.
4. Partner exchanges `code` at `POST /api/oauth/token` → receives `koa_*` bearer token.
5. Token exchange creates `CapitalLenderOAuthGrant` linking referral to installation.

### Attestation pull

```
GET /api/capital/lender/oauth/referrals/{referralId}/attestation?partnerSlug={slug}
Authorization: Bearer koa_...
```

**Response 200:** same attestation envelope as share-token pull, plus `"authMethod": "oauth"`.

### Referral metadata pull

```
GET /api/capital/lender/oauth/referrals/{referralId}?partnerSlug={slug}
Authorization: Bearer koa_...
```

Requires `read:capital_referrals` scope.

**Feature flag:** `CAPITAL_LENDER_OAUTH=1` in production.

OAuth client registry: `config/platform/partner-oauth-apps.json` — map via `oauthClientId` on partner entry.

---

## Partner webhook API

```
POST /api/webhooks/capital-lender/{partnerSlug}
```

| Header | Value |
|--------|-------|
| `X-KitchenOS-Capital-Signature` | HMAC-SHA256 hex of raw JSON body |
| `X-KitchenOS-Idempotency-Key` | Recommended — duplicate deliveries return `{ ok: true, duplicate: true }` |

**Body (v2 with offers):**

```json
{
  "referralId": "uuid",
  "status": "FUNDED",
  "fundedAmountCents": 15000000,
  "offerId": "offer-001",
  "offerTitle": "12-month RBF",
  "offers": [
    {
      "partnerOfferId": "offer-001",
      "title": "12-month RBF",
      "amountMin": 50000,
      "amountMax": 150000,
      "currency": "USD",
      "termLabel": "12 months",
      "rateLabel": "Factor rate set by lender",
      "deepLink": "https://apply.partner.example/offer-001"
    }
  ]
}
```

**Allowed statuses:** `OFFER_VIEWED`, `APPLIED`, `FUNDED`, `DECLINED`, `WITHDRAWN`

**FUNDED billing:** When `status=FUNDED` and partner has `referralFee: true`, KitchenOS accrues referral fee meters from `fundedAmountCents` × `referralFeeBps`.

---

## Secrets & environment

Per-partner keys in `capital-partners.json`:

| Field | Example |
|-------|---------|
| `webhookSecretEnvKey` | `CAPITAL_LENDER_FLEXCAP_US_WEBHOOK_SECRET` |
| `applyUrlEnvKey` | `CAPITAL_LENDER_FLEXCAP_US_APPLY_URL` |

Fallback: `CAPITAL_LENDER_WEBHOOK_SECRET` (dev/test only).

---

## Go-live checklist

1. Signed partner agreement + `partnerAgreementEffectiveDate` in config
2. `offerLifecycleStatus: "live"` — sandbox partners hidden from production merchants
3. Production webhook secret provisioned in secrets manager
4. Production apply URL template in env
5. `stateDisclosureUrl` populated with lender-approved disclosures
6. Smoke test: consent → pull attestation → webhook `APPLIED` → `FUNDED`
7. Platform review at `/platform/capital-partners`

---

## Support

Merchants: direct to **Analytics → Financing resources**. Do not estimate approval likelihood. Escalate partner incidents to Commercial + Platform billing.
