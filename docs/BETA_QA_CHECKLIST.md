# Beta program QA checklist

## Public

- [ ] `/beta` renders with UTM query params hidden in form submission.
- [ ] Honeypot filled → silent success, no row.
- [ ] Duplicate email within 2h → silent success, no duplicate row.
- [ ] \>8 submissions / 24h per email → error toast.
- [ ] Consent unchecked → error.

## Dashboard

- [ ] Non-GTM staff cannot open `/dashboard/beta-applications`.
- [ ] Owner + superadmin + GTM roles can open.
- [ ] Stage select updates row + timestamps (where applicable).
- [ ] Bulk stage applies to multi-select.
- [ ] Cohort select updates assignment.
- [ ] Notes save.
- [ ] Approval / waitlist email respects Resend configuration.

## Data

- [ ] `prisma migrate deploy` applied in staging before go-live.
- [ ] Seed cohorts appear once (idempotent).

## Build

- [ ] `npm run typecheck`
- [ ] `npm run build`
