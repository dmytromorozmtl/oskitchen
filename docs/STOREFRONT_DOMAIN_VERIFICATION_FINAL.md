# Storefront domain verification (final)

**Implemented:** `services/storefront/storefront-domain-verification-service.ts`, dashboard domains UI (if present), `app/api/storefront/resolve-host/route.ts`, `_kos-verify.{host}` TXT pattern.

**Works:** TXT lookup, internal slug resolution via secret header, timestamps `customDomainLastCheckedAt` / error text when columns exist.

**Limits:** TLS status is informational only (hosting-dependent).

**Config:** `STOREFRONT_MIDDLEWARE_SECRET` for internal calls.

**QA:** Save token → publish TXT → run verify → status advances; resolve-host returns slug.

**Roadmap:** Automated SSL probe behind feature flag.
