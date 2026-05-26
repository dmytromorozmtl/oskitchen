# Storefront domain verification

**Status:** Automated DNS polling + SSL state machine not implemented in this pass.

## Current

- `StorefrontDomain` model supports tokens and status for future automation.
- Custom host routing remains in `middleware.ts` + `app/api/storefront/resolve-host/route.ts`.

## Next PR

- `services/storefront/storefront-domain-service.ts` with TXT/CNAME checks (no secrets in responses).
- Admin UI card listing records, last check time, manual instructions fallback.
