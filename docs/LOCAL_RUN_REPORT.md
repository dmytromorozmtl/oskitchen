# Local run report

## Automated run (Cursor agent)

**Date:** _(update when you run checks locally)_

The cloud/agent terminal used for this repo **does not ship with `npm` or Homebrew** (only a standalone `node` helper). Because of that, the agent **cannot** execute `npm install`, `npm run typecheck`, or `npm run build` on your behalf.

All verification must be done **on your Mac** using a real terminal.

## What was prepared for you

| Item | Purpose |
|------|---------|
| `scripts/local-check.sh` | Runs `npm install` → `prisma generate` → `typecheck` → `build` with Homebrew `PATH` fixes |
| `npm run local-check` | Shortcut to the script |
| `docs/LOCAL_NODE_SETUP.md` | Node/npm/Homebrew troubleshooting |
| `.env.local` | Created from `.env.example` with **template placeholders** — replace with real Supabase + DB URLs |
| `lib/supabase/config.ts` + middleware | Avoid Supabase client crashes when env is still placeholder; prod protects `/dashboard` |

## Your machine — fill this in after running locally

Run:

```bash
cd /Users/dmytro/Desktop/2026/OS Kitchen
node -v
npm -v
npm run local-check
# optional, when DATABASE_URL is real:
# npm run db:migrate
npm run lint
npm run dev
```

| Step | Status | Notes |
|------|--------|------|
| `node -v` | ☐ | e.g. v22.x |
| `npm -v` | ☐ | e.g. 10.x |
| `npm install` | ☐ | Use `npm install --legacy-peer-deps` only if install fails |
| `npx prisma generate` | ☐ | |
| `npm run typecheck` | ☐ | |
| `npm run build` | ☐ | |
| `npm run lint` | ☐ | |
| `npm run db:migrate` | ☐ | Only with valid `DATABASE_URL` / `DIRECT_URL` |
| `npm run dev` | ☐ | http://localhost:3000 |

## Known limitations until you configure services

- **Supabase:** Replace `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` for real login/signup/session refresh.
- **Database:** Prisma needs real `DATABASE_URL` and `DIRECT_URL` for migrations and server actions that touch the DB.
- **Stripe / Resend / Cron:** Optional for local UI; routes should degrade gracefully when keys are missing.

## Exact next command

```bash
cd /Users/dmytro/Desktop/2026/OS Kitchen && chmod +x scripts/local-check.sh && npm run local-check
```

If `npm` is missing, open `docs/LOCAL_NODE_SETUP.md` first.
