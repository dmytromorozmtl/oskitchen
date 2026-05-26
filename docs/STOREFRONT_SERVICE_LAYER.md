# Storefront service layer

Server actions should validate auth/inputs and call services for Prisma-heavy or reusable logic.

| Service | Responsibility |
|---------|------------------|
| `services/storefront/storefront-form-service.ts` | Form CRUD helpers, archive cascade, link public forms, mark submission read |
| `services/storefront/storefront-form-submission-service.ts` | Public form POST pipeline (email + conversion event) |
| `services/storefront/storefront-redirect-service.ts` | Resolve redirect, upsert/delete with path validation |
| `services/storefront/storefront-fulfillment-rule-engine.ts` | Loads rules + counts, calls `evaluateFulfillmentRulesJson` |
| `services/storefront/storefront-fulfillment-rule-service.ts` | Minimal JSON shape validation before save |
| `services/storefront/storefront-test-order-service.ts` | Create / purge test orders |
| `services/storefront/storefront-theme-service.ts` | Theme URL safety assert + Prisma field mapping |
| `services/storefront/storefront-domain-verification-service.ts` | DNS TXT + resolve-host check (existing) |
| `services/storefront/storefront-analytics-report-service.ts` | Dashboard aggregates (existing) |

Actions remain the entrypoint for `revalidatePath` / `revalidateStorefrontDashboardAndPublic`.
