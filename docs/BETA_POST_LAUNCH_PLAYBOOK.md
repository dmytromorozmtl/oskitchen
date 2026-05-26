# Beta Post-Launch Playbook (после green `beta:launch`)

Операции после Day 1 — guided beta, Week 1, Weeks 2–4, RBAC Phase D.

**Unified program (steps 0–5):** [`docs/BETA_PROGRAM_RUNBOOK.md`](BETA_PROGRAM_RUNBOOK.md) · `npm run beta:program`

| Фаза | Когда | Команда |
|------|-------|---------|
| Go live | Сразу после green report | `npm run beta:go-live -- --emails=...` |
| Week 1 | Ежедневно | `npm run beta:daily-ops` |
| Support | Week 1 setup | `npm run beta:support-setup` |
| Week 2–4 | Стабилизация | `docs/POST_BETA_EPIC.md` |
| RBAC D | По feedback | `docs/RBAC_PHASE_D.md` |

---

## Фаза 1 — Guided closed beta live (1–3 kitchens)

**Цель:** перевести пилотные кухни в статус `live` с onboarding pack.

```bash
# После green beta:launch report:
npm run beta:cohort -- --emails=chef1@,chef2@,chef3@
npm run beta:go-live -- --emails=chef1@,chef2@,chef3@
```

**Артефакты:**

- `docs/artifacts/BETA_COHORT_REGISTRY.json` — статус каждой кухни
- `docs/artifacts/BETA_GO_LIVE_PACK.json` — onboarding checklist

**Ручные шаги (на кухню, ~30 min):**

1. Onboarding call — `docs/BETA_LAUNCH_PACKAGE.md`
2. Staff invite + E2E staff visibility
3. Первый канал (Woo/Shopify/storefront)
4. Support channel (#beta-pilot)
5. Week-1 check-in в календаре

---

## Фаза 2 — Week 1 daily ops

**Цель:** ежедневный health check + support.

```bash
npm run beta:support-setup          # один раз
npm run beta:daily-ops              # каждое утро
```

**Cron (опционально):** GitHub Actions `Beta Daily Ops` — workflow_dispatch 09:00 UTC.

**Алерты в daily report:**

| Alert | Действие |
|-------|----------|
| preflight blocking | Pause kitchen, fix backfill/data |
| no orders 7d | Check channel / training |
| no staff | Remind owner to invite |

**Support channel:**

- `NEXT_PUBLIC_SUPPORT_EMAIL` — in-app mailto
- `BETA_SLACK_WEBHOOK_URL` — optional Slack digest
- Shared channel с пилотами

---

## Фаза 3 — Week 2–4 stable beta

**Цель:** стабильность → post-beta epic.

| Неделя | Фокус |
|--------|-------|
| 2 | Bug triage, webhook reliability, staff templates |
| 3 | Metrics review (orders/week, churn signals) |
| 4 | Go/no-go для post-beta epic |

```bash
npm run beta:daily-ops              # continue or move to 2×/week
npm run beta:kitchen-preflight -- --email=...  # before expansion
```

**Epic:** [`docs/POST_BETA_EPIC.md`](POST_BETA_EPIC.md) — Loyalty, SMS, P&L (не блокирует beta).

---

## Фаза 4 — RBAC Phase D (по feedback)

**Цель:** granular staff templates → workspace permissions.

**In-repo (Phase D foundation):**

- `lib/permissions/capability-to-workspace.ts`
- `lib/permissions/staff-template-workspace-permissions.ts`
- `requireWorkspacePermissionActor()` loads `StaffMember.roleType`

**Документация:** [`docs/RBAC_PHASE_D.md`](RBAC_PHASE_D.md)

**Пилот feedback → template tuning:**

- PACKER не должен видеть billing → уже enforced
- MANAGER needs integrations → template includes `integrations.manage`

---

## Registry statuses

| Status | Meaning |
|--------|---------|
| `pending` | Not yet live |
| `preflight_ok` | Green preflight, not launched |
| `live` | Guided beta active |
| `paused` | Daily ops flagged issues |
| `churned` | Left beta |

---

## Final expansion gate (kitchen #4+)

Before adding kitchens beyond initial 3:

```bash
npm run beta:launch -- --step=2 --step=4   # backfill + QA still green
npm run beta:kitchen-preflight -- --email=new@kitchen.com
npm run beta:go-live -- --emails=new@kitchen.com
```
