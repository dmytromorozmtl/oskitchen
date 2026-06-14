# SCIM provision UI E2E (P1-39)

**Policy:** `scim-provision-ui-e2e-p1-39-v1`

Gap closure for QA task P1-39: IdP → user group → provision → delete → deprovisioning.

## Chain

```
IdP config → user group → provision user → deactivate (delete) → verify deprovisioned
```

| Step | Implementation |
|------|----------------|
| `configure_idp` | Seed workspace SCIM token (IdP connector) |
| `assign_user_group` | GET `/api/scim/v2/Groups` → resolve `group-staff` |
| `provision_user` | POST `/api/scim/v2/Users` with STAFF role |
| `verify_dashboard_ui` | User visible as Active on SSO/SCIM dashboard |
| `deactivate_user_ui` | Click deactivate → status Revoked |
| `verify_deprovisioned` | DB: `active=false`, workspace membership removed |

## CI

```bash
npm run check:scim-provision-ui-e2e-p1-39
```

Live Playwright:

```bash
E2E_SCIM_PROVISION_UI=true E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... \
  npm run test:e2e:scim-provision-ui-e2e
```

## Artifact

`artifacts/scim-provision-ui-e2e-p1-39.json`
