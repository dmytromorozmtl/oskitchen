# Auth E2E matrix — Owner, Manager, Cashier, Chef, Driver (P3-51)

**Policy:** `auth-e2e-matrix-p3-51-v1`  
**Department:** QA  
**Registry:** [`artifacts/auth-e2e-matrix-p3-51-registry.json`](../artifacts/auth-e2e-matrix-p3-51-registry.json)

---

## Scope

Post-login **route matrix** for five operator personas:

| Role | Staff template | Primary surfaces |
|------|----------------|------------------|
| **Owner** | `OWNER` | Full dashboard |
| **Manager** | `MANAGER` | POS, kitchen, staff, routes |
| **Cashier** | `CUSTOMER_SERVICE` | POS, today, orders |
| **Chef** | `PREP_COOK` | Kitchen, today |
| **Driver** | `DRIVER` | Routes, today |

---

## Credentials (staging / CI)

| Role | Email env | Password env |
|------|-----------|--------------|
| Owner | `E2E_LOGIN_EMAIL` | `E2E_LOGIN_PASSWORD` |
| Manager | `E2E_AUTH_MANAGER_EMAIL` | `E2E_AUTH_MANAGER_PASSWORD` |
| Cashier | `E2E_AUTH_CASHIER_EMAIL` | `E2E_AUTH_CASHIER_PASSWORD` |
| Chef | `E2E_AUTH_CHEF_EMAIL` | `E2E_AUTH_CHEF_PASSWORD` |
| Driver | `E2E_AUTH_DRIVER_EMAIL` | `E2E_AUTH_DRIVER_PASSWORD` |

Enable live E2E: `E2E_AUTH_E2E_MATRIX=true`

---

## Flow

1. **Validate auth matrix contract** — staff templates × capabilities (30 cells)
2. **Owner login smoke** — chromium-authed storage state
3. **Role route matrix smoke** — optional per-role login when creds configured

---

## Run

```bash
npm run check:auth-e2e-matrix-p3-51
npm run audit:auth-e2e-matrix-p3-51
E2E_AUTH_E2E_MATRIX=true npx playwright test e2e/auth-e2e-matrix-p3-51.spec.ts --project=setup --project=chromium-authed
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`
