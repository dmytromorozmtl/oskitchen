# Vercel Redeploy — Staging Environment

**Symptom:** `curl https://your-preview.vercel.app/api/health` returns **404** with body `DEPLOYMENT_NOT_FOUND`.

**Cause:** Preview deployment expired, was deleted, or `NEXT_PUBLIC_APP_URL` points at an old URL.

---

## Option A — Vercel Dashboard (recommended)

1. Open [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select the **KitchenOS** project
3. Open **Deployments**
4. Find the latest deployment for branch `main` or `pilot-18may`
5. If status is **Ready** — copy the **Visit** URL (ends with `.vercel.app`)
6. If no ready deployment — open the latest row → **⋯** → **Redeploy**
7. Wait until build completes (green **Ready**)
8. Copy the new preview URL

Update local env:

```bash
# In .env.staging.local
NEXT_PUBLIC_APP_URL=https://YOUR-NEW-PREVIEW.vercel.app
```

Optional:

```bash
echo "STAGING_URL=https://YOUR-NEW-PREVIEW.vercel.app" > .staging-deploy-url
```

Verify:

```bash
curl -s https://YOUR-NEW-PREVIEW.vercel.app/api/health | head -c 200
# Expect JSON with "status":"ok" or "degraded" (HTTP 200/503), NOT plain-text DEPLOYMENT_NOT_FOUND
```

---

## Option B — Vercel CLI

```bash
npm i -g vercel
vercel login
cd /path/to/KitchenOS
vercel link    # if not linked yet

# Push env to Vercel staging (after .env.staging.local is filled)
npm run vercel:staging-push -- --apply

# Deploy preview
vercel deploy --yes

# Or use repo script (runs preflight + migrate + deploy)
bash scripts/ops/deploy-staging.sh
```

Copy the URL printed by the CLI (last `https://….vercel.app` line).

---

## After you have a live URL

```bash
export STAGING_URL=https://YOUR-NEW-PREVIEW.vercel.app
bash scripts/ops/verify-staging.sh

export PLAYWRIGHT_BASE_URL=$STAGING_URL
npm run test:e2e:pilot:http
```

See also: `docs/OPS_STAGING_QUICKSTART.md`, `docs/PILOT_FINAL_CHECKLIST.md`.
