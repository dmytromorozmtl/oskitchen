# Beta email automation

## Current capabilities

- `sendBetaApplicantEmail` wraps `sendRawEmail` when Resend is configured.
- Templates (text): approval + waitlist copy in `beta-email-service.ts`.
- `createInvitationRecord` stores invite token rows when an approval email is triggered (best-effort).

## Safety

- No blast sends from public routes.
- Founder-triggered actions live in `actions/beta-operations.ts` behind `assertBetaProgramAccess`.

## Roadmap

- HTML templates + preview.
- Webhook logging / Resend event ingestion for delivery analytics.
- Drip sequences (waitlist nurture) via `lifecycle_email` patterns.
