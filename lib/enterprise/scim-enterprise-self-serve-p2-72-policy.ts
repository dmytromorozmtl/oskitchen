/**
 * P2-72 — SCIM enterprise self-serve UI: group provisioning + attribute mapping.
 *
 * @see docs/scim-enterprise-self-serve-p2-72.md
 */

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_POLICY_ID =
  "scim-enterprise-self-serve-p2-72-v1" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_DOC =
  "docs/scim-enterprise-self-serve-p2-72.md" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_ARTIFACT =
  "artifacts/scim-enterprise-self-serve-p2-72.json" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_SETTINGS_MODULE =
  "lib/enterprise/scim-enterprise-self-serve-p2-72-settings.ts" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_SERVICE_MODULE =
  "lib/enterprise/scim-enterprise-self-serve-p2-72-service.ts" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_AUDIT_MODULE =
  "lib/enterprise/scim-enterprise-self-serve-p2-72-audit.ts" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_GROUP_PANEL =
  "components/enterprise/scim-group-provisioning-panel.tsx" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_ATTRIBUTE_PANEL =
  "components/enterprise/scim-attribute-mapping-panel.tsx" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_ACTIONS =
  "actions/workspace-scim-self-serve.ts" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_PAGE =
  "app/dashboard/enterprise/sso-scim/page.tsx" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_CHECK_NPM_SCRIPT =
  "check:scim-enterprise-self-serve-p2-72" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_CI_NPM_SCRIPT =
  "test:ci:scim-enterprise-self-serve-p2-72" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_UNIT_TEST =
  "tests/unit/scim-enterprise-self-serve-p2-72.test.ts" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_GROUP_PANEL_TEST_ID =
  "scim-group-provisioning-panel" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_ATTRIBUTE_PANEL_TEST_ID =
  "scim-attribute-mapping-panel" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_SAVE_GROUP_MAPPINGS_TEST_ID =
  "scim-save-group-mappings" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_SAVE_ATTRIBUTE_MAPPING_TEST_ID =
  "scim-save-attribute-mapping" as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_FLOW_STEPS = [
  "group_provisioning",
  "attribute_mapping",
  "self_serve_save",
  "scim_api_apply",
] as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_EVAL_NOTE =
  "Enterprise self-serve SCIM — IdP group → workspace role mapping and attribute mapping without support ticket." as const;

export const SCIM_ENTERPRISE_SELF_SERVE_P2_72_WIRING_PATHS = [
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_DOC,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_ARTIFACT,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_SETTINGS_MODULE,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_SERVICE_MODULE,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_AUDIT_MODULE,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_GROUP_PANEL,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_ATTRIBUTE_PANEL,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_ACTIONS,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_PAGE,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_UNIT_TEST,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_CI_WORKFLOW,
  "actions/workspace-scim.ts",
  "components/enterprise/scim-provisioned-users-panel.tsx",
  "lib/scim/scim-validation.ts",
] as const;
