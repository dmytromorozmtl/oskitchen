# Email (Resend) failure runbook

## Symptoms
- `NotificationLog` errors, customers report missing confirmations

## First checks
1. `RESEND_API_KEY` + `RESEND_FROM_EMAIL` and domain DNS (SPF/DKIM).
2. Resend dashboard for bounces/blocks.

## Safe actions
- Fix domain verification, rotate API key, retry from notifications retry UI where present.

## Customer template
> Transactional email delivery was delayed. Orders remain in OS Kitchen — you can verify status in your account.
