# Nutrition verification workflow

Statuses: `NOT_STARTED`, `NEEDS_REVIEW`, `VERIFIED`, `EXPIRED`, `BLOCKED`.

Actions (server): `actions/nutrition-label-verification.ts` — verify nutrition/allergen/ingredient, set nutrition status.

Audit: every change should go through `appendLabelVerificationEvent` (`services/nutrition-labels/label-verification-log.ts`).

Superadmin / owner rules: reuse existing auth patterns when tightening RBAC.
