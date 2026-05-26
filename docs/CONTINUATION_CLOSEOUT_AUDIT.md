# Continuation closeout audit

| Item | Current state | Gap | Recommendation | Risk | Files / routes | Priority |
|------|---------------|-----|----------------|------|----------------|----------|
| Purchasing shortage QA | Card + Today + integrity; QA matrix thin | Matrix did not enumerate purchasing | Extend `docs/FOLLOW_UP_QA_MATRIX.md` | Low | `app/dashboard/purchasing/page.tsx`, docs | P2 |
| Platform → workspace integration health | Owner-only dashboard | Platform needed read-only drilldown | `/platform/workspaces/[id]/integration-health` | Medium — cross-tenant reads | New route + service + component | P1 |
| Landing alignment | Meal-prep-heavy copy | OS positioning not in sections | Rewrite features / how-it-works / FAQ | Low | `components/landing/*` | P2 |
| Pricing honesty | Registry-backed; webhook “replay” wording | Over-strong webhook claim | Honest ingestion/replay language | Low | `components/marketing/pricing-page.tsx` | P2 |
| Demo clarity | Vertical cards only | Golden six not on `/demo` | Golden grid + CTAs | Low | `app/demo/page.tsx`, `app/platform/demo/page.tsx` | P2 |
| Trust enterprise language | Strong disclaimer | SSO/SCIM clarity | Disclaimer + grid copy | Low | `app/trust/page.tsx` | P2 |
| Golden demo completeness | Plans documented | No automated check | Static audit + script | Low | `lib/demo/demo-scenario-requirements.ts`, `services/demo/demo-scenario-audit-service.ts`, `scripts/check-demo-scenarios.ts` | P1 |
| Clean install / shim | postinstall shim | CI silent failure risk | `verify:install-chain` script + doc | Low | `scripts/verify-clean-install-chain.ts`, docs | P2 |
| Replay/retry honesty | Constants reserved | UI could mislead | `getIntegrationActionAvailability` + audits | Low | `lib/integrations/integration-action-availability.ts` | P0 misleading if violated |
