# Closed Beta Playbook — OS Kitchen (steps 1–6)

Операционный runbook: **guided closed beta (1–3 kitchens)**.

## One command (all automated gates)

```bash
npm run beta:launch -- --json
# → docs/artifacts/BETA_LAUNCH_REPORT.json
```

С Playwright + staff E2E:

```bash
export SMOKE_BASE_URL="https://staging..."
export SMOKE_DELIVERY_CONNECTION_ID_OTHER="uuid"
eval "$(npm run smoke:session-cookie --silent)"
export E2E_STAFF_EMAIL="staff@..."
export E2E_STAFF_PASSWORD="..."
npm run beta:launch -- --with-playwright --json
```

**Formal sign-off:** [`docs/BETA_LAUNCH_SIGNOFF.md`](BETA_LAUNCH_SIGNOFF.md)

---

## Шаг 1 — DBA approve migrations

| | |
|--|--|
| **Кто** | DBA / вы |
| **Команда** | `npm run dba:migration-review` |
| **Запрос DBA** | [`docs/templates/DBA_APPROVAL_REQUEST.md`](templates/DBA_APPROVAL_REQUEST.md) |
| **Записать approve** | `npm run dba:record-signoff -- --by="Name" --ticket=INFRA-123` |
| **Gate** | `docs/artifacts/DBA_SIGNOFF.json` + packet |

---

## Шаг 2 — Migrate + backfill

| | |
|--|--|
| **Кто** | DevOps |
| **Dry-run** | `npm run staging:remediation-all -- --dry-run` |
| **Execute** | `npm run staging:remediation-all` |
| **Verify** | `npm run check:backfill` → all OK |
| **Orchestrator** | `npm run beta:launch -- --step=2` |
| **Danger execute** | `npm run beta:launch -- --execute-step=2` |

---

## Шаг 3 — Upstash + impersonation TOTP

| | |
|--|--|
| **Шаблон** | `.env.staging.example` → Vercel staging |
| **TOTP generate** | `npm run setup:impersonation-totp` |
| **Verify** | `npm run verify:staging-env -- --strict` |
| **Gate** | `npm run beta:launch -- --step=3` |

---

## Шаг 4 — QA bundle

| | |
|--|--|
| **Bundle** | `npm run beta:qa-bundle -- --with-playwright` |
| **CI** | GitHub Actions → `Closed Beta Gate` workflow |
| **Покрытие** | smoke, public API, security, delivery IDOR, export CSV |

---

## Шаг 5 — Staff visibility

| | |
|--|--|
| **DB** | `npm run verify:staff-scope` |
| **E2E** | `npx playwright test tests/e2e/staff-order-visibility.spec.ts --project=chromium-staff` |
| **Manual** | [`docs/MANUAL_STAFF_VISIBILITY_CHECKLIST.md`](MANUAL_STAFF_VISIBILITY_CHECKLIST.md) |

---

## Шаг 6 — Onboard 1–3 kitchens

```bash
npm run beta:cohort -- --emails=chef1@,chef2@,chef3@
# Per kitchen: npm run beta:kitchen-preflight -- --email=...
```

Onboarding script: [`docs/BETA_LAUNCH_PACKAGE.md`](BETA_LAUNCH_PACKAGE.md)

---

## NPM commands (полная шпаргалка)

```bash
npm run beta:launch              # все шаги (verify)
npm run beta:launch:report       # + JSON artifact
npm run dba:migration-review
npm run dba:record-signoff -- --by="..." --ticket=...
npm run staging:remediation-all
npm run check:backfill
npm run setup:impersonation-totp
npm run verify:staging-env
npm run beta:qa-bundle -- --with-playwright
npm run verify:staff-scope
npm run beta:cohort -- --emails=a@,b@,c@
npm run beta:kitchen-preflight -- --email=...
```

---

## Post-launch (после green report)

**Master playbook:** [`docs/BETA_POST_LAUNCH_PLAYBOOK.md`](BETA_POST_LAUNCH_PLAYBOOK.md)

| Фаза | Команда |
|------|---------|
| Go live | `npm run beta:go-live -- --emails=...` |
| Week 1 | `npm run beta:daily-ops` + `beta:support-setup` |
| Week 2–4 | `docs/POST_BETA_EPIC.md` |
| RBAC D | `docs/RBAC_PHASE_D.md` |

**Readiness:** ~**93/100** in-repo (launch + post-launch ops).
