# SCIM enterprise self-serve UI (P2-72)

**Policy:** `scim-enterprise-self-serve-p2-72-v1`  
**Updated:** 2026-06-16  
**Route:** `/dashboard/enterprise/sso-scim`

Gap closure for Enterprise task P2-72: self-serve group provisioning and attribute mapping — no support ticket required.

## Self-serve capabilities

| Panel | Purpose |
|-------|---------|
| Group provisioning | Map IdP group names → `ADMIN` / `STAFF` / `PARTNER` |
| Attribute mapping | Configure SCIM field sources for userName, email, displayName, externalId, role |

Config persists in workspace owner `settingsCenterJson.scimEnterpriseSelfServe`.

## Default group mappings

- KitchenOS Admins → ADMIN
- KitchenOS Staff → STAFF
- KitchenOS Partners → PARTNER

## SCIM API apply

`POST /api/scim/v2/Users` loads workspace self-serve config and:

1. Applies attribute mapping to incoming payload
2. Resolves role from extension or IdP `groups[].display` per mapping

## CI

```bash
npm run check:scim-enterprise-self-serve-p2-72
```

## Artifact

`artifacts/scim-enterprise-self-serve-p2-72.json`

## Related

- P1-39 SCIM provision UI E2E: `docs/scim-provision-ui-e2e-p1-39.md`
- Enterprise SSO + SCIM LIVE: `lib/enterprise/enterprise-sso-scim-live-policy.ts`
