# Enterprise SSO + SCIM smoke setup (Era 139)

Era 139 certifies Enterprise SSO + SCIM wiring: LIVE SAML SSO for Okta, Microsoft Entra ID, and Google Workspace with RFC 7644 SCIM provisioning.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/enterprise/enterprise-sso-scim-live-service.ts` | Dashboard loader — SSO + SCIM admin views |
| `lib/enterprise/enterprise-sso-scim-live-builders.ts` | IdP cards, SCIM status, dashboard assembly |
| `lib/enterprise/enterprise-sso-scim-live-policy.ts` | Policy id, route, LIVE IdPs, SCIM API path |
| `app/dashboard/enterprise/sso-scim/page.tsx` | Enterprise SSO + SCIM page |
| `components/enterprise/enterprise-sso-scim-live-panel.tsx` | IdP cards, SCIM provisioning, LIVE badges |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:enterprise-sso-scim-live-era139` | Full era139 cert + wiring audit |
| `npm run test:ci:enterprise-sso-scim-live-era139` | Era139 + ENT-66 unit tests |
| `npm run test:ci:enterprise-sso-scim-live-era139:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Enterprise → SSO + SCIM**.
2. Confirm **SSO LIVE** and **SCIM LIVE** badges.
3. Review IdP cards — Okta, Microsoft Entra ID, Google Workspace.
4. Activate SCIM and rotate bearer token for Okta or Entra provisioning.
5. Run `npm run smoke:enterprise-sso-scim-live-era139` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `sso` | SAML SSO via workspace SSO admin + IdP cards |
| `scim` | RFC 7644 `/api/scim/v2` Users/Groups endpoints |
| `idps` | Okta, Microsoft Entra ID, Google Workspace |

## Artifact

Summary written to `artifacts/enterprise-sso-scim-live-smoke-summary.json` (gitignored).
