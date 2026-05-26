# GitHub repository setup

## Create repository

1. Create a **private** GitHub repository for KitchenOS.
2. Do **not** commit `.env`, `.env.local`, or service role keys.

## Initial commit

```bash
git init
git add .
git commit -m "Initial commit: KitchenOS"
git branch -M main
git remote add origin git@github.com:ORG/kitchenos.git
git push -u origin main
```

## Branch strategy

- `main` — production-deployable default.
- Feature branches + PRs → preview deployments on Vercel.

## Ignored files (verify `.gitignore`)

- `.env`, `.env*.local`
- `node_modules/`, `.next/`, `*.log`
- Vercel link `.vercel/` (optional to ignore locally)

## GitHub Actions secrets (if using CI migrate)

Examples (names illustrative):

- `DATABASE_URL` / `DIRECT_URL` — **use dedicated CI credentials where possible**
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` — if deploying via CLI

Prefer **Vercel Git integration** + separate migrate workflow with least privilege.

## Vercel GitHub integration

- Connect GitHub repo in Vercel → automatic previews per PR.
- Protect **Production** branch deployments in Vercel settings.

## Secret rotation after local exposure

If keys ever appeared in chat logs, screen shares, or committed files:

- Follow **`docs/SECRET_ROTATION_PLAN.md`** before going live.
