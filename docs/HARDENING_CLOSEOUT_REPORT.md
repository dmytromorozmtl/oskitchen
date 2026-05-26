# Hardening closeout report

Date: 2026-05-14

## Summary

This pass adds **display-time sensitive redaction**, **honest replay/retry affordances** wired through `IntegrationActionButton`, an **optional DB-backed golden demo audit**, a **GitHub Actions CI workflow**, and an **audited platform support session foundation** (READ_ONLY, cookie, banners, audits, founder protection). No fake replay/retry server actions were added.

## What changed

### Sensitive redaction

- `lib/security/sensitive-redaction.ts` + `lib/security/redaction-patterns.ts` (existing) power `toSafeErrorPreview` / `redactSensitiveText`.
- New UI helper `components/integrations/sensitive-error-preview.tsx` shows **“Sensitive details redacted”** when needed.
- Platform aggregate `lastError` samples use redaction in `services/platform/platform-integrations-service.ts` with `lastErrorSampleRedacted`.

### Webhook / integration error UI

- `/platform/webhooks`, dashboard webhook logs, `/dashboard/integration-health` backlog, and read-only platform workspace integration health use safe previews (shorter limits for tenant views where applicable).
- `payloadJson` remains unshown in these surfaces.

### Replay / retry honesty

- `IntegrationActionButton` / inline variant connected on platform + dashboard integration, webhook, and error recovery surfaces, plus channel webhook sections and read-only integration health cards.

### DB-backed demo audit

- `services/demo/demo-scenario-db-audit-service.ts` + `scripts/check-demo-scenarios-db.ts` + `npm run check-demo-scenarios:db`.
- Requires workspace id + owner `demoMode`; refuses production without explicit allow flag.

### CI

- `.github/workflows/ci.yml` runs install-chain, typecheck, build, lint, tests, static demo checker.
- Optional commented job documents DB audit behind secrets.

### Support session foundation

- Prisma model + service + server actions + platform banner + customer notice + workspace start panel + optional dialog shell.
- `SUPPORT_ADMIN` may **start** and **end** sessions (permissions updated).

## QA — commands run (local)

All completed successfully in this environment:

- `npm run typecheck`
- `npm run build`
- `npm run lint` (warnings only in pre-existing files; no new errors)
- `npm test`
- `npm run check-demo-scenarios`
- `npm run verify:install-chain`

Additional:

- `npm run check-demo-scenarios:db` without `DEMO_AUDIT_WORKSPACE_ID` exits **2** with usage message (expected).

## Intentionally deferred

- **READ_ONLY mutation enforcement** across all server actions (requires systematic guard / middleware).
- **`PLATFORM_SUPPORT_SESSION_REVOKED`** operator path.
- **ASSISTED_EDIT** enablement + stronger permission matrix + per-mutation `supportSessionId` tagging.
- **DB demo audit in default CI** (needs secrets + stable demo workspace).
- **Payload / header viewers** even for platform superusers (needs dedicated sanitizer + ACL).

## Next recommended PR

1. Wire real **webhook replay** + **integration retry** server actions behind `platform:integrations:repair` / workspace-owner ACLs, then set `hasReplayServerAction` / `hasRetryServerAction` from server capability flags.
2. Central **read-only support session** mutation guard + integration tests.
3. Expand **redaction patterns** from production incident samples (structured logs, nested JSON).
