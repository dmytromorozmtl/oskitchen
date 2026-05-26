# Deploy: `storefront_team_invites` (phase 6)

**Migration:** `20260625100000_storefront_phase6_invites`  
**Risk:** Low — additive table + indexes only.

## Staging (within 24h)

```bash
npx prisma migrate deploy
npx prisma migrate status   # expect: no pending
```

Smoke (see **`docs/STAGING_SMOKE_COMMANDS.md`** — do not use angle-bracket placeholders):

```bash
npm run smoke:team-invites -- --list
npm run smoke:team-invites -- --owner-email=you@company.com
```

Manual UI smoke:

1. Dashboard → Team → invite email (create).
2. Open magic link in incognito (accept).
3. Cancel a pending invite.

## Production

1. Maintenance window not required (additive).
2. Run `migrate deploy` from CI or release job with production `DATABASE_URL`.
3. Re-run smoke script against one internal test workspace.
4. Monitor logs: `storefront_invites_migrated_from_json`, `storefront_team_invite_*`.

## Rollback

Do **not** drop the table in production without backup. If rollback is mandatory, revert application deploy first; table can remain unused.

## Monitoring

| Signal | Where |
|--------|--------|
| Pending invite count | `storefront_team_invites` where `accepted_at IS NULL` |
| Cron reminders | `/api/cron/storefront-team-invite-reminders` (requires `CRON_SECRET`) |
| Audit retention | `/api/cron/storefront-invite-audit-retention` |
