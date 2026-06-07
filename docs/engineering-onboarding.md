# Engineering onboarding — OS Kitchen

**Audience:** Full-stack engineer #2, contractor, or trusted advisor with repo access  
**Duration:** **10 business days** (2 weeks) to staging-deploy + incident drill readiness  
**Policy:** `bus-factor-mitigation-absolute-final-v1`  
**Parent:** [`bus-factor-mitigation.md`](./bus-factor-mitigation.md)

---

## Before Day 1

| # | Item | Owner |
|---|------|-------|
| 1 | GitHub org invite + branch protection reviewed | Founder |
| 2 | Vault access: Vercel, Supabase, Stripe (read-only minimum for week 1) | Founder |
| 3 | `.env.local` staging template from [`staging-environment-checklist.md`](./staging-environment-checklist.md) | Founder |
| 4 | Slack/email escalation path documented | Founder |
| 5 | Read [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) — no LIVE claims without sign-off | New hire |

---

## Week 1 — Read, run, shadow

### Day 1 — Environment + architecture

| Block | Task | Done |
|-------|------|:----:|
| AM | Clone repo; `npm install`; `npm run dev` on port 3000 | ☐ |
| AM | Read [`CONTRIBUTING.md`](../CONTRIBUTING.md) + [`docs/adr/README.md`](./adr/README.md) | ☐ |
| PM | Read ADRs [0001](adr/0001-monolith-nextjs-server-actions.md)–[0005](adr/0005-production-cron-allowlist.md) | ☐ |
| PM | Watch **Engineering video walkthrough** ([`engineering-video-walkthrough.md`](./engineering-video-walkthrough.md)) | ☐ |

**Exit:** Local app loads `/dashboard/today` with test credentials.

### Day 2 — Tenant scope + data layer

| Block | Task | Done |
|-------|------|:----:|
| AM | Read [`PLATFORM_SECURITY_TENANT_ISOLATION.md`](./PLATFORM_SECURITY_TENANT_ISOLATION.md) | ☐ |
| AM | Trace one Server Action: `actions/` → `services/` → Prisma `workspaceId` | ☐ |
| PM | Run `npm run workspace:audit:gate` | ☐ |
| PM | Read ADR [0002](adr/0002-tenant-workspace-scoping.md) | ☐ |

### Day 3 — CI + quality gates

| Block | Task | Done |
|-------|------|:----:|
| AM | Run `npm run lint && npm run typecheck && npm test` | ☐ |
| AM | Run `npm run test:ci:governance-bundles` (or subset from [`ci-e2e-tier-matrix.md`](./ci-e2e-tier-matrix.md)) | ☐ |
| PM | Read [`forbidden-claims-manual-audit.md`](./forbidden-claims-manual-audit.md) + run `npm run verify-claims` | ☐ |

### Day 4 — Integrations + webhooks

| Block | Task | Done |
|-------|------|:----:|
| AM | Read [`docs/runbooks/WEBHOOK_FAILURE_RUNBOOK.md`](./runbooks/WEBHOOK_FAILURE_RUNBOOK.md) | ☐ |
| AM | Read ADR [0003](adr/0003-inline-webhook-queue.md) | ☐ |
| PM | Open Integration Health at `/dashboard/integrations/health` on staging | ☐ |

### Day 5 — Deploy shadow

| Block | Task | Done |
|-------|------|:----:|
| AM | Read [`migration-deployment-process.md`](./migration-deployment-process.md) | ☐ |
| PM | **Shadow** founder staging deploy (no solo prod deploy) | ☐ |
| PM | Verify `/api/health` green on staging | ☐ |

---

## Week 2 — Execute + drill

### Day 6–7 — Feature surface tour

Navigate and note ownership (no code changes required):

| Surface | Route | Doc |
|---------|-------|-----|
| Today | `/dashboard/today` | [`pilot-week1-roadmap.md`](./pilot-week1-roadmap.md) |
| Order Hub | `/dashboard/order-hub` | [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) |
| POS | `/dashboard/pos/terminal` | [`POS_OFFLINE_MODE.md`](./POS_OFFLINE_MODE.md) |
| KDS | `/dashboard/kitchen` | [`kds-v1-scope.md`](./kds-v1-scope.md) |
| Design system | `docs/design-system.md` | Task 64 |

### Day 8 — Incident drill (staging)

| Step | Action | Done |
|------|--------|:----:|
| 1 | Read [`incident-response-process.md`](./incident-response-process.md) | ☐ |
| 2 | Simulate Sev-2: break staging webhook signature in test env | ☐ |
| 3 | Follow webhook runbook to diagnose | ☐ |
| 4 | Document learnings in onboarding notes | ☐ |

### Day 9 — Cron + observability

| Step | Action | Done |
|------|--------|:----:|
| 1 | Read [`docs/runbooks/CRON_FAILURE_RUNBOOK.md`](./runbooks/CRON_FAILURE_RUNBOOK.md) | ☐ |
| 2 | Read ADR [0005](adr/0005-production-cron-allowlist.md) | ☐ |
| 3 | Review Sentry setup [`sentry-setup.md`](./sentry-setup.md) | ☐ |

### Day 10 — Certification

| Step | Action | Done |
|------|--------|:----:|
| 1 | Solo **staging** deploy with founder on call | ☐ |
| 2 | Run `npm run test:ci:bus-factor-mitigation:cert` | ☐ |
| 3 | Sign off onboarding checklist with founder | ☐ |

---

## Access checklist (minimum)

| System | Week 1 | Week 2 (staging deploy) |
|--------|:------:|:-----------------------:|
| GitHub (write) | ✓ | ✓ |
| Vercel (viewer) | ✓ | Member |
| Supabase (read) | ✓ | Developer |
| Stripe (test mode) | Optional | Test dashboard |
| Production deploy | **No** | Founder approval only |

---

## CI certification

After Day 10, new engineer should pass:

```bash
npm run test:ci:bus-factor-mitigation:cert
npm run workspace:audit:gate
npm run verify-claims
```

---

## References

- [`bus-factor-mitigation.md`](./bus-factor-mitigation.md) — SPOF map, hire plan
- [`engineering-video-walkthrough.md`](./engineering-video-walkthrough.md) — recorded repo tour
- [`soc2-roadmap-with-timeline.md`](./soc2-roadmap-with-timeline.md) — compliance context
