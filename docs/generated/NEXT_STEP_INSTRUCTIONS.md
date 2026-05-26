# Paid pilot — следующий шаг (100%)
**Сгенерировано:** 2026-05-18T09:39:02.696Z
**Прогресс очереди:** 6/13 (46%)
## Сводка
| Проверка | Статус |
|----------|--------|
| CRON_SECRET + ENCRYPTION_KEY | OK |
| PLATFORM_IMPERSONATION_TOTP_SECRET | OK |
| UPSTASH (Vercel GO) | **FAIL** |
| DATABASE_URL | OK |
| NEXT_PUBLIC_APP_URL | https://xn---preview--staging-r4nxb5ja9d6q.vercel.app |
| Deploy live (/api/health или /login 200) | **FAIL — redeploy** |
| PILOT_LOCAL_MEMORY_RATE_LIMIT | WARN — только локально, не Vercel GO |
## Очередь
- [x] **deps** (auto) — npm ci (devDependencies)
- [x] **secrets** (auto) — Staging secrets (CRON, ENCRYPTION)
- [x] **sync-env** (auto) — DATABASE_URL from .env.local
- [x] **totp** (auto) — Platform impersonation TOTP (auto-generate)
- [ ] **upstash** (ops) — Upstash REST credentials
- [x] **staging-url** (auto) — Deployed staging URL (Vercel)
- [ ] **deploy-live** (ops) — Staging deploy responds (HTTP 200)
- [x] **db** (auto) — DB migrate + backfill + staff scope
- [ ] **staff** (product) — Staff invite for golden path / E2E
- [ ] **http** (auto) — HTTP golden path smoke
- [ ] **e2e-env** (ops) — Configure E2E pilot credentials
- [ ] **golden-manual** (product) — Manual golden path checklist
- [ ] **signoff** (all) — Record Tech + Ops + Product sign-off

---

## ▶ Сейчас: `upstash` — Upstash REST credentials

**Владелец:** ops

**Оценка:** ~5 мин

1. **Одна команда (рекомендуется):**

```bash
npm run pilot:upstash:gate
```

2. Откроет scan всех `.env*`, создаст `.env.upstash.paste.local` если нужно, чеклист Vercel.
3. Интерактивно: `npm run pilot:upstash:gate -- --wizard`
4. Без терминала: отредактируйте `.env.upstash.paste.local` (шаблон `docs/templates/UPSTASH_PASTE.env.example`) → снова `pilot:upstash:gate`
5. Upstash Console: https://console.upstash.com/redis → REST API
6. После OK: `docs/generated/PILOT_UPSTASH_VERCEL_CHECKLIST.md`

**Одна команда (всё автоматизируемое):**
```bash
npm run pilot:100-next
```

**Или один шаг очереди:**
```bash
npm run pilot:next-step
```

## Probe staging URLs

| URL | Path | HTTP |
|-----|------|------|
| https://xn---preview--staging-r4nxb5ja9d6q.vercel.app | /api/health | 404  |
| https://xn---preview--staging-r4nxb5ja9d6q.vercel.app | /login | 404  |
| https://xn---preview--staging-r4nxb5ja9d6q.vercel.app | / | 404  |
| https://xn---production-xijza32a.vercel.app | /api/health | 404  |
| https://xn---production-xijza32a.vercel.app | /login | 404  |
| https://xn---production-xijza32a.vercel.app | / | 404  |

> **404 на всех путях** — preview URL устарел или приложение не задеплоено. Redeploy + `npm run staging:url:probe -- --fix`.

## После Upstash (чеклист Vercel GO)

1. `npm run verify:staging-env` (без `--local-pilot`)
2. `npm run vercel:staging-push -- --apply`
3. Redeploy staging на Vercel
4. `npm run staging:url:probe -- --fix`
5. `npm run pilot:next-step`

## Локально без Upstash (не заменяет Vercel)

```bash
npm run pilot:local-continue
```

## Ссылки

- Runbook: `docs/PILOT_100_PERCENT_RUNBOOK.md`
- Upstash: `docs/UPSTASH_STAGING_SETUP.md`
- GO/NO-GO: `npm run pilot:go-no-go-report` → `docs/generated/PILOT_GO_NO_GO_STATUS.md`

_Обновить: `npm run pilot:next-step:doc`_
