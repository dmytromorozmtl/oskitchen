# Storefront redirect edge cases

## Implemented behaviour

| Area | Behaviour |
| --- | --- |
| Default depth | **One** redirect resolution per middleware request unless `STOREFRONT_REDIRECT_FOLLOW_CHAIN=true`. |
| Max chain | Up to **3** hops when chain mode on (`STOREFRONT_REDIRECT_CHAIN_MAX` optional, clamped 1–3). |
| Loops | `visited` suffix set + `wouldRedirectLoop` guard; unsafe graphs return **no redirect**. |
| Sensitive paths | `/checkout`, `/order`, `/order-confirmation`, `/pay`, `/payment`, `/stripe` blocked **unless** `STOREFRONT_REDIRECT_ALLOW_SENSITIVE_PATHS=true`. Applies to **source** path and **destination** suffix. |
| hitCount | Incremented once on the **first** matched rule in a resolved chain (when `incrementHits` is true). |
| Custom domains | Vanity host rewrite runs **after** optional `/s/` redirect block in `middleware.ts`; rules remain path-based on internal `/s/{slug}` URLs. |

## Files

- `lib/storefront/storefront-redirects.ts` — env toggles + `isSensitiveStorefrontRedirectPath`.
- `services/storefront/storefront-redirect-service.ts` — resolution + chain + hit increment.
- `app/api/storefront/resolve-redirect/route.ts` — internal middleware helper (secret header).
- `middleware.ts` — calls resolve API when `STOREFRONT_REDIRECTS_ENABLED` + secret.

## Operator notes

- Test redirects using the canonical `/s/{slug}` URL even when customers use a vanity domain.
- Enabling sensitive redirects is **opt-in** and should be rare.

## Roadmap

- Optional per-rule “allow sensitive targets” flag (not implemented — would need schema + admin UI).
