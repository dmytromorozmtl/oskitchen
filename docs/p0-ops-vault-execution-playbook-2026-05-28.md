# P0 Ops Vault — Пошаговый Playbook (до `proof_passed`)

**Статус:** canonical ops execution · **Policy:** `era17-p0-staging-proof-unblock-v1`  
**Текущий блокер:** `p0ProofStatus: awaiting_ops_credentials` (11 env vars)  
**Правило:** SKIPPED WITH REASON — честно. **FAILED** — exit 1. **Никогда** не коммитить fake PASS.

---

## Роли и ответственность

| Роль | Действие |
|------|----------|
| **Founder / Ops lead** | ICP, LOI, GO decision, sign-off Tier 2 |
| **DevOps** | GitHub secrets, staging URL, DATABASE_URL, ENCRYPTION_KEY |
| **Security / Identity** | SSO IdP tenant (Okta или Entra ID), Supabase SAML ref |
| **Integrations engineer** | Woo **или** Shopify staging store + webhook |
| **QA** | Tier 2 golden path sign-off после P0 PASS |

---

## Фаза 0 — Preflight (15 мин)

```bash
npm run ops:validate-p0-vault-env          # локально — список missing
npm run smoke:p0-staging-proof-unblock -- --checklist-only
```

**Acceptance:** вы знаете точный список missing vars; есть доступ к GitHub repo → Settings → Secrets.

---

## Фаза 1 — Staging base + dashboard login (vars 1–3)

| # | Variable | Где взять | Куда положить |
|---|----------|-----------|---------------|
| 1 | `E2E_STAGING_BASE_URL` | URL деплоя staging (Vercel/preview) без trailing slash | GitHub secret + local export |
| 2 | `E2E_LOGIN_EMAIL` | Owner/manager test user на staging | GitHub secret |
| 3 | `E2E_LOGIN_PASSWORD` | Password того же user | GitHub secret |

**Шаги:**

1. Задеплоить `main` на staging (или подтвердить существующий URL).
2. Создать/подтвердить test workspace owner на staging.
3. В GitHub: **Settings → Secrets and variables → Actions** — добавить 3 secrets.
4. Локально (для ручного smoke):

```bash
export E2E_STAGING_BASE_URL="https://YOUR-STAGING.example.com"
export E2E_LOGIN_EMAIL="owner@pilot.example.com"
export E2E_LOGIN_PASSWORD="***"
```

**Validation:**

```bash
curl -sI "$E2E_STAGING_BASE_URL/login" | head -1   # HTTP 200/307
npm run ops:validate-p0-vault-env                     # 3/11 present
```

**Разблокирует:** `smoke:staging-workflows-first-green`, часть SSO smoke.

---

## Фаза 2 — Database + encryption (vars 9–10)

| # | Variable | Где взять | Куда |
|---|----------|-----------|------|
| 9 | `DATABASE_URL` | Staging Postgres (Supabase connection string) | GitHub secret + ops vault |
| 10 | `ENCRYPTION_KEY` | Тот же ключ, что на staging app (`ENCRYPTION_KEY` в Vercel env) | GitHub secret + ops vault |

**Шаги:**

1. Скопировать `DATABASE_URL` из Vercel staging project → Environment Variables.
2. Скопировать `ENCRYPTION_KEY` — **must match** staging runtime (иначе channel creds не расшифруются).
3. **Never commit** values to git.

**Validation:**

```bash
export DATABASE_URL="postgresql://..."
export ENCRYPTION_KEY="..."
npm run ops:validate-p0-vault-env   # 5/11
```

**Разблокирует:** child `channelLive` smoke prerequisites.

---

## Фаза 3 — Channel live smoke (var 11)

| # | Variable | Назначение |
|---|----------|------------|
| 11 | `CHANNEL_SMOKE_OWNER_EMAIL` | Email workspace owner для Woo/Shopify tenant selector |

**Шаги:**

1. Выбрать **один** channel для pilot day 1: Woo **или** Shopify (не оба обязательны для P0).
2. Подключить channel в staging UI: `/dashboard/sales-channels`.
3. Настроить webhook на staging URL (см. `commercial-pilot-runbook.md` § channel live).
4. Export `CHANNEL_SMOKE_OWNER_EMAIL` = email owner workspace с подключением.

**Validation (после vars 9–11):**

```bash
npm run smoke:woo-shopify-live
# artifact: artifacts/channel-live-smoke-summary.json → proof_passed (one provider minimum)
```

**Honest scope:** engineering smoke PASS ≠ marketplace LIVE registry claim.

---

## Фаза 4 — SSO IdP staging (vars 4–8)

