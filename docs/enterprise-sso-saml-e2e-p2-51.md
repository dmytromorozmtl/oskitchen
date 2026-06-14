# Enterprise SSO SAML E2E (P2-51)

**Policy:** `enterprise-sso-saml-e2e-p2-51-v1`  
**E2E:** `e2e/enterprise-sso-saml-e2e.spec.ts`

Gap P2-51 closes the enterprise SSO SAML path: Okta sandbox → SAML redirect → assertion callback → dashboard.

## Flow steps

| Step | Path |
|------|------|
| `login_entry` | `/login` + pilot workspace UUID |
| `saml_redirect` | `initiateWorkspaceSsoLogin` → Supabase SSO → Okta |
| `saml_assertion` | `/auth/callback?code=…&sso_workspace_id=…` → `completeWorkspaceSsoCallback` |
| `dashboard` | `/dashboard/*` post-auth |

## Live run (Okta staging vault)

```bash
E2E_ENTERPRISE_SSO_SAML=true \
SSO_STAGING_IDP_VENDOR=OKTA \
SSO_STAGING_WORKSPACE_ID=… \
SSO_STAGING_ALLOWED_DOMAIN=… \
SSO_STAGING_SUPABASE_PROVIDER_REF=… \
SSO_STAGING_OKTA_USERNAME=… \
SSO_STAGING_OKTA_PASSWORD=… \
E2E_STAGING_BASE_URL=https://staging.example.com \
npm run test:e2e:enterprise-sso-saml-e2e
```

Contract/wiring tests run without vault secrets. Full Okta browser login requires `SSO_STAGING_OKTA_*` credentials.

## CI wiring check

```bash
npm run check:enterprise-sso-saml-e2e-p2-51
```

## Related

- `docs/enterprise-sso-idp-staging-smoke-plan.md` — Okta tenant setup
- `e2e/sso-idp-smoke.spec.ts` — denial paths + staging reachability

## Artifact

`artifacts/enterprise-sso-saml-e2e-p2-51.json`
