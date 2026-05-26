# ADR 0004: Supabase Postgres + PgBouncer + Realtime

**Status:** Accepted  
**Date:** 2026-05-24

## Context

Need managed Postgres, auth-compatible stack, and realtime KDS/order updates.

## Decision

- **Database:** Supabase PostgreSQL with PgBouncer (`poolerConfigured: true` in health check)
- **Auth:** Supabase SSR sessions for dashboard/platform
- **Realtime:** Supabase channels on `orders` for KDS (`components/kitchen/kds-daily-service.tsx`)

## Consequences

**Positive:** Fast MVP, built-in realtime, connection pooling.  
**Negative:** Vendor coupling; latency baseline ~400ms on health probe — monitor under multi-tenant load.

## Alternatives

Neon/RDS + custom auth — deferred until scale or compliance requires self-hosting.
