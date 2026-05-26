# Signed first-party analytics beacon

## Implemented files

- `lib/storefront/analytics-signature.ts` — HMAC helpers (timing-safe compare).
- `lib/storefront/storefront-analytics-token.ts` — encode/decode payload (`v`, `sid`, `slug`, `iat`, `exp`, `src`).
- `services/storefront/storefront-analytics-signing-service.ts` — issue/verify + client payload builder.
- `app/api/storefront/analytics/route.ts` — strict vs optional token verification after consent checks.
- `app/s/[storeSlug]/layout.tsx` — embeds JSON in `#kos-storefront-fp-analytics` (`fpToken`, `strictIngest`, `ingestDisabled`, `mode`).
- `lib/storefront/storefront-first-party-ingest.ts` — sends `x-kos-fp-analytics-token` when present; respects `ingestDisabled`.
- `components/storefront/storefront-analytics-beacon.tsx` — skips effects when `ingestDisabled`.

## Configuration

| Variable | Meaning |
| --- | --- |
| `STOREFRONT_ANALYTICS_SIGNING_SECRET` | Min 16 chars; used to sign tokens. **Do not commit.** |
| `STOREFRONT_ANALYTICS_STRICT_INGEST` | `true` — POST requires valid, non-expired token matching slug + storefront id. |

## Behaviour

- **Strict + secret:** Browser receives `fpToken`; API rejects missing/invalid/expired tokens with **403**.
- **Strict + no secret:** Layout logs a safe warning, sets `ingestDisabled`, beacon does not run (SSR continues).
- **Non-strict:** Token optional; if a token is sent and invalid → **403** (do not ignore bad tokens). If omitted → legacy consent headers apply.
- **Consent:** `firstPartyAnalyticsMode` (`ALWAYS_ON` / `CONSENT_REQUIRED` / `DISABLED`) unchanged; strict mode is orthogonal.

## QA checklist

1. Non-strict, no secret: beacon works with headers only (published storefront).
2. Strict + secret: valid token → 200; missing → 403; tampered → 403; wrong slug → 403.
3. Expired token → rejected.
4. `DISABLED` mode → no client POST.

## Roadmap

- Optional per-IP / per-slug rate limiting.
- Short-lived refresh without full layout churn (client refresh endpoint).
