# Final launch readiness QA

## Automated (this branch)
- `npm run typecheck` — pass
- `npm run lint` — pass (existing warnings unchanged)
- `npm test` — pass (90 tests)
- `npm run build` — pass

## Manual
- [ ] Run `npx prisma migrate deploy` with new `webhook_processing_jobs` migration on staging.
- [ ] Toggle `WEBHOOK_ASYNC_QUEUE` on staging + verify cron processes Woo backlog.
- [ ] Verify `/trust/status` and `/integrations` matrix render.
- [ ] Pilot nav: set `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot` and spot-check sidebar.
- [ ] Legal: counsel review before `LEGAL_POLICIES_PUBLISHED=true`.

## Honesty checklist
- [ ] No live claims for Uber marketplace, DoorDash, SMS, offline POS, Stripe Terminal hardware, SOC2, SSO without proof.
