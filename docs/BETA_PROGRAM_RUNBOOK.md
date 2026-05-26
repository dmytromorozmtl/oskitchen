# Beta Program Runbook — Steps 0–5

Единая программа от Day 1 до post-beta epic. **Старт:** `docs/BETA_START_HERE.md`

| Команда | Назначение |
|---------|------------|
| `npm run beta:setup` | Wizard: env + checklist + readiness |
| `npm run beta:preflight` | Env format + HTTP/DB + step guards |
| `npm run beta:run-phase -- --list` | Phases A–F (setup → track) |
| `npm run beta:staging-prep` | Staging: migrate + backfill + verify --strict |
| `npm run beta:program` | Статус + **следующий шаг** |
| `npm run beta:program -- --next` | Выполнить рекомендуемый шаг |
| `npm run beta:env-check -- --step=0` | Проверка env |
| `npm run beta:record-incident` | P0 tracking для go/no-go |

**Summary artifact:** `docs/artifacts/BETA_EXECUTIVE_SUMMARY.md`

---

## Step 0 — Сейчас: Day 1 complete

```bash
export SMOKE_BASE_URL="https://staging..."
export SMOKE_PUBLIC_API_KEY="kos_..."
export SMOKE_DELIVERY_CONNECTION_ID_OTHER="uuid"
export E2E_LOGIN_EMAIL="..."
export E2E_LOGIN_PASSWORD="..."
export DATABASE_URL="..."

npm run beta:day1-complete
```

**Gate:** `docs/artifacts/BETA_LAUNCH_REPORT.json` → `readyForBeta: true`  
**Artifacts:** `BETA_LAUNCH_REPORT.html`, `BETA_PROGRAM_STATE.json`

---

## Step 1 — Сразу после: Go live

```bash
export BETA_COHORT_EMAILS="chef1@,chef2@,chef3@"
npm run beta:go-live -- --emails=chef1@,chef2@,chef3@
```

**Gate:** `BETA_COHORT_REGISTRY.json` → `live`  
**Artifact:** `BETA_GO_LIVE_PACK.json`

---

## Step 2 — Week 1: Daily ops + Slack

```bash
npm run beta:support-setup
export NEXT_PUBLIC_SUPPORT_EMAIL="team@yourdomain.com"
export BETA_SLACK_WEBHOOK_URL="https://hooks.slack.com/..."

npm run beta:daily-ops   # каждое утро
```

**Gate:** `BETA_DAILY_OPS_YYYY-MM-DD.json` → `unhealthy: 0`  
**Slack:** автоматический digest при `BETA_SLACK_WEBHOOK_URL`

---

## Step 3 — Week 2: Review

```bash
npm run beta:week2-review
```

**Gate:** `BETA_WEEK2_REVIEW.md` + `BETA_STAFF_FEEDBACK.json`  
**Действие:** собрать feedback по staff templates → step 5

---

## Step 4 — Week 3–4: Go/no-go

```bash
npm run beta:go-no-go
npm run beta:go-no-go -- --record-decision=go --by="Founder Name"
```

**Criteria:**

| Check | Default |
|-------|---------|
| Live kitchens | ≥ 3 |
| Total 7d orders (cohort) | ≥ 30 |
| Unhealthy daily ops ratio | ≤ 30% |
| P0 incidents | 0 (`BETA_P0_INCIDENTS.json`) |

**Gate:** `BETA_GO_NO_GO.json` → `decision: go`  
**Epic:** [`docs/POST_BETA_EPIC.md`](POST_BETA_EPIC.md)

---

## Step 5 — По feedback: Tune templates

```bash
npm run beta:tune-templates -- --diff
# Edit lib/permissions/permission-matrix.ts
npm test -- tests/unit/staff-template-workspace-permissions.test.ts
npm run verify:staff-parity -- --owner-email=OWNER@
```

**Artifact:** `BETA_TEMPLATE_TUNING.md`

---

## Orchestrator

```bash
npm run beta:program                    # status + next action + BETA_EXECUTIVE_SUMMARY.md
npm run beta:program -- --next          # run recommended next step only
npm run beta:program -- --step=0       # run one step
npm run beta:program -- --step=0,1     # run sequence
npm run beta:env-check -- --all        # validate env for steps 0–5
```

---

## Timeline

| When | Step | Command |
|------|------|---------|
| Day 1 | 0 | `beta:day1-complete` |
| Day 1–2 | 1 | `beta:go-live` |
| Week 1 | 2 | `beta:daily-ops` daily |
| Week 2 | 3 | `beta:week2-review` |
| Week 3–4 | 4 | `beta:go-no-go` |
| Ongoing | 5 | `beta:tune-templates` |
