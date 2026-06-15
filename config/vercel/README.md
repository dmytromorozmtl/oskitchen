# Vercel cron profiles

| Profile | File | Paths | Use |
|---------|------|-------|-----|
| **production** | `crons-production.json` | 6 | Prod deploy (MVP Tier A) |
| **staging / full** | `crons-full.json` | 126 | Staging, tier-2 game-day |

```bash
npm run vercel:crons:production   # before production deploy
npm run vercel:crons:staging      # restore full set for staging project
```

`vercel.json` in repo root should match **production** before merging to `main` for prod Vercel project.
