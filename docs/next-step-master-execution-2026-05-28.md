# KitchenOS — Следующий шаг (master execution, 28 May 2026)

**Вердикт:** demo-grade сильный · pilot executable ~66/100 · **NO-GO** до P0 PASS  
**Единственный критический путь:** ops vault → `proof_passed` → Tier 2 golden path → LOI → GO

---

## Что уже сделано в коде (этот цикл)

| Область | Изменение |
|---------|-----------|
| Nav | Preview-страницы скрыты из default nav (`nav-maturity-governance`) |
| UX honesty | KDS 15s poll banner, inventory/loyalty locked banners, briefing-first Today |
| POS | Cashier speed mode default, guard-before-query, **PermissionDeniedSurfaceCard sweep** на всех POS subpages |
| RBAC | +3 mutation registry entries, POS/packing require helpers |
| Telemetry | `briefing_click` events на Owner Daily Briefing CTAs |
| Integration Health | Owner compact mode vs support triage |
| Public API | Scope picker UI при создании API key |
| Ops | `npm run ops:validate-p0-vault-env`, playbook `p0-ops-vault-execution-playbook-2026-05-28.md` |
| Docs | Era 19/20 scorecards, domain map draft, sales forbidden claims training |
| E2E scaffold | `e2e/support-impersonation-tenant-isolation.spec.ts` (skip без staging creds) |

**Исправлено:** broken JSX в `app/dashboard/pos/shifts/page.tsx`.

---

## Что нельзя закрыть кодом (требует людей / creds)

1. **11 env vars** в GitHub Secrets + ops vault  
2. **`smoke:p0-staging-proof-unblock` → `proof_passed`**  
3. **SSO IdP staging PASS** (Okta/Entra + Supabase SAML)  
4. **Woo или Shopify live smoke PASS**  
5. **GitHub staging workflow first green URL**  
6. **ICP + signed LOI** — первый платный пилот  
7. **GO artifact** — только после пунктов 1–6  
8. **Pen test, rollback drill, commerce webhook drill execution** — runbook есть, drill не проводился  

**Правило:** не коммитить SKIPPED как PASS в `artifacts/*.json`.

---

## Следующий шаг №1 — Ops vault (P0, блокирует всё)

