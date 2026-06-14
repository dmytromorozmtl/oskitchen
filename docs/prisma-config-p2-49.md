# Prisma config migration (P2-49)

**Policy:** `prisma-config-p2-49-v1`  
**Config:** `prisma.config.ts`

Gap P2-49 completes migration from deprecated `package.json#prisma` to `prisma.config.ts` (Prisma 6+ CLI config).

## Structure

| Setting | Location |
|---------|----------|
| Schema path | `prisma.config.ts` → `prisma/schema.prisma` |
| Migrations path | `prisma.config.ts` → `prisma/migrations` |
| Seed command | `prisma.config.ts` → `tsx prisma/seed.ts` |
| Datasource URL | `prisma/schema.prisma` (Prisma 6.x; moves to config in v7) |

## Removed

- `package.json` top-level `"prisma": { ... }` block (deprecated)

## CI

```bash
npm run check:prisma-config-p2-49
```

## Related

- `lib/prisma/prisma-config-policy.ts` — P1-15 base policy
- `tests/unit/prisma-config.test.ts` — base wiring tests

## Artifact

`artifacts/prisma-config-p2-49.json`
