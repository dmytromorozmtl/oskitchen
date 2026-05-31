# Paid pilot — GO / NO-GO status

Generated: 2026-05-18T09:38:05.024Z

**Verdict:** NO-GO (5 GO · 1 WARN · 5 BLOCKED)

| ID | Area | Status | Evidence |
|----|------|--------|----------|
| CODE-01 | Typecheck | GO | npm run typecheck |
| CODE-02 | Unit tests | BLOCKED | > kitchenos@0.1.0 test
> node ./node_modules/vitest/vitest.mjs run


 RUN  v4.1.5 /Users/dmytro/Desktop/2026/OS Kitchen

 ❯ tests/unit/staging-env-placeholders.test.ts (2 tests \| 1 failed) 4ms
     × a |
| CODE-03 | Tenant scope pilot | GO | 0 violations |
| DB-01 | Workspace backfill | GO | all tables OK |
| OPS-01 | Staging env (full) | WARN | local-pilot only — add Upstash + TOTP for Vercel |
| OPS-02 | Upstash REST | BLOCKED | console.upstash.com |
| OPS-03 | Impersonation TOTP | GO | PLATFORM_IMPERSONATION_TOTP_SECRET |
| OPS-04 | Deployed staging URL | GO | https://xn---preview--staging-r4nxb5ja9d6q.vercel.app |
| OPS-05 | HTTP golden path smoke | BLOCKED | > kitchenos@0.1.0 smoke:golden-path-http
> tsx scripts/run-golden-path-http-smoke.ts

=== Golden path HTTP smoke — https://xn---preview--staging-r4nxb5ja9d6q.vercel.app ===

FAIL  login-page: HTTP 404 |
| OPS-06 | E2E pilot bundle | BLOCKED | set E2E_PILOT_* + PLAYWRIGHT_BASE_URL |
| PROD-01 | Manual golden path + sign-off | BLOCKED | docs/PILOT_GOLDEN_PATH_CHECKLIST.md + npm run pilot:record-signoff |

## Blocker owners

| Blocker | Owner | Command |
|---------|-------|---------|
| Upstash + TOTP on Vercel | Ops | `npm run vercel:staging-push -- --apply` |
| Deploy staging + build | Ops/CI | `npm run build` · workflow **Paid Pilot Gate** |
| HTTP / E2E on real URL | Ops | `npm run smoke:golden-path-http` · `npm run test:e2e:pilot` |
| Manual golden path | Product | `docs/PILOT_GOLDEN_PATH_CHECKLIST.md` |
| Sign-off | Tech + Ops + Product | `npm run pilot:record-signoff` |
