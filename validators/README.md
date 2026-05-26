# Validators

Prefer **Zod** schemas colocated with actions (`lib/schemas/*`) or here for cross-cutting DTOs.

New server actions should validate input with Zod before touching Prisma.
