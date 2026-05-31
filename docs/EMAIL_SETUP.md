# Transactional email (Resend)

## Expected emails (product roadmap)

Implement gradually; keep UI honest when not wired:

- Welcome
- Order confirmation / ready / pickup reminder / delivery reminder
- Weekly menu / preorder deadline reminders
- Internal production alert / integration failure alert

## Domain verification

1. Resend → Domains → Add domain `yourdomain.com`
2. Add DNS records (SPF, DKIM, MX if receiving)
3. Warm up volume before major campaigns

## Sender

Set:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` — e.g. `OS Kitchen <orders@yourdomain.com>` (verified domain)

## Template system

- Prefer shared layout (HTML) + **plain text** part for deliverability.
- Brand with logo URL hosted on your domain (HTTPS).
- **Unsubscribe** footer only on marketing-style emails (not transactional receipts unless legally required in your jurisdiction — ask counsel).

## Preview mode

- In development, log email payload or use Resend test addresses — never send to real customers from dev.

## Failed sends

- Surface failures in notification log (dashboard) where implemented.
- Retry policy: exponential backoff for transient errors (implementation-specific).

## Local testing

- Point `RESEND_API_KEY` to a dev key with limited domain access.
- Use `onboarding@resend.dev` style testing per Resend docs when applicable.

## Production checklist

- [ ] Domain verified
- [ ] DMARC policy aligned with SPF/DKIM
- [ ] From/reply-to addresses monitored
- [ ] Bounce/complaint handling reviewed in Resend dashboard
- [ ] `isResendConfigured()` false → app degrades without throwing
