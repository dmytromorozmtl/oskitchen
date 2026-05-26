# Supabase DIRECT_URL IPv6 audit

**Date:** 2026-05-11
**Symptom:** `prisma migrate deploy` (and any other `prisma migrate ...` command) returned `P1001: Can't reach database server at db.<project-ref>.supabase.co:5432`. The Next.js app at runtime kept working.

## Why runtime kept working

`prisma/schema.prisma`:

```
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

- The **runtime client** uses `url = env("DATABASE_URL")` only.
- `DATABASE_URL` is the Supabase **Transaction Pooler** (`aws-0-<region>.pooler.supabase.com:6543` with `pgbouncer=true`). That endpoint is IPv4 + IPv6 reachable, accepts very short transactions, and is the recommended target for serverless / Next.js workloads.

## Why migrations failed

- The **Prisma CLI** (`migrate`, `db pull`, `db execute`) uses `directUrl = env("DIRECT_URL")`. It needs a connection that supports session state — prepared statements, transactions, advisory locks — none of which the transaction pooler offers.
- `DIRECT_URL` previously pointed to the legacy direct host: `db.<project-ref>.supabase.co:5432`.
- On current Supabase plans (Free / Pro without the paid IPv4 add-on), the direct host **has no A record**, only AAAA (IPv6). Most ISPs, café Wi-Fi, and corporate networks don't route IPv6, so DNS resolution itself fails (`nslookup` returns `*** Can't find ... : No answer`).

That mismatch — **runtime via pooler, CLI via IPv6-only legacy host** — is why the app served pages while every migration command failed.

## The three Supabase connection endpoints

| Endpoint | Host pattern | Port | IPv4? | Session state? | Prepared statements? | Good for |
|---|---|---|---|---|---|---|
| Direct (legacy) | `db.<ref>.supabase.co` | 5432 | Add-on only | Yes | Yes | Cannot be used without IPv6 / IPv4 add-on |
| **Session Pooler** | `aws-0-<region>.pooler.supabase.com` | **5432** | Yes | Yes (per session) | Yes | **Prisma CLI / `migrate deploy` / `db execute`** |
| Transaction Pooler | `aws-0-<region>.pooler.supabase.com` | 6543 | Yes | No (per-transaction) | No — set `pgbouncer=true` | **Runtime / serverless apps** |

## Why the Session Pooler is the correct fix

- Same hostname and credentials as the working transaction pooler — no new secrets, no new DNS, no new firewall holes.
- IPv4 reachable on networks that block IPv6.
- Speaks the full Postgres protocol per session, so Prisma `migrate` can hold an advisory lock and run prepared statements during DDL.
- The `pgbouncer=true` flag is dropped because session-mode keeps prepared statements, unlike transaction-mode where Prisma must skip them.

## What changed

| File | Variable | Before | After |
|---|---|---|---|
| `.env` | `DATABASE_URL` | transaction-pooler `:6543` | **unchanged** |
| `.env` | `DIRECT_URL` | `db.<ref>.supabase.co:5432` | session-pooler `aws-0-<region>.pooler.supabase.com:5432` (no `pgbouncer=true`) |
| `.env.local` | same as above | same as above | same as above |

Backups: `.env.bak.<timestamp>` and `.env.local.bak.<timestamp>` were created automatically by `scripts/migrate-direct-url-to-session-pooler.mjs`.
