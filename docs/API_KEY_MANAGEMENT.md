# API Key Management

## Current behavior

- Keys hashed at rest; prefix visible; full secret shown **once** on creation (`ApiKeysPanel`).
- Enterprise / billing gates enforced in `actions/monetization.ts` (with superadmin bypass via billing access).

## Governance roadmap

- Persist `scopes_json` + `expires_at` on `api_keys` (migration).
- Enforce scopes at `/api/public/v1` router.
- Request metering table + “last used” automation (already have `last_used_at`).

## References

- UI scopes catalog: `lib/developer/api-scopes.ts`.
- Service: `services/developer/api-key-service.ts`.
