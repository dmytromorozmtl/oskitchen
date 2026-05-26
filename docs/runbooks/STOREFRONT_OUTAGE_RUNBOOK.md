# Storefront outage runbook

## Symptoms
- Storefront 5xx, checkout errors, theme not loading

## First checks
1. `/api/health` and deployment status.
2. Storefront publish state vs draft theme.
3. Stripe keys for checkout.

## Safe actions
- Roll back theme change, disable aggressive redirects, verify `NEXT_PUBLIC_APP_URL`.
