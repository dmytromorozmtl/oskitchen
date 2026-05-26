# Technical architecture

Stack: Next.js, Prisma, Postgres/Supabase, Stripe, Vercel-ready deployment.

Architecture status:
- Existing data remains `userId` scoped.
- Organization/workspace/brand foundations added.
- API keys and public API foundations exist.
- Audit logs and support tickets added.

Roadmap: resolver-based workspace scoping, queues for imports/webhooks, rate limits, SSO/SCIM.