**Owner:** DevOps + Security + Integrations  
**Playbook:** [`p0-ops-vault-execution-playbook-2026-05-28.md`](./p0-ops-vault-execution-playbook-2026-05-28.md)  
**Checklist:** [`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md)

### День 0 (2–4 часа) — vars 1–3 + 9–10

```bash
npm run ops:validate-p0-vault-env
npm run smoke:p0-staging-proof-unblock -- --checklist-only
```

| # | Variable | Действие |
|---|----------|----------|
| 1 | `E2E_STAGING_BASE_URL` | URL staging deploy |
| 2 | `E2E_LOGIN_EMAIL` | Owner test user |
| 3 | `E2E_LOGIN_PASSWORD` | Password |
| 9 | `DATABASE_URL` | Staging Postgres (must match Vercel) |
| 10 | `ENCRYPTION_KEY` | Must match staging runtime |

**Acceptance:** `ops:validate-p0-vault-env` → 5/11 present; manual login на staging OK.

### День 1 — channel live (vars 11 + channel creds)

| # | Variable | Действие |
|---|----------|----------|
| 11 | `CHANNEL_SMOKE_OWNER_EMAIL` | Owner workspace для channel smoke |

+ Woo **или** Shopify staging store credentials в DB (encrypted with `ENCRYPTION_KEY`).

```bash
npm run smoke:woo-shopify-live
```

**Acceptance:** artifact `artifacts/woo-shopify-live-smoke-summary.json` → PASS (not SKIPPED).

### День 2 — SSO (vars 4–8)

| # | Variable |
|---|----------|
| 4 | `SSO_SMOKE_IDP` |
| 5 | `SSO_SMOKE_SAML_METADATA_URL` |
| 6 | `SSO_SMOKE_OIDC_ISSUER` |
| 7 | `SSO_SMOKE_OIDC_CLIENT_ID` |
| 8 | `SSO_SMOKE_OIDC_CLIENT_SECRET` |

```bash
npm run smoke:enterprise-sso-idp-staging
```

**Acceptance:** SAML/OIDC login PASS на staging.

### День 3 — full orchestrator

```bash
npm run smoke:p0-staging-proof-unblock
```

**Acceptance:** `artifacts/p0-staging-proof-unblock-summary.json` → `p0ProofStatus: "proof_passed"`.

---

## Следующий шаг №2 — QA golden path (сразу после proof_passed)

**Owner:** QA + Integrations engineer  
**Tier 2:** Woo webhook → Order Hub → KDS → Packing (staging, real, not synthetic)

| Step | Command / action | Evidence |
|------|------------------|----------|
| 1 | Configure live webhook on staging store | Integration Health → LIVE row |
| 2 | Place test order | Canonical order in Order Hub |
| 3 | KDS Playwright on GitHub | Green workflow URL in evidence pack |
| 4 | Packing complete | Order status terminal |
| 5 | `smoke:staging-workflows-first-green` | First green URL saved |

**Acceptance:** evidence pack with **real URLs**, no SKIPPED labeled PASS.

---

## Следующий шаг №3 — Commercial (parallel после proof_passed)

**Owner:** Founder / PM / Sales

1. Заполнить ICP evaluator реальным кандидатом (E20 bridge template)  
2. Pilot pricing SKU опубликовать ($500–2500/mo hypothesis)  
3. LOI подписать до GO  
4. `npm run smoke:pilot-gono-go` → **GO** artifact  
5. Sales: [`sales-forbidden-claims-training-era20.md`](./sales-forbidden-claims-training-era20.md) — mandatory pre-demo  

**Acceptance:** signed LOI + GO JSON + forbidden claims training acknowledged.

---

## Следующий шаг №4 — Engineering P1 (после GO, до enterprise pitch)

| Item | Action |
|------|--------|
| Webhook replay ops | `npm run smoke:webhook-replay-p1-expansion` on 46 routes |
| Commerce drill | `npm run smoke:commerce-webhook-drill` — **execute**, not template |
| Mutation registry | Expand from 18 → priority POS/KDS/packing actions (incremental) |
| Support impersonation E2E | Run `e2e/support-impersonation-tenant-isolation.spec.ts` with staging creds |
| Rollback tabletop | Schedule real drill using existing runbook |

---

## Следующий шаг №5 — Product / Design P1 (parallel, не блокирует P0)

| Item | Status |
|------|--------|
| Launch Wizard = single entry | Banner on go-live done; merge nav links next |
| Nav hide preview | Done in code |
| TTV measurement | Timed study on first pilot Week 1 |
| Era 19/20 scorecards | Docs created |
| Offline POS / unified loyalty / inventory | **Defer honestly** — roadmap only |

---

## Decision tree

```
awaiting_ops_credentials
        │
        ▼ (11 vars + smokes)
   proof_passed
        │
        ├──► Tier 2 golden path PASS
        ├──► GitHub staging green URL
        └──► SSO + channel LIVE PASS
                │
                ▼
          ICP + LOI signed
                │
                ▼
            GO artifact
                │
                ▼
         Pilot Week 1 launch
                │
                ▼
    TTV study + metrics baseline + case study
```

---

## Что сознательно НЕ делать до GO

- Новые UX convergence cycles (39 cycles до proof = ошибка Era 19)  
- SKIPPED → PASS в artifacts  
- Forbidden claims в sales (SSO production, LIVE marketplace, unified inventory, rush KDS SLO)  
- Schema refactor / service consolidation (Era 21)  
- Offline POS queue implementation (defer + roadmap)  

---

## Immediate action (сегодня)

**Если вы DevOps:** открыть [`p0-ops-vault-execution-playbook-2026-05-28.md`](./p0-ops-vault-execution-playbook-2026-05-28.md) → Фаза 1 → добавить vars 1–3, 9–10 в GitHub Secrets.  
**Template:** `npm run ops:export-p0-vault-env-template -- --write`  
**Day 0 runbook:** [`next-step-1-ops-vault-day0-execution-2026-05-28.md`](./next-step-1-ops-vault-day0-execution-2026-05-28.md)

**Если вы Engineering:** merge POS permission-denied sweep + run `npm test` locally.

**Если P0 уже PASS:** [`next-step-2-after-p0-pass-2026-05-28.md`](./next-step-2-after-p0-pass-2026-05-28.md) → `npm run smoke:tier2-staging-golden-path`

**Если вы PM/Sales:** ICP candidate list + forbidden claims training read-through.

**Если вы QA:** standby for Tier 2 script после `proof_passed` notification.
