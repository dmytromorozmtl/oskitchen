# Architecture Decision Records (ADR)

Lightweight log of significant technical decisions. Format based on [Michael Nygard's ADR template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-monolith-nextjs-server-actions.md) | Monolith on Next.js 15 with Server Actions | Accepted |
| [0002](0002-tenant-workspace-scoping.md) | Tenant isolation via workspaceId migration | In progress |
| [0003](0003-inline-webhook-queue.md) | INLINE_LOW_VOLUME webhook processing | Accepted |
| [0004](0004-supabase-postgres-stack.md) | Supabase Postgres + PgBouncer + Realtime | Accepted |
| [0005](0005-production-cron-allowlist.md) | Production cron allowlist vs experimental routes | Accepted |

When adding an ADR: copy the template from any `000x-*.md` file, increment the number, and update this table.
