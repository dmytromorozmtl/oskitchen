# Era 17 — Pilot operator golden path (Tier 2)

**Policy:** `era17-pilot-operator-golden-path-v1`  
**Status:** **awaiting_operator_execution** — manual staging sign-off required  
**Duration:** ~45–60 minutes (owner + staff)  
**Environment:** staging first  
**Parent:** [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) Tier 2

Use this checklist after Tier 0/1 preflight PASS on the release commit. Does **not** substitute paid pilot GO/NO-GO or customer contract execution.

---

## Preconditions

| # | Check | Pass |
|---|--------|:----:|
| 1 | `npm run smoke:pilot-tier-preflight` — review `artifacts/pilot-tier-preflight-summary.json` | [ ] |
| 2 | Tier 0 governance bundles PASS on release SHA | [ ] |
| 3 | `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` PASS | [ ] |
| 4 | Staging URL + operator email recorded | [ ] |
| 5 | Test Woo **or** Shopify shop ready if integrations phase included | [ ] |

---

## Phase checklist

### 1. Onboarding (owner)

| Step | Action | Expected | Pass |
|------|--------|----------|:----:|
| 1.1 | Sign in as owner | Dashboard loads; workspace scoped | [ ] |
| 1.2 | Kitchen settings (name, timezone) | Persists on reload | [ ] |
| 1.3 | Create menu + 2 products | Visible in catalog | [ ] |
| 1.4 | Invite staff (orders + production roles) | Invite accepted | [ ] |

**Record:** `PILOT_GOLDEN_PATH_ONBOARDING_MANUAL=PASSED|FAILED`

### 2. Orders (owner + staff)

| Step | Action | Expected | Pass |
|------|--------|----------|:----:|
| 2.1 | Create manual order | Appears in Order Hub | [ ] |
| 2.2 | Advance production batch | Kitchen work items visible | [ ] |
| 2.3 | Complete packing | Status updates | [ ] |
| 2.4 | Staff sees owner orders in hub | Workspace-scoped — not empty | [ ] |

**Record:** `PILOT_GOLDEN_PATH_ORDERS_MANUAL=PASSED|FAILED`

### 3. Storefront (owner)

| Step | Action | Expected | Pass |
|------|--------|----------|:----:|
| 3.1 | Publish storefront menu | Public menu URL loads | [ ] |
| 3.2 | Test checkout (pay-later path) | Order in hub with correct totals | [ ] |
| 3.3 | BETA / qualified badges visible where required | Nav honesty (`era4-page-maturity-sweep-v1`) | [ ] |

**Record:** `PILOT_GOLDEN_PATH_STOREFRONT_MANUAL=PASSED|FAILED`

### 4. Integrations (owner — optional path)

| Step | Action | Expected | Pass |
|------|--------|----------|:----:|
| 4.1 | Connect Woo **or** Shopify test shop | CONNECTED; BETA banner | [ ] |
| 4.2 | Trigger test webhook / import | External order visible in channel UI | [ ] |
| 4.3 | CI wiring: `npm run smoke:channel-golden-path` | Cert wiring PASS locally | [ ] |

Detail: [`channel-pilot-playbook-era17.md`](./channel-pilot-playbook-era17.md). Live smoke PASS is separate (`smoke:woo-shopify-live`).

**Record:** `PILOT_GOLDEN_PATH_INTEGRATIONS_MANUAL=PASSED|FAILED`

### 5. POS (owner + cashier)

| Step | Action | Expected | Pass |
|------|--------|----------|:----:|
| 5.1 | Open POS terminal, test sale | Checkout completes | [ ] |
| 5.2 | RBAC deny spot check (staff without permission) | Clear denied state | [ ] |
| 5.3 | Confirm POS-only inventory messaging if depletion shown | No storefront depletion claim | [ ] |

**Record:** `PILOT_GOLDEN_PATH_POS_MANUAL=PASSED|FAILED`

### 6. KDS (kitchen staff)

| Step | Action | Expected | Pass |
|------|--------|----------|:----:|
| 6.1 | Kitchen display shows order items | Bump/recall works | [ ] |
| 6.2 | CI wiring: `npm run smoke:kds-staging` | Cert wiring PASS locally | [ ] |

**Not claimed:** rush-hour certification — qualified operational smoke only (`era16-operational-signoff-v1`).

**Record:** `PILOT_GOLDEN_PATH_KDS_MANUAL=PASSED|FAILED`

---

## Sign-off template

| Field | Value |
|-------|-------|
| Staging URL | `PILOT_GOLDEN_PATH_STAGING_URL` |
| Operator email | `PILOT_GOLDEN_PATH_OPERATOR_EMAIL` |
| Commit SHA | `PILOT_GOLDEN_PATH_COMMIT_SHA` |
| Duration (minutes) | `PILOT_GOLDEN_PATH_DURATION_MINUTES` |
| Notes | `PILOT_GOLDEN_PATH_NOTES` |

Run orchestrator after checklist:

```bash
npm run smoke:pilot-operator-golden-path
```

Review **`artifacts/pilot-operator-golden-path-summary.json`** — `phaseProofStatus` must be `proof_passed` for Tier 2 GO.

---

## Forbidden claims

Do **not** mark golden path complete if sales would imply:

- rush-hour KDS certified
- production certified for all tenants
- full marketplace live ops (DoorDash/Uber/Grubhub)
- offline POS or hardware certification

---

## Related docs

| Doc | Use |
|-----|-----|
| [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) | Tier 0–3 gates |
| [`PILOT_GOLDEN_PATH_CHECKLIST.md`](./PILOT_GOLDEN_PATH_CHECKLIST.md) | Extended manual detail (non-canonical supplement) |
| [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) | Pre-signature ICP |
| [`feature-maturity-matrix.md`](./feature-maturity-matrix.md) | Maturity source of truth |
