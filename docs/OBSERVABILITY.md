# Observability & error reporting

## Application logging

Use **`lib/logger.ts`**:

- Development: structured console output.
- Production: safe wrapper — **never log secrets**; prefer `redactForLog()` for payloads.

## Correlation IDs

Incremental improvement:

1. Generate `x-request-id` per inbound request (middleware / route handler).
2. Attach to Prisma queries via logging middleware (advanced).

## Integration errors

- Classify errors: `auth`, `rate_limit`, `validation`, `provider_outage`, `unknown`.
- Persist last failure message per integration connection (surface in UI).

## Webhook processing logs

- Store provider event id, HTTP status, processing outcome, duration ms.
- Owner views via dashboard webhook viewer / Developer page aggregates.

## Optional: Sentry (placeholder)

Recommended stack:

1. Create Sentry project (Next.js SDK).
2. Set `SENTRY_DSN` server + browser (public DSN only in `NEXT_PUBLIC_*`).
3. Upload source maps in CI.

> Not bundled by default — add when launch traffic warrants it.

## Support debugging checklist

1. Confirm `NEXT_PUBLIC_APP_URL` matches user-facing domain.
2. Check Supabase Auth logs for session issues.
3. Check Stripe webhook dashboard for delivery failures.
4. Query recent webhook rows for provider errors (redacted).
5. Reproduce with **demo workspace** before touching production customer data.

## Log policy

- No raw tokens, cookies, or service role keys.
- Truncate email/phone in logs unless strictly necessary.
