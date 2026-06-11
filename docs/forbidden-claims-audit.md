# Forbidden claims audit — top marketing routes (P1-71)

Blueprint task **P1-71** audits public marketing copy on five high-traffic routes for
governance blocklist hits and required honesty markers.

## Audited routes

| Route | Page module | Honesty markers | Status |
|-------|-------------|-----------------|--------|
| `/` | `app/page.tsx` | partner-gated, not live today, Integration Health | PASS |
| `/pricing` | `app/pricing/page.tsx` | Conservative estimate, not as a guaranteed, no hardware lock-in | PASS |
| `/demo` | `app/demo/page.tsx` | demo, No signup, temp workspace | PASS |
| `/trust` | `app/trust/page.tsx` | not formal SOC 2, BETA, SKIPPED | PASS |
| `/shopify` | `app/shopify/page.tsx` | beta, not listed on Shopify App Store, Honest scope | PASS |

## Scan scope

Each route scans its page module plus wired marketing components and content modules.
Forbidden phrases come from `lib/governance/marketing-claims-governance-policy.ts` and
`lib/governance/forbidden-claims-manual-audit-policy.ts`.

### `/` — Home

- `components/marketing/home-landing.tsx` — Uber Eats / DoorDash labeled partner-gated, not live today
- `components/marketing/landing-integration-health-moat.tsx` — Integration Health moat strip

### `/pricing` — Pricing

- `components/marketing/pricing-page.tsx` — ROI calculator labeled conservative estimate, not guaranteed
- `components/marketing/pilot-pricing-section.tsx` — published SKU tiers, no hardware lock-in
- `lib/marketing/public-pricing-content.ts`, `lib/marketing/pricing-faq.ts`

### `/demo` — Demo hub

- `components/demo/demo-launch-button.tsx`, `components/demo/demo-import-form.tsx`
- Temp workspace with 50 orders — not production tenant claims

### `/trust` — Trust center

- `components/marketing/trust-maturity-labels-section.tsx` — BETA / Preview / SKIPPED / Live badges
- Security section explicitly negates formal SOC 2 / HIPAA / PCI attestation claims

### `/shopify` — Shopify bundle

- `lib/marketing/shopify-bundle-content.ts` — custom app beta, not App Store listed
- Inventory hooks labeled BETA; cross-channel unification not a sales claim

## Governance cross-refs

- `docs/feature-maturity-matrix.md` — feature maturity source of truth
- `docs/forbidden-claims-training.md` — sales certification
- `config/marketing/claims-registry.json` — approved claim registry
- `npm run verify-claims` — repo-wide marketing claims CI gate

## CI

```bash
npm run audit:forbidden-claims-marketing-pages
npm run test:ci:forbidden-claims-audit
```

Artifact: `artifacts/forbidden-claims-marketing-pages-audit.json`

Policy: `forbidden-claims-audit-p1-71-v1`