| # | Variable | Пример |
|---|----------|--------|
| 4 | `SSO_STAGING_WORKSPACE_ID` | UUID pilot workspace |
| 5 | `SSO_STAGING_IDP_VENDOR` | `OKTA` or `ENTRA_ID` |
| 6 | `SSO_STAGING_ALLOWED_DOMAIN` | `pilot.example.com` |
| 7 | `SSO_STAGING_TEST_EMAIL` | `staff@pilot.example.com` |
| 8 | `SSO_STAGING_SUPABASE_PROVIDER_REF` | Supabase Auth SAML provider ref |

**Deep dive:** [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md)

**Validation:**

```bash
npm run smoke:enterprise-sso-idp-staging
# artifact: artifacts/enterprise-sso-idp-staging-smoke-summary.json → loginProofStatus: proof_passed
```

**GTM:** до PASS — только `pilot_foundation`, не «production SSO».

---

## Фаза 5 — Aggregate P0 orchestrator

Когда **все 11 vars** set:

```bash
npm run ops:validate-p0-vault-env          # exit 0
npm run smoke:p0-staging-proof-unblock     # exit 0 only if all children PASS or honest SKIP resolved
```

**Acceptance artifact:** `artifacts/p0-staging-proof-unblock-summary.json`

```json
{
  "p0ProofStatus": "proof_passed",
  "overall": "PASSED"
}
```

**Commit policy:** коммитить artifact **только** после real PASS в credentialed run. SKIPPED — не коммитить как PASS.

---

## Фаза 6 — GitHub staging first green

После vars 1–3:

```bash
npm run smoke:staging-workflows-first-green
```

**Acceptance:** URL green workflow run в artifact → добавить в evidence pack.

---

## Фаза 7 — Tier 2 golden path (manual, post-P0)

**Doc:** [`era20-operator-golden-path-proof-2026-05-28.md`](./era20-operator-golden-path-proof-2026-05-28.md)  
**Checklist:** [`pilot-operator-golden-path-era17.md`](./pilot-operator-golden-path-era17.md)

```bash
npm run smoke:pilot-operator-golden-path
```

**Operator sign-off (45–60 min staging):**

1. Storefront or manual order → Order Hub  
2. KDS bump  
3. Packing QC  
4. POS shift open/close (if in scope)  
5. Integration health shows honest status  

---

## Фаза 8 — Commercial GO

**Prerequisites:**

- [ ] `p0ProofStatus: proof_passed`  
- [ ] SSO IdP PASS (if enterprise ICP)  
- [ ] One channel live PASS  
- [ ] ICP qualified (`PILOT_GONOGO_PROSPECT_NAME` + evaluator)  
- [ ] LOI signed (`PILOT_GONOGO_CUSTOMER_NAME`, `PILOT_GONOGO_LOI_SIGNED_DATE`)

```bash
export PILOT_GONOGO_PROSPECT_NAME="Acme Kitchen LLC"
export PILOT_GONOGO_CUSTOMER_NAME="Acme Kitchen LLC"   # after LOI
export PILOT_GONOGO_LOI_SIGNED_DATE="2026-06-01"       # after LOI
npm run smoke:pilot-gono-go
```

**Acceptance:** `artifacts/pilot-gono-go-summary.json` → `"decision": "GO"`

---

## Decision tree

```text
missing env vars? → awaiting_ops_credentials → configure vault
       ↓
p0 PASS? → NO → fix child smoke FAILED
       ↓ YES
Tier 2 done? → NO → operator checklist
       ↓ YES
LOI signed? → NO → commercial block
       ↓ YES
GO → pilot kickoff Week 1 (commercial-pilot-runbook.md)
```

---

## Что код уже сделал (не substitute P0)

| Item | Status |
|------|--------|
| `npm run ops:validate-p0-vault-env` | Wired |
| Integration Health P0 trust banner | Shows missing 11 vars |
| Nav hide preview | Done |
| Briefing telemetry | PostHog `briefing_click` |
| API scope picker | scopesJson on keys |

---

## Следующий шаг (буквально сегодня)

1. **DevOps:** создать staging secrets doc (1 password vault entry per var).  
2. **Заполнить vars 1–3** → re-run `ops:validate-p0-vault-env`.  
3. **Заполнить vars 9–11** → run `smoke:woo-shopify-live` (one channel).  
4. **Security:** vars 4–8 → run SSO smoke.  
5. **Full orchestrator** → `smoke:p0-staging-proof-unblock`.  
6. **Founder:** qualify ICP + LOI parallel track.  

**Estimated calendar time:** 2–5 business days with credentials access (not engineering cycles).
