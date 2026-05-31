# OS Kitchen Closed Beta — Start Here

Единая точка входа для запуска closed beta (Day 1 → Week 4).

---

## Быстрый старт (фазы A–F)

```bash
npm run beta:run-phase -- --list    # все фазы

# A) Setup
npm run beta:run-phase -- --phase=A
# → edit .env.beta.local
npm run beta:setup -- --fix-env

# B) Staging (на хосте со staging DATABASE_URL)
npm run beta:run-phase -- --phase=B

# C) Day 1
npm run beta:preflight              # env + HTTP + guards
npm run beta:run-phase -- --phase=C # preflight + day1-complete

# D–F) Go live → daily ops → track
npm run beta:run-phase -- --phase=D
npm run beta:run-phase -- --phase=E
npm run beta:run-phase -- --phase=F
```

Или одной цепочкой после заполнения `.env.beta.local`:

```bash
npm run beta:preflight
npm run beta:day1-complete
npm run beta:go-live -- --emails=owner1@,owner2@,owner3@
npm run beta:daily-ops
npm run beta:program
```

---

## Фазы программы

| # | Когда | Команда | Gate |
|---|-------|---------|------|
| **Setup** | Сейчас | `npm run beta:setup` | `.env.beta.local` + checklist |
| **Preflight** | Перед Day 1 | `npm run beta:preflight` | `BETA_PREFLIGHT.json` ok |
| **Staging** | На staging | `npm run beta:staging-prep` | `BETA_STAGING_PREP.json` ok |
| **0** | Day 1 | `npm run beta:day1-complete` | `BETA_LAUNCH_REPORT` readyForBeta |
| **1** | После green | `npm run beta:go-live -- --emails=...` | Registry status `live` |
| **2** | Week 1 daily | `npm run beta:daily-ops` | unhealthy = 0 |
| **3** | Week 2 | `npm run beta:week2-review` | `BETA_WEEK2_REVIEW.md` |
| **4** | Week 3–4 | `npm run beta:go-no-go -- --record-decision=go` | POST_BETA_EPIC |
| **5** | По feedback | `npm run beta:tune-templates` | permission-matrix |

---

## Артефакты (всегда актуальные)

| Файл | Назначение |
|------|------------|
| `docs/artifacts/BETA_EXECUTIVE_SUMMARY.md` | Сводка + next action |
| `docs/artifacts/BETA_SETUP_CHECKLIST.md` | Фазы setup |
| `docs/artifacts/BETA_LAUNCH_REPORT.html` | Day 1 sign-off meeting |
| `docs/artifacts/BETA_PROGRAM_STATE.json` | Прогресс шагов 0–5 |
| `docs/artifacts/BETA_COHORT_REGISTRY.json` | Статус кухонь |
| `docs/artifacts/BETA_DAILY_OPS_YYYY-MM-DD.json` | Ежедневный health |

---

## Env

Шаблон: `.env.beta.local.example` → копия `.env.beta.local` (не коммитить).

```bash
npm run beta:env-check -- --all
```

---

## P0 инциденты (go/no-go)

```bash
npm run beta:record-incident -- --title="Checkout down" --severity=P0
npm run beta:record-incident -- --list
npm run beta:record-incident -- --resolve=inc-...
```

---

## Документация

- **Day 1 расписание:** `docs/BETA_LAUNCH_DAY1.md`
- **Pre-launch gates 1–6:** `docs/CLOSED_BETA_PLAYBOOK.md`
- **Post-launch 0–5:** `docs/BETA_PROGRAM_RUNBOOK.md`
- **Staging migrate/backfill:** `docs/STAGING_REMEDIATION_RUNBOOK.md`
- **Post-beta epic:** `docs/POST_BETA_EPIC.md`

---

## Orchestrator

```bash
npm run beta:program           # статус
npm run beta:program -- --next # выполнить следующий шаг
```
