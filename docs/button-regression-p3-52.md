# 30 critical pages button regression (P3-52)

**Policy:** `button-regression-p3-52-v1`  
**Department:** QA  
**Registry:** [`artifacts/button-regression-p3-52-registry.json`](../artifacts/button-regression-p3-52-registry.json)

---

## Scope

Button-by-button regression across **30 pilot-critical dashboard routes**:

- Shell controls on every page: navigation menu, account menu, theme toggle
- Page-specific primary actions where safe (quick-start Continue, KDS sound toggle, etc.)
- Non-destructive probes only — no checkout, delete, or payout mutations in smoke

Routes align with [`lib/smoke/authed-dashboard-rsc-routes.ts`](../lib/smoke/authed-dashboard-rsc-routes.ts) (first 30 entries).

---

## Credentials (staging / CI)

| Env | Purpose |
|-----|---------|
| `E2E_LOGIN_EMAIL` | Owner dashboard auth (chromium-authed storage) |
| `E2E_LOGIN_PASSWORD` | Owner password |
| `E2E_BUTTON_REGRESSION_P3_52=true` | Enable live Playwright smoke |

---

## Flow

1. **Validate button regression contract** — 30 pages × ≥3 probes (≥90 total)
2. **Authed page button smoke** — visit each route, probe buttons visible/enabled, click safe toggles

---

## Run

```bash
npm run check:button-regression-p3-52
npm run audit:button-regression-p3-52
E2E_BUTTON_REGRESSION_P3_52=true npx playwright test e2e/button-regression-p3-52.spec.ts --project=setup --project=chromium-authed
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`
