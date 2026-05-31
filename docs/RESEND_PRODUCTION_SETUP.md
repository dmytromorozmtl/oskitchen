# Resend production setup

## Domain verification

1. Add sending domain in Resend.
2. Create DNS records (SPF, DKIM; DMARC recommended).
3. Wait for verification — **do not** send bulk mail until verified.

## Sender

- Set `RESEND_FROM_EMAIL` to an address on the verified domain, e.g. `OS Kitchen <orders@yourdomain.com>`.
- Set `RESEND_API_KEY` in Vercel (**server only**).

## Local testing

- Use Resend test keys / limited recipients per Resend docs.
- Email HTML previews (no send): `/dashboard/developer/email-preview` — **development only** (404 in production).

## Production testing

- Send a single real message to a team inbox.
- Monitor Resend dashboard for bounces/complaints.

## Templates

- HTML lives under `lib/email/templates.ts` with shared shell.
- Add plain-text parts when tightening deliverability (incremental).

## Bounce / spam

- Keep lists clean; avoid cold promotional mail from transactional domain.
- Separate marketing subdomain/domain if doing campaigns.

## Fallback behavior

- If `RESEND_API_KEY` is unset, send helpers return early — **app must not crash** (cron + order flows already tolerate skips).

## Demo mode

- Demo routes should not trigger bulk email; keep automated sends tied to real customer data only.
