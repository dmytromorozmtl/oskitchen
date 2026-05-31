# ADR 0001: Monolith on Next.js 15 with Server Actions

**Status:** Accepted  
**Date:** 2026-05-24

## Context

OS Kitchen spans POS, KDS, storefront, accounting, and integrations. Team size is one founder; operational complexity must stay low.

## Decision

Single Next.js 15 monolith:

- **UI:** App Router (689 pages), React 19
- **Mutations:** Server Actions (`actions/`) + service layer (`services/`)
- **Integrations / webhooks / cron:** API routes (`app/api/`)
- **Data:** Prisma → PostgreSQL (Supabase)

## Consequences

**Positive:** One deploy unit, shared types, fast iteration, colocated loading/error UI.  
**Negative:** Large bundle surface; strict tenant discipline required; horizontal scale = scale DB + Vercel concurrency, not microservices.

## Alternatives considered

- Microservices — rejected (ops cost)
- Separate storefront app — rejected (duplicate auth/catalog)
