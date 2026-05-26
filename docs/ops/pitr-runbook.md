# Point-in-Time Recovery — Supabase

**RPO:** 1 hour · **RTO:** 4 hours · **Owner:** on-call engineer

## When to use

- Accidental mass delete or bad migration on production
- Data corruption discovered within PITR window (typically 7 days on Pro)

## Procedure

1. **Stop writes** — enable maintenance mode or pause crons in Vercel if needed.
2. Supabase Dashboard → **Settings → Backups**.
3. Choose restore point (timestamp before incident).
4. **Restore to new database** — never overwrite production in place.
5. Verify row counts and spot-check: `orders`, `user_profiles`, `subscriptions` for one pilot workspace.
6. Update `DATABASE_URL` (and pooler URL) in Vercel production → redeploy.
7. Monitor `/api/health` for 15 minutes; confirm `database.latencyMs` &lt; 500ms.
8. Post-incident: document in `docs/ops/incidents/` and schedule schema fix forward.

## Quarterly drill

1. Create test record `pitr_drill_<date>` in staging.
2. Restore staging DB to 1 hour before record creation.
3. Confirm record absent on restored instance.
4. Log drill completion in team channel.

## Related

- `npm run workspace:migration:dry-run-report` before large migrations
- Sentry alert: DB p95 &gt; 500ms
