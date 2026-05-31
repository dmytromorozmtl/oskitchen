# Supabase pooler setup for OS Kitchen

OS Kitchen uses **two** Supabase connection strings:

| Purpose | Env var | Endpoint | Port |
|---|---|---|---|
| Next.js runtime (serverless / API routes) | `DATABASE_URL` | Transaction Pooler | **6543** |
| Prisma CLI (migrate / introspect / db execute) | `DIRECT_URL` | Session Pooler | **5432** |

Both endpoints share the same hostname pattern: `aws-0-<region>.pooler.supabase.com`. Username is `postgres.<project-ref>`. Password is the project database password.

## Why two strings?

- The **Transaction Pooler** (PgBouncer in transaction mode) is optimised for many short-lived connections from serverless functions. It does **not** keep prepared statements across calls — Prisma needs `pgbouncer=true` so it skips the prepared-statement cache.
- The **Session Pooler** (PgBouncer in session mode) holds a real Postgres session per client. Prisma `migrate` needs this to take advisory locks, manage transactions, and run prepared DDL.
- The legacy direct host `db.<project-ref>.supabase.co:5432` is **IPv6-only** on current plans. Don't use it for either string unless you have the paid IPv4 add-on.

## Recommended values

```bash
# Runtime
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=30"

# Prisma CLI / migrations
DIRECT_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
```

Notes:

- `pgbouncer=true` belongs on `DATABASE_URL` only. Remove it from `DIRECT_URL` — session-mode keeps prepared statements, and the flag silently disables features Prisma migrate uses.
- `connection_limit` / `pool_timeout` are optional and harmless on either string.
- Keep `.env` and `.env.local` synchronised; both are read by Prisma CLI and Next.js respectively.

## Migrating from the legacy direct host

If your `DIRECT_URL` still looks like `postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres`, run:

```bash
node scripts/migrate-direct-url-to-session-pooler.mjs
```

That script:

1. Detects the shape of `DATABASE_URL` and `DIRECT_URL` in both `.env` and `.env.local`.
2. Refuses to run if `DATABASE_URL` is not a Supabase transaction pooler URL (avoids accidental rewrites).
3. Derives the Session Pooler URL by swapping `:6543 → :5432` and dropping `pgbouncer=true`.
4. Writes a `.bak.<timestamp>` backup of each file before mutating it.
5. Never logs secrets — only reports the URL **class** (e.g. `supabase-session-pooler:5432`).

After running it, validate:

```bash
npm run check-env       # safe — masks secrets, reports URL shape only
npx prisma migrate status
```

## Verifying connectivity (network-only, no secrets)

```bash
nslookup aws-0-<region>.pooler.supabase.com
nc -vz aws-0-<region>.pooler.supabase.com 5432   # Session Pooler
nc -vz aws-0-<region>.pooler.supabase.com 6543   # Transaction Pooler
```

If `nslookup` returns no answer, your project is paused — open the Supabase dashboard and restore it. If TCP connect fails on 5432 / 6543, an outbound firewall is blocking those ports.

## When to use the legacy direct host

Only if you have explicitly purchased the Supabase **IPv4 Address** add-on for the project. In that case both pooler URLs **and** the direct host become reachable over IPv4, but the pooler is still preferred for stability.
