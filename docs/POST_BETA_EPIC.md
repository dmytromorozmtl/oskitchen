# Post-Beta Epic — Loyalty, SMS, P&L

**Статус:** Planned (не блокирует closed beta)  
**Окно:** Weeks 2–4 после stable beta  
**Gate для старт разработки:** 3 live kitchens + 2 недели без P0 security incidents

---

## Epic goals

| Module | Value | MVP scope |
|--------|-------|-----------|
| **Loyalty** | Repeat customer retention | Points per order, manual redeem |
| **SMS** | Pickup/delivery notifications | Twilio transactional, opt-in |
| **P&L dashboard** | Owner profitability view | Revenue − COGS − channel fees (read-only) |

---

## Prerequisites (from beta)

- [ ] `check:backfill` green on prod
- [ ] Workspace RBAC stable (Phase D templates validated)
- [ ] 3 kitchens with ≥50 orders/week combined
- [ ] Support channel operational

---

## Technical foundations (existing)

| Area | Codebase anchor |
|------|-----------------|
| Orders / customers | `services/orders/`, CRM |
| Notifications | `services/notifications/`, Resend |
| Costing | `services/costing/`, `docs/costing` |
| Reports | `app/dashboard/reports/` |

---

## Suggested sprint order

### Sprint 1 — SMS notifications (2 weeks)

- Env: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- Opt-in on `KitchenSettings`
- Events: order ready, delivery reminder
- Rate limits + audit log

### Sprint 2 — P&L read-only dashboard (2 weeks)

- Aggregate from orders + costing snapshots
- No QuickBooks export in MVP
- Owner-only (`billing.manage` or new `finance.view`)

### Sprint 3 — Loyalty MVP (3 weeks)

- `LoyaltyProgram` per workspace
- Points on `COMPLETED` orders
- Storefront + dashboard visibility

---

## Out of scope (post-beta+)

- Multi-location P&L consolidation
- SMS marketing campaigns
- Tiered loyalty / referrals

---

## Tracking

Create Linear/Jira epic `POST-BETA-2026` and link kitchen feedback from `BetaFeedback` / `AppFeedback`.
