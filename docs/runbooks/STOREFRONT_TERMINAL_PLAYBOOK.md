# Storefront release — terminal playbook (copy-paste)

Run each block **as a whole** in Terminal. Do not paste lines starting with `#` — zsh will error.

## 1. Node 22 + project

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd /Users/dmytro/Desktop/2026/OS Kitchen
nvm use 22
```

## 2. Production env file

```bash
cp .env.storefront.production.example .env.production.local
npm run storefront:env:sync-local
npm run storefront:secrets:generate
```

Edit `.env.production.local` and set a **real** app URL (not `app.yourdomain.com`):

| Variable | Example (your Vercel prod) |
|----------|----------------------------|
| `NEXT_PUBLIC_APP_URL` | `https://xn---production-xijza32a.vercel.app` |

Staging preview URL (for smoke only):

`https://xn---preview--staging-r4nxb5ja9d6q.vercel.app`

Load env and verify:

```bash
set -a && source .env.production.local && set +a
npm run check-env:storefront
npm run storefront:release-preflight
```

## 3. Local dev (one server, clean cache)

```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
rm -rf .next
node ./node_modules/prisma/build/index.js generate
node scripts/ensure-prisma-client-default.cjs
node scripts/ensure-sentry-otel-shim.cjs
npm run dev
```

Open http://localhost:3000 — dashboard routes need auth; storefront smoke uses `/s/<slug>` on deployed hosts.

## 4. Staging HTTP smoke (after Vercel deploy)

```bash
export STOREFRONT_SMOKE_BASE_URL="https://xn---preview--staging-r4nxb5ja9d6q.vercel.app"
export STOREFRONT_SMOKE_SLUG=hello
export STOREFRONT_STRIPE_OPTION=A
npm run storefront:qa-artifact
```

404 on all `/s/hello/*` means: wrong URL, slug not published, or deployment missing routes — not a local Prisma issue.

List published slugs:

```bash
npm run storefront:list-slugs
```

## 5. Production smoke (after prod deploy + env in Vercel)

```bash
export STOREFRONT_SMOKE_BASE_URL="https://xn---production-xijza32a.vercel.app"
export STOREFRONT_SMOKE_SLUG=hello
export STOREFRONT_SMOKE_ENV=production
npm run storefront:post-deploy
```

## 6. Tier-2 cron game-day (real staging only)

Placeholder hosts (`your-staging.vercel.app`, `staging.example`) always return **404 DEPLOYMENT_NOT_FOUND** — that is expected.

```bash
export STAGING_BASE_URL="https://xn---preview--staging-r4nxb5ja9d6q.vercel.app"
export CRON_SECRET="your-cron-secret-from-vercel"
npm run ops:tier-2-staging-game-day-curl
```

## 7. What failed in your log (quick map)

| Symptom | Cause | Fix |
|---------|--------|-----|
| `command not found: npm` | No nvm in shell | Section 1 |
| `zsh: command not found: #` | Pasted markdown comments | Paste commands only |
| `Can't resolve .prisma/client/default` | Prisma client not generated | `db:generate` + `ensure-prisma-client-default.cjs` |
| `node:child_process` / `node:crypto` in middleware | Edge bundle pulled snarkjs | Fixed via `next.config` edge aliases |
| `check-env` placeholder URL | `app.yourdomain.com` in prod env | Set real `NEXT_PUBLIC_APP_URL` |
| Smoke 404 | Wrong `STOREFRONT_SMOKE_BASE_URL` or slug | Sections 4–5 |
| 52 crons 404 | Staging URL not deployed | Section 6 with real URL |

## 8. Ops phase scripts (optional)

Unit tests only (no live deploy required):

```bash
npx vitest run tests/unit/theme-experiment-phase-*.test.ts
npm run ops:phase-am-prod-wiring
```
