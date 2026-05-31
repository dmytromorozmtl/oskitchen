# Vercel staging redeploy checklist

Generated: 2026-05-18T11:47:33.848Z

## Symptom

All candidate URLs return **404** on `/api/health`, `/login`, `/`.

## Fix (Ops)

1. [Vercel Dashboard](https://vercel.com) → OS Kitchen project → **Deployments**
2. Find latest **staging** / **preview** deployment (or branch linked to staging)
3. Click **⋯** → **Redeploy** (use existing build or trigger new from main/staging branch)
4. Copy deployment URL (must end with `.vercel.app`)
5. Run:

```bash
npm run pilot:deploy:gate -- --url=https://YOUR-NEW-PREVIEW.vercel.app
npm run vercel:staging-push -- --apply
```

6. Verify:

```bash
npm run staging:url:probe -- --fix
SMOKE_BASE_URL=$NEXT_PUBLIC_APP_URL npm run smoke:golden-path-http
```

## CI alternative

GitHub → **Paid Pilot Gate** → Run workflow → use deployment URL from workflow summary.

## Candidates probed

- https://xn---preview--staging-r4nxb5ja9d6q.vercel.app
- https://xn---production-xijza32a.vercel.app
