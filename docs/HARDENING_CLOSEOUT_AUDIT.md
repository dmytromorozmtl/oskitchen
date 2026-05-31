# Hardening closeout audit

Date: 2026-05-14 · Scope: OS Kitchen platform + dashboard integration surfaces, demo tooling, CI, support session foundation.

## 1. Demo scenario static checker

| Item | Current state | Risk | Fix now | Defer | Files / routes | Priority |
|------|---------------|------|---------|--------|----------------|----------|
| Static plan audit | `npm run check-demo-scenarios` validates `GOLDEN_DEMO_SCENARIOS` lines vs `DEMO_SCENARIO_REQUIREMENTS` | Misleading if DB empty but plan PASS | Added optional DB audit script | Deeper fixture contracts | `scripts/check-demo-scenarios.ts`, `services/demo/demo-scenario-audit-service.ts` | P2 |
| DB seed truth | New read-only audit for owner workspace when `demoMode` on | Same | `check-demo-scenarios:db` + service | Automated seed from CI without secrets | `services/demo/demo-scenario-db-audit-service.ts`, `scripts/check-demo-scenarios-db.ts` | P2 |

## 2. Demo seed services

| Item | Current state | Risk | Fix now | Defer | Priority |
|------|---------------|------|---------|--------|----------|
| Seed engine | Existing Prisma seed / import paths unchanged | Production misuse | Script refuses prod without flag; requires demo workspace + demoMode | `--seed` automation | P0/P2 |

## 3. Webhook `processingError` rendering

| Item | Current state | Risk | Fix now | Defer | Files | Priority |
|------|---------------|------|---------|--------|-------|----------|
| Truncation only | Was `slice` in several UIs | Token/URL leakage in UI | `toSafeErrorPreview` + `SensitiveErrorPreview` | Payload viewers | `app/platform/webhooks`, dashboard webhook pages, `integration-health-readonly`, `platform-workspace-integration-health-service` | P0 |
| Payload JSON | Not shown in these surfaces | Low if unchanged | No raw `payloadJson` added | Gated payload inspector | — | P3 |

## 4. Replay / retry UI surfaces

| Item | Current state | Risk | Fix now | Defer | Priority |
|------|---------------|------|---------|--------|----------|
| Fake actions | `getIntegrationActionAvailability` gates UI | Fake audits / implied success | Shared `IntegrationActionButton`, inline hints | Real replay/retry server actions + permissions | Multiple routes | P0 |
| Channel cards | Webhook URLs + honesty row | Implied replay | Inline buttons (disabled) | Execute wiring | `components/channels/channel-card.tsx` | P1 |

## 5. Platform RBAC

| Item | Current state | Risk | Fix now | Defer | Priority |
|------|---------------|------|---------|--------|----------|
| Permissions | `platform-permissions.ts` union + role sets | Support cannot start sessions | `SUPPORT_ADMIN` gets `platform:support-session:start` | Fine-grained impersonation | `lib/platform/platform-permissions.ts` | P1 |
| `/platform` gate | Layout uses `requirePlatformAccess` | Client access | Unchanged | — | P0 |

## 6. Support / impersonation primitives

| Item | Current state | Risk | Fix now | Defer | Priority |
|------|---------------|------|---------|--------|----------|
| Support session | Prisma `PlatformSupportSession`, start/end actions, cookie, banners | Unsafe edit-as-owner | READ_ONLY only; founder guard on protected owner | ASSISTED_EDIT enforcement across mutations | `services/platform/platform-support-session-service.ts`, `actions/platform-support-session.ts` | P0/P1 |
| Impersonation bar | Existing platform impersonation bar | Confusion with support session | Separate support banner | Merge UX | `app/platform/layout.tsx` | P2 |

## 7. CI / scripts

| Item | Current state | Risk | Fix now | Defer | Priority |
|------|---------------|------|---------|--------|----------|
| GitHub Actions | New `ci.yml` | Drift / no PR signal | Workflow runs core scripts | DB-backed demo job with secrets | `.github/workflows/ci.yml` | P2 |
| Install chain | `verify:install-chain` | Broken deps | In CI | — | P2 |

## 8. Sensitive redaction coverage

| Item | Current state | Risk | Fix now | Defer | Priority |
|------|---------------|------|---------|--------|----------|
| Central lib | `redactSensitiveText` + patterns | Gaps in novel formats | Extend patterns as incidents arrive | ML classifiers | `lib/security/sensitive-redaction.ts` | P0 |
| Tests | Vitest unit file | Regression | Added | — | `tests/unit/sensitive-redaction.test.ts` | P2 |

## Priority legend

- **P0** — Security / misleading UI.
- **P1** — Platform support blocker.
- **P2** — QA / reliability.
- **P3** — Future enhancement.
