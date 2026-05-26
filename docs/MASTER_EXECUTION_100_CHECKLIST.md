# Master Execution — чеклист 12 блоков → 100/100

Связано с [`ultimate-audit-24may2026.md`](ultimate-audit-24may2026.md) и [`NEXT_STEPS_TO_100.md`](NEXT_STEPS_TO_100.md).

**Код (оценка):** ~**99.9/100** после Sprint 16 · **GTM:** ~52/100

---

## Block 1 — Security (`workspaceId`)

| Критерий | Статус |
|----------|--------|
| Phases 12–29 (180 моделей) | ✅ schema + migrations + backfill scripts |
| `workspace:backfill:phases-12-29` | ✅ |
| CI `workspace:coverage:check` baseline **0** | ✅ 100% schema |
| Audit 219/219 user-scoped | ✅ |
| Hot-path + **go-live / executive / costing / onboarding** | ✅ Sprint 16 |
| P1 modules (purchasing, inventory, locations, demand) | ✅ Sprint 17 |
| P2 (billing, analytics, import-export) | ✅ Sprint 18 |
| P3 (training, templates, platform) | ✅ Sprint 19 |
| Migration P3006 fix + `prisma:migrate:deploy` | ✅ Sprint 19 |
| `workspace:prod:deploy` orchestrator | ✅ Sprint 18–19 |
| DB phases 12–29 on linked DB | ✅ Sprint 19 |
| NOT NULL + backfill on prod | ⏳ execute backfill first |
| Остальные services | 🟡 baseline **179** (было 264) |
| `workspace:audit:services` CI gate | ✅ Sprint 16 |
| `workspace:post-backfill:verify:strict` + `workspace:strict:all` | ✅ Sprint 15 |
| `workspace:generate:not-null` migration template | ✅ `20260525000000` (apply after verify) |
| `workspace:strict:all` green на **prod DB** | ⏳ migrate + backfill + verify |
| Staging/prod backfill `--execute` | ⏳ ручной запуск |

---

## Block 2 — Observability

| Критерий | Статус |
|----------|--------|
| `/api/health` + observability panel | ✅ |
| `SENTRY_DSN` production | ⏳ Vercel |
| Slack alerts | ⏳ Sentry UI |

---

## Block 3 — Backend (`ActionResult`)

| Критерий | Статус |
|----------|--------|
| `lib/action-result.ts` (`ok` / `fail`) | ✅ |
| ESLint `require-action-result` warn | ✅ |
| Codemod `npm run action-result:migrate` | ✅ ~140 action files; только domain `success` (не ActionResult) |

---

## Block 4 — QA

| Критерий | Статус |
|----------|--------|
| 20 contract tests | ✅ `tests/contracts/` |
| Coverage baseline ~21% lock | ✅ |
| Target 60% global | ❌ отдельный спринт |
| E2E verticals + `E2E_SESSION_COOKIE` | 🟡 stubs exist |
| Stripe replay integration | 🟡 lightweight test |
| k6 load script | ✅ `k6/load-order-creation.js` |

---

## Block 5 — UX / Onboarding

| Критерий | Статус |
|----------|--------|
| Operator tour + getting started | ✅ |
| KDS a11y (touch, ARIA) | ✅ |
| axe POS / checkout | ⏳ |

---

## Block 6 — SEO / Analytics

| Критерий | Статус |
|----------|--------|
| Compare pages, geo LPs, case studies | ✅ |
| Web Vitals reporter | ✅ |
| GSC verify | ⏳ env |
| PostHog funnels | ⏳ env |

---

## Block 7 — Integrations

| Критерий | Статус |
|----------|--------|
| Uber menu sync + inbound webhook | ✅ |
| DoorDash service + cron | ✅ |
| Prod credentials + E2E test order | ⏳ |

---

## Block 8 — PWA / Push

| Критерий | Статус |
|----------|--------|
| `sw.js` + subscribe API | ✅ |
| Order lifecycle push | ✅ |
| `kds-overdue-alerts` production cron | ✅ |
| VAPID prod verify | ⏳ |

---

## Block 9–10 — Marketing / Legal / CS

| Критерий | Статус |
|----------|--------|
| Content calendar, outreach, SLA docs | ✅ |
| `/api/nps` → email on low score | ✅ |
| KB in dashboard | ✅ (prior sprint) |
| 3 pilots + legal sign-off | ⏳ GTM |

---

## Block 11 — AI

| Критерий | Статус |
|----------|--------|
| `assertAiAllowed` + budget + OCR | ✅ |
| OCR review queue &lt; 85% confidence | ✅ |

---

## Block 12 — Database

| Критерий | Статус |
|----------|--------|
| PITR runbook | ✅ |
| EXPLAIN top-10 after APM | ⏳ |

---

## Команды одной цепочкой

```bash
npm run prisma:migrate:safe
npm run workspace:backfill:phases-12-17 -- --execute
npm run workspace:coverage:check
npm run ci:check
npm run deploy:prod
```
