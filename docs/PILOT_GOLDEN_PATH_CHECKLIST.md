# Paid pilot — manual golden path (P0-34)

**Owner:** Product + Ops  
**Environment:** Staging (then repeat on production tenant before GO)  
**Duration:** ~45–60 minutes with two personas (owner + staff)

Companion: [`PAID_PILOT_GO_NO_GO_CHECKLIST.md`](./PAID_PILOT_GO_NO_GO_CHECKLIST.md) · [`WORKSPACE_MIGRATION_RUNBOOK_STAGING.md`](./WORKSPACE_MIGRATION_RUNBOOK_STAGING.md)

---

## Preconditions

| # | Check | Pass |
|---|--------|:----:|
| 1 | `npm run workspace:backfill:status` exit 0 on target DB | [ ] |
| 2 | `npm run verify:staging-env` exit 0 | [ ] |
| 3 | Pilot nav profile active (no enterprise / experiments in sidebar) | [ ] |
| 4 | BETA banners visible on Sales channels + Storefront | [ ] |
| 5 | Test Woo/Shopify shop credentials configured (if integration path included) | [ ] |

---

## Persona A — Workspace owner

### A1 Onboarding & catalog

| Step | Action | Expected | Pass |
|------|--------|----------|:----:|
| A1.1 | Sign up / log in as owner | Dashboard loads; no platform tools | [ ] |
| A1.2 | Complete kitchen settings (business name, timezone) | Settings persist on reload | [ ] |
| A1.3 | Create menu + 2 products | Products visible in Menus; `workspace_id` set on new rows (DB spot-check optional) | [ ] |
| A1.4 | Open Nutrition labels command center | Stats load; no cross-tenant data | [ ] |
| A1.5 | Queue label print job for one product | Job appears in Print queue | [ ] |
| A1.6 | Mark job printed | Status → PRINTED | [ ] |

### A2 Orders & production

| Step | Action | Expected | Pass |
|------|--------|----------|:----:|
| A2.1 | Create manual order (dashboard) | Order in Order Hub / Today | [ ] |
| A2.2 | Advance production batch for order items | Work items visible on kitchen screen | [ ] |
| A2.3 | Complete packing task | Packing status updates | [ ] |
| A2.4 | Open delivery route (if enabled) | Route scoped to owner data only | [ ] |

### A3 Storefront & channels

| Step | Action | Expected | Pass |
|------|--------|----------|:----:|
| A3.1 | Publish storefront menu | Public menu URL loads | [ ] |
| A3.2 | Place test checkout on storefront | Order appears in hub with correct totals | [ ] |
| A3.3 | Connect Woo **or** Shopify (test shop) | Connection CONNECTED; BETA banner present | [ ] |
| A3.4 | Trigger test webhook / import sample | External order or product visible in channel UI | [ ] |

### A4 Import / export

| Step | Action | Expected | Pass |
|------|--------|----------|:----:|
| A4.1 | Start small CSV import (products) | Import job completes; rows in catalog | [ ] |
| A4.2 | Export products CSV | Download succeeds; row count matches | [ ] |

---

## Persona B — Staff member (same workspace)

| Step | Action | Expected | Pass |
|------|--------|----------|:----:|
| B1 | Invite staff with `orders.view` + `production.manage` | Invite email / link works | [ ] |
| B2 | Staff opens Order Hub | Sees **owner** orders, not empty | [ ] |
| B3 | Staff updates order status allowed by RBAC | Mutation succeeds; audit shows staff actor | [ ] |
| B4 | Staff opens Print queue | Sees owner label jobs (workspace-scoped) | [ ] |
| B5 | Staff attempts CRM delete without permission | Denied with clear error | [ ] |

---

## Persona C — Negative / security spot checks

| Step | Action | Expected | Pass |
|------|--------|----------|:----:|
| C1 | Open another tenant’s order URL (guessed UUID) | 404 or access denied | [ ] |
| C2 | Call cron URL without `CRON_SECRET` | 401 | [ ] |
| C3 | Verify marketing pages do not claim SMS / Uber prod / offline POS | Copy matches capability matrix | [ ] |

---

## Sign-off

| Role | Name | Date | PASS |
|------|------|------|:----:|
| Product | | | [ ] |
| Ops | | | [ ] |
| Engineering | | | [ ] |

**If any P0 step fails:** NO-GO until fixed or risk accepted in writing (link ticket in [`PAID_PILOT_GO_NO_GO_CHECKLIST.md`](./PAID_PILOT_GO_NO_GO_CHECKLIST.md)).

Automated prelude (no browser):

```bash
npm run pilot:next-step -- --list    # queue toward GO
npm run pilot:next-step              # run one step
npm run verify:pilot-readiness
```

Coverage map: [`PILOT_GOLDEN_PATH_AUTOMATION_MAP.md`](./PILOT_GOLDEN_PATH_AUTOMATION_MAP.md)
