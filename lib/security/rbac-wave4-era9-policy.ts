/**
 * RBAC wave 4 Era 9 recertification — Evolution Era 9 Cycle 4.
 *
 * Re-validates Era 4–6 wave-4 sensitive mutation surfaces remain permission-gated
 * and covered by `test:ci:rbac-wave4` in the security-db job. Does not weaken RBAC.
 */

export const RBAC_WAVE4_ERA9_POLICY_ID = "era9-rbac-wave4-recert-v1" as const;

export const RBAC_WAVE4_ERA9_SECURITY_BUNDLE_ID = "rbac-wave4-security-bundle-v1" as const;

export const RBAC_WAVE4_ERA9_CI_SCRIPTS = [
  "test:ci:rbac-wave4",
  "test:ci:rbac-wave4:cert",
] as const;

/** Live negative / deny tests — must match `test:ci:rbac-wave4` in package.json. */
export const RBAC_WAVE4_ERA9_TEST_FILES = [
  "tests/unit/delivery-route-actions-rbac.test.ts",
  "tests/unit/copilot-actions-rbac.test.ts",
  "tests/unit/copilot-form-deny.test.ts",
  "tests/unit/copilot-form-deny-ci-live.test.ts",
  "tests/unit/demo-actions-rbac.test.ts",
  "tests/unit/demo-golden-scenario-rbac.test.ts",
  "tests/unit/feedback-actions-rbac.test.ts",
  "tests/unit/integration-menu-sync-rbac.test.ts",
  "tests/unit/production-calendar-actions-rbac.test.ts",
  "tests/unit/production-calendar-form-deny.test.ts",
  "tests/unit/production-calendar-form-deny-ci-live.test.ts",
  "tests/unit/holiday-packages-rbac.test.ts",
  "tests/unit/restaurant-tables-actions-rbac.test.ts",
  "tests/unit/customer-subscription-rbac.test.ts",
  "tests/unit/experiment-ethics-review-rbac.test.ts",
] as const;

export const RBAC_WAVE4_ERA9_UNIT_TESTS = [
  "tests/unit/rbac-wave4-era9-policy.test.ts",
  "tests/unit/rbac-wave4-era9-cert-live.test.ts",
] as const;

/**
 * Sensitive mutation surfaces from Era 4 wave-4 backlog — static guard markers on disk.
 * `guardMarkers` must appear in the action module source (import or call).
 */
export const RBAC_WAVE4_ERA9_GUARDED_SURFACES = [
  {
    actionPath: "actions/delivery-route.ts",
    guardMarkers: ["requireRouteMutation"],
    canonicalPermission: "routes.manage",
  },
  {
    actionPath: "actions/copilot.ts",
    guardMarkers: ["requireCopilotMutation"],
    documentedException: "copilot_capability_matrix",
  },
  {
    actionPath: "actions/demo.ts",
    guardMarkers: ["requireDemoWorkspaceMutation"],
    canonicalPermission: "templates.manage",
  },
  {
    actionPath: "actions/demo-golden-scenario.ts",
    guardMarkers: ["requireDemoWorkspaceMutation"],
    canonicalPermission: "templates.manage",
  },
  {
    actionPath: "actions/feedback.ts",
    guardMarkers: ["requireAppFeedbackSubmit"],
    documentedException: "feedback_session_only",
  },
  {
    actionPath: "actions/integration-menu-sync.ts",
    guardMarkers: ["requireIntegrationsActor"],
    canonicalPermission: "integrations.manage",
  },
  {
    actionPath: "actions/production-calendar.ts",
    guardMarkers: ["requireProductionCalendarMutation", "requireMutationPermission"],
    canonicalPermission: "production.manage",
  },
  {
    actionPath: "actions/marketing/holiday-packages.ts",
    guardMarkers: ["requireHolidayPackageMutation", "requireMutationPermission"],
    canonicalPermission: "growth.manage",
  },
  {
    actionPath: "actions/restaurant/tables.ts",
    guardMarkers: ["requireRestaurantTableMutation"],
    canonicalPermission: "pos.access",
  },
  {
    actionPath: "actions/customer-subscription.ts",
    guardMarkers: ["requireCrmMutation"],
    canonicalPermission: "customers.manage",
  },
  {
    actionPath: "actions/experiment-ethics-review.ts",
    guardMarkers: ["requireStorefrontManageActor"],
    canonicalPermission: "storefront.manage",
  },
] as const;

export const RBAC_WAVE4_ERA9_CANONICAL_DOC_PATHS = [
  "docs/rbac-permission-architecture.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/qa-master-test-plan.md",
  "docs/devops-release-enterprise-readiness.md",
] as const;

export const RBAC_WAVE4_ERA9_CANONICAL_MARKERS = [
  RBAC_WAVE4_ERA9_POLICY_ID,
  "test:ci:rbac-wave4",
  "security-db",
] as const;
