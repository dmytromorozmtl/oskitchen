# Rate limiting runbook

## Symptoms

- Users see “Too many submissions” on marketing/support forms.
- `429` on `POST /api/public/v1/orders`.

## Checks

1. Identify bucket key (IP vs user id).
2. Confirm not a shared NAT false positive — tune policy in `lib/rate-limit/rate-limit-policies.ts`.

## Actions

- Temporarily raise `max` for a policy during a legitimate campaign (deploy config).
