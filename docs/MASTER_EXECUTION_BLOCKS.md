# Master Execution Blocks — 79 → 95 Roadmap

**Version:** 2026-05-24 · **Prod:** https://os-kitchen.com

Track progress per block. Code cannot close Sales/HR without revenue and hires.

| Block | Theme | Status | Session / notes |
|-------|--------|--------|-----------------|
| 1 | workspaceId migration | 🟡 In progress | `ci:check`, codegen SQL, **180** models need column |
| 2 | APM / Sentry | 🟡 | Health + `/status` panel; **SENTRY_DSN** + Slack rules manual |
| 3 | ActionResult + webhooks | 🟡 | `ok`/`fail` aliases; `migrate-action-results.ts`; idempotency ✅ |
| 4 | QA coverage + E2E | 🟡 | 45% gate; vertical E2E stubs; k6 baseline |
| 5 | Onboarding + WCAG | 🟢 | Tour + checklist on `/dashboard/today`; axe CI partial |
| 6 | GSC + PostHog + CWV | 🟡 | Compare ×3, geo LPs, WebVitals; **env + GSC UI** manual |
| 7 | DoorDash / Uber live | 🔴 | Scaffold only |
| 8 | PWA push + next/image | 🔴 | Not started |
| 9 | Marketing engine | 🟢 | Calendar, geo ×6, ROI lead, outreach templates |
| 10 | Legal + CS | 🟡 | DPA/SLA docs; NPS `/api/nps`; counsel manual |
| 11 | AI budget + OCR review | 🟡 | `budget-guard.ts`; wire copilot/OCR |
| 12 | DB perf + PITR | 🟡 | `docs/ops/pitr-runbook.md`; EXPLAIN after APM |

---

## Block 1 — commands

```bash
# Schema audit (no DB)
npm run workspace:audit
npm run workspace:coverage:check

# Full dry-run report (needs DATABASE_URL for row counts)
npm run workspace:migration:dry-run-report

# Staging backfill (no writes)
npm run workspace:backfill:all -- --dry-run

# CI gates
npm run workspace:audit:gate
npm run workspace:coverage:check -- --max-needs-migration=180
```

**Definition of done (Block 1):** `needsMigration === 0`, `--fail-below 100` green, staging backfill complete, pilot services use `requireTenantActor` / scoped where helpers.

---

## Recommended order (from master prompt)

1. **Day 1:** Block 6 (GSC 15 min) → Block 1 dry-run on staging  
2. **Day 2–3:** Block 2 APM → Block 3 ActionResult  
3. **Week 1:** Block 5 onboarding → Block 9 marketing  
4. **Week 2:** Block 4 QA → Block 7 integrations  
5. **Week 3–4:** Blocks 8, 10, 11, 12  

**Parallel:** outreach for 3 paid pilots — required for GTM > 60.

---

## Related docs

- `docs/GTM_ENGINEERING_BUNDLE_24MAY.md`
- `docs/WORKSPACE_MIGRATION_RUNBOOK.md`
- `docs/GTM_BACKLOG_STATUS.md`
