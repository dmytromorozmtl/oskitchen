# Developer Security

## Hard rules

1. Never render secret env values or API key material after one-time creation.
2. All new operational tools must call `auditLog` with `category: DEVELOPER`.
3. Tenant isolation on Prisma queries (`userId` scope) unless `platformSuper` is required for break-glass.
4. Webhook replay / cache clear / migration tools → future: rate limit + secondary approval + founder-only matrix.

## References

- Platform root email: `lib/platform-owner.ts`.
- Billing / superadmin bypass: `lib/billing/access.ts`, `lib/platform-super-bypass.ts`.
