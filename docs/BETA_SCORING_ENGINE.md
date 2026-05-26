# Beta scoring engine

## Inputs

- Business type, weekly volume text, channels JSON, pain text, feature tokens, country, website presence.
- Optional: locations, team size, onboarding urgency, integrations text.

## Outputs (0–100 unless noted)

- **fitScore** — wraps existing `scoreBetaLead` for parity with Growth CRM.
- **expansionScore** — locations, team, multi-concept types.
- **activationProbability** — blend of fit + expansion + urgency + integration signals.
- **riskScore** — shallow context, OTHER type, missing site, short pain.
- **onboardingReadiness / expansionPotential** — stored for dashboard columns.
- **onboardingComplexity / estimatedOnboardingDays** — heuristic onboarding sizing.

## Refresh

`services/beta/beta-scoring-service.ts::refreshBetaLeadScores` recomputes after stage changes (best-effort async).
