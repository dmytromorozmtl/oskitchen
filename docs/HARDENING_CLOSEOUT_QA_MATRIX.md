# Hardening closeout QA matrix

| # | Check | How | Owner |
|---|-------|-----|-------|
| 1 | Webhook `processingError` redacted | Inject bearer substring into DB row in dev; confirm UI shows `[REDACTED]` family + label | QA |
| 2 | Sensitive token in preview | Stripe sk_test fragment in error | QA |
| 3 | Replay/retry unavailable honest | Disabled buttons / inline “not available yet” | QA |
| 4 | No fake audit on replay | Confirm audit table has no replay entries when clicking disabled control | QA |
| 5 | Platform read-only integration health | `/platform/workspaces/.../integration-health` loads | QA |
| 6 | Static demo checker | `npm run check-demo-scenarios` | CI |
| 7 | DB demo checker refuses prod | `NODE_ENV=production` without allow flag exits 2 | CI |
| 8 | CI YAML valid | GitHub workflow editor / `act` optional | Eng |
| 9 | Support session start requires permission + reason | Negative tests in staging | QA |
| 10 | Support session banner | Cookie + active row | QA |
| 11 | Support session end | Cookie cleared | QA |
| 12 | Client cannot access platform routes | Non-staff account | QA |
