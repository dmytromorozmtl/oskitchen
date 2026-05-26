# Local pilot storefront — `hello`

**Your test URL:** [http://localhost:3000/s/hello](http://localhost:3000/s/hello)

Use this for **Day 1 PM manual QA** and builder/media work while Vercel prod URL is being fixed.

---

## Start dev server

```bash
npm run dev:safe
```

Wait for `Ready` in terminal.

---

## HTTP smoke (local)

```bash
npm run storefront:local-smoke
```

**Output:** `docs/artifacts/storefront-smoke-local-latest.md`

Requires `npm run dev:safe` running on port 3000.

---

## Bind localhost in env (optional)

```bash
export STOREFRONT_KNOWN_PRODUCTION_URL="http://localhost:3000"
npm run storefront:bind-deploy-url
```

> **Note:** `localhost` is for local QA only. For Ship you still need a **live Vercel** URL + `storefront:post-deploy`.

---

## Manual QA

Open in incognito: http://localhost:3000/s/hello

Tracker: [`MANUAL_QA_SESSION_2026-05-17.md`](MANUAL_QA_SESSION_2026-05-17.md)

| Page | URL |
|------|-----|
| Home | /s/hello |
| Menu | /s/hello/menu |
| Checkout | /s/hello/checkout |
| Contact | /s/hello/contact |
| Admin media | http://localhost:3000/dashboard/storefront/media |

---

## What localhost does NOT replace

| Item | Local | Vercel prod |
|------|-------|-------------|
| Manual QA | ✅ | ✅ |
| Media upload (Supabase) | ✅ if env set | ✅ |
| Lighthouse on real CDN | ❌ | ✅ |
| Redirect middleware smoke | ⚠️ partial | ✅ |
| Production Ship sign-off | ❌ | ✅ required |
