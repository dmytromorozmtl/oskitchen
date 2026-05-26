# Test coverage expansion plan

## Added in this pass
- `tests/unit/capability-matrix-snapshot.test.ts`
- `tests/unit/rate-limit.test.ts`
- `tests/unit/release-navigation.test.ts`
- `tests/unit/webhook-retry-service.test.ts`
- `tests/unit/scope-validation-service.test.ts`

## Next E2E (no prod secrets in CI)
1. Signup → onboarding stub with mocked billing flags
2. Storefront guest checkout happy path against preview slug
3. Webhook golden files against dev server with test connection ids
4. Platform access denial for non-admin (already partially covered — extend)

## Contract tests
- Capability matrix snapshot stable across env permutations (table-driven).
