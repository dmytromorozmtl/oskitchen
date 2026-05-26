# Production deploy checklist

## Pre-deploy

1. Staging manual smoke: [MANUAL_UI_SMOKE_CHECKLIST.md](./MANUAL_UI_SMOKE_CHECKLIST.md) — all sections ✅
2. PR merged; `main` CI green
3. Backup / Supabase point-in-time recovery confirmed

## Deploy

```bash
# Production DATABASE_URL in .env or CI secret
npx prisma migrate deploy
npx prisma migrate status   # must be up to date
```

## Post-deploy smoke (5 min)

```bash
npm run smoke:team-invites -- --owner-email=workspace.moroz@gmail.com
# Or your production owner email:
# npm run smoke:team-invites -- --owner-email=owner@production.com
```

Optional public API (production host):

```bash
export SMOKE_PUBLIC_API_BASE="https://app.kitchenos.com"
export SMOKE_PUBLIC_API_KEY="kos_..."
npm run smoke:public-api
```

## Monitor (first 24h)

| Signal | Action |
|--------|--------|
| `webhook-jobs` cron | Vercel cron + `CRON_SECRET` |
| `storefront-team-invite-reminders` | Pending invites > 7d |
| Error rate on `/api/webhooks/stripe` | Stripe dashboard delivery log |
| Invite audit FK errors | Should be **zero** after cancel-order fix |

## Rollback

1. Revert app deploy (Vercel previous deployment)
2. **Do not** drop `storefront_team_invites` table without backup
