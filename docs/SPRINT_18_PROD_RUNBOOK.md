# Sprint 18 — Prod deploy + P2 scope

**Дата:** 2026-05-24

---

## Код (сделано)

### P2 scope wave

| Модуль | Файлы |
|--------|--------|
| **Billing** | `usage-service`, `billing-service`, `entitlement-service`, `subscription-service` (invoices) |
| **Analytics** | meal-plan + inventory analytics |
| **Import/export** | `export-service` (все CSV kinds), `import-job-queries`, `data-operations-overview` |
| **Import center** | staff + ingredients match lookup |

**Новые helpers:** `billingEventListWhereForOwner`, `auditLogListWhereForOwner`

**Audit:** 236 → **204** (−32) · **747** tests

### Prod orchestration

```bash
npm run workspace:prod:deploy           # migrate + backfill dry-run
npm run workspace:prod:deploy:execute   # + backfill --execute + strict:all
APPLY_NOT_NULL=1 npm run workspace:prod:deploy:execute   # + NOT NULL migrate
```

Скрипт: `scripts/workspace-prod-deploy.sh`

---

## Prod run — обновление (Sprint 19)

| Шаг | Результат |
|-----|-----------|
| Migration guard `20260207140000` | ✅ shadow-safe |
| `prisma migrate deploy` phases 12–29 | ✅ |
| `20260525000000_workspace_id_not_null` | ❌ до `backfill --execute` |

---

## Prod run — локальная попытка (2026-05-24, Sprint 18)

| Шаг | Результат |
|-----|-----------|
| `workspace:coverage:strict` | ✅ OK (219/219) |
| `prisma:migrate:safe` | ❌ **P3006** — shadow DB: `storefront_orders` missing в старой миграции `20260207140000` |

### Что делать на staging/prod

1. **Не** полагаться на `migrate dev` shadow на Supabase pooler — использовать:
   ```bash
   npx prisma migrate deploy
   ```
   на staging с прямым `DATABASE_URL` (или `DIRECT_URL` если настроен).

2. Если `migrate deploy` чистый:
   ```bash
   npm run workspace:backfill:phases-12-29 -- --dry-run
   npm run workspace:backfill:phases-12-29 -- --execute
   npm run workspace:strict:all
   ```

3. Когда `strict:all` green:
   ```bash
   npm run workspace:generate:not-null
   npx prisma migrate deploy
   npm run verify:staff-scope
   ```

4. Зафиксировать shadow/migration drift отдельным тикетом (repair `20260207140000` или baseline shadow).

---

## Sprint 19+ (следующие)

| # | Задача |
|---|--------|
| 1 | Починить migration shadow / `migrate deploy` на staging |
| 2 | Выполнить prod sequence до green `strict:all` |
| 3 | **P3 scope** (training, demo, platform) → baseline **0** |
| 4 | `workspace:audit:services --fail` в CI когда baseline = 0 |
| 5 | Убрать legacy OR после NOT NULL |
| 6 | QA: E2E, coverage 60%, GTM |

См. [`NEXT_STEPS_TO_100.md`](NEXT_STEPS_TO_100.md).
