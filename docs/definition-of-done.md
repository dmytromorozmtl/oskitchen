# KitchenOS Definition Of Done

Status: canonical completion standard for product, engineering, QA, and GTM
Primary evidence: `docs/system-reality-model.md`, `docs/feature-maturity-matrix.md`, `docs/rbac-permission-architecture.md`, `docs/qa-master-test-plan.md`, `docs/devops-release-enterprise-readiness.md`

No feature is complete unless:

1. Product owner value is clear.
   - The feature solves a real operator problem and is described in product terms, not just implementation terms.

2. User role is clear.
   - The intended actors are explicit and mapped to canonical roles.

3. Server-side permission exists.
   - Sensitive reads and mutations use the canonical permission model.

4. Tenant isolation is protected.
   - The feature enforces workspace and actor scope correctly.

5. Audit logging exists if sensitive.
   - High-risk actions and high-risk denials are recorded.

6. Validation exists.
   - Inputs are validated on the server and critical invariants are enforced.

7. Loading state exists.
   - The user sees clear progress while work is happening.

8. Empty state exists.
   - First-use or no-data states are actionable and not dead ends.

9. Error state exists.
   - The feature explains what failed and whether the user can retry, reconfigure, or escalate.

10. Success state exists.
   - The user gets confirmation plus the next useful step.

11. Accessibility is considered.
   - Keyboard, labels, contrast, and role-appropriate accessibility needs are addressed.

12. TypeScript is strict.
   - The feature does not weaken strict typing or hide issues behind loose types.

13. Tests exist.
   - The feature includes the right mix of unit, integration, contract, or E2E tests proportional to risk.

14. Docs are updated.
   - Product, architecture, QA, or operator docs are updated where relevant.

15. Feature maturity is updated.
   - The feature’s status is reflected in `docs/feature-maturity-matrix.md`.

16. Integration state is updated if relevant.
   - Any impacted integration status is updated in the integration maturity roadmap or matrix.

17. Analytics are updated if relevant.
   - Revenue, conversion, or operational telemetry is added when it materially helps the business operate the feature.

18. Rollback plan exists if risky.
   - Risky changes have a clear rollback or forward-fix plan before release.

19. No fake production claim exists.
   - Marketing, sales, demo, docs, and UI labels do not overstate feature readiness.

20. No critical regression exists.
   - The release path that touches the feature passes the relevant quality gates and smoke tests.

## Additional KitchenOS Rules
- **Repository hygiene (`era7-tests-node-modules-hygiene-v1`):** never commit `tests/node_modules/` (nested Vitest/npm installs) or `ci-artifacts/`; CI gate `npm run test:ci:repo-hygiene:cert` fails if git tracks paths under `tests/node_modules/`.
- If a feature touches POS, billing, storefront publishing, uploads, exports, integrations, or impersonation, permission-negative tests are mandatory.
- If a feature changes a customer-facing revenue path, recovery behavior must be defined and tested.
- If a feature is preview, beta, internal-only, or placeholder, the UI and docs must say so explicitly.
- If a feature introduces a new operational surface, the owner role and runbook owner must be identified before broad rollout.
