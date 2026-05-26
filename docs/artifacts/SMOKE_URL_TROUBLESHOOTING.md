# Storefront smoke URL — troubleshooting

## `zsh: no such file or directory: prod`

**Cause:** You ran a command with literal angle brackets from the docs:

```bash
# WRONG — zsh interprets <prod> as input redirection
STOREFRONT_SMOKE_BASE_URL=https://<prod>
```

**Fix:** Use your **real** URL in **quotes**:

```bash
export STOREFRONT_SMOKE_BASE_URL="https://your-project.vercel.app"
export STOREFRONT_SMOKE_SLUG=hello
npm run storefront:post-deploy
```

Find the URL: **Vercel → Project → Deployments → Production** → open → copy domain (no trailing `/`).

---

## `HTTP smoke: 10 check(s) failed` + `fetch failed`

**Cause:** Smoke targeted a host that is not running or not deployed:

| Symptom | Likely cause |
|---------|----------------|
| `Connection refused` | `localhost:3000` but `npm run dev` is off |
| `fetch failed` (all 10) | Wrong URL, or preview expired |
| `404` on `/s/hello` | Store not published, or wrong slug |

**Fix:**

1. Deploy to Vercel (staging or production).
2. Confirm slug: `npm run storefront:list-slugs` → use `hello`.
3. Open in browser: `https://YOUR-HOST/s/hello` — must load.
4. Re-run smoke with the **same** host.

---

## `NEXT_PUBLIC_APP_URL — app.yourdomain.com` shows ✓ but is wrong

**Cause:** Old check treated any valid URL as pass, including the template placeholder.

**Fix:**

```bash
# Edit .env.production.local (one line):
NEXT_PUBLIC_APP_URL=https://YOUR-REAL-PROD-HOST

npm run check-env:storefront
npm run storefront:vercel-manifest
```

Must match the host you use in Vercel Production and in `STOREFRONT_SMOKE_BASE_URL` for post-deploy.

---

## Warnings (OK for day-1 launch)

| Warning | Meaning |
|---------|---------|
| Turnstile optional | Week 1 — add keys later |
| Redirects not enabled | Set `STOREFRONT_REDIRECTS_ENABLED=true` after prod stable |
| Media bucket | Phase C — HTTPS URLs only until bucket env set |
