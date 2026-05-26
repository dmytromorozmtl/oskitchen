# Incident response runbook — KitchenOS pilot

## Roles

| Role | Responsibility |
|------|----------------|
| **On-call engineer** | Triage, mitigate, communicate status |
| **Product owner** | Pilot customer comms, scope decisions |
| **Security** | IDOR / auth / webhook abuse |

## Severity

| Level | Examples | Response target |
|-------|----------|-----------------|
| **SEV-1** | Data leak across tenants, prod down, payment corruption | 15 min acknowledge, 4h mitigate |
| **SEV-2** | Cron stopped, webhooks failing, invite broken | 1h acknowledge, 24h fix |
| **SEV-3** | UI bug, slow list, non-critical integration | Next business day |

## Signals (where to look)

| Signal | Source |
|--------|--------|
| `ops_signal` logs | Vercel / log drain — `cron_failure`, `webhook_signature_invalid` |
| Sentry | `SENTRY_DSN` — filter `ops_signal` tag |
| Failed webhooks | Dashboard → Integration health → invalid signature count |
| Cron | Vercel cron logs for `/api/cron/webhook-jobs`, invite reminders |
| DB | `storefront_team_invites` pending count; migration status |

## Playbooks

### Tenant data visible to wrong user (SEV-1)

1. Disable affected route via deploy revert or feature flag.
2. Identify scope bug (`userId` vs `dataUserId`) in actions/API.
3. Audit access logs / `platform_audit` / invite audit export.
4. Notify affected tenants per legal guidance.

### Cron failure spike

1. Check `CRON_SECRET` on Vercel matches env.
2. Run single cron manually: `curl -H "Authorization: Bearer $CRON_SECRET" https://HOST/api/cron/webhook-jobs`
3. Review `ops_signal` `cron_failure` with `route` tag.

### Webhook signature failures

1. Expected during misconfiguration — confirm tenant rotated secret.
2. Spike without config change — possible attack; rate limits apply.
3. Woo: verify `cid` query param matches connection id.

### Invite / magic link broken

1. `npm run smoke:team-invites -- --owner-email=OWNER`
2. Check `storefront_team_invites` + audit events.
3. Confirm `NEXT_PUBLIC_APP_URL` matches link domain.

### Migration failed

1. **Do not** run destructive SQL.
2. `npx prisma migrate status`
3. Apply fix-forward migration only.

## Pilot SLA (committed)

| Item | SLA |
|------|-----|
| SEV-1 acknowledge | 15 minutes (business hours); 2h off-hours best effort |
| SEV-2 fix or workaround | 1 business day |
| Security IDOR report | 48h assessment, 7d fix for confirmed P0 |

## Post-incident

1. Timeline + root cause in internal doc.
2. Update `docs/IDOR_MUTATION_INVENTORY.md` if tenancy-related.
3. Add regression test or smoke step.
