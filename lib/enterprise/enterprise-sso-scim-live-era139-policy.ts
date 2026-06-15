/**
 * Era 139 — Enterprise SSO + SCIM wiring cert (Phase 9 #66).
 *
 * Full path: Okta · Entra · Google SAML SSO → RFC 7644 SCIM provisioning.
 */

import {
  ENTERPRISE_SSO_LIVE_IDPS,
  ENTERPRISE_SSO_SCIM_LIVE_PATH,
  ENTERPRISE_SSO_SCIM_LIVE_POLICY_ID,
} from "@/lib/enterprise/enterprise-sso-scim-live-policy";

export const ENTERPRISE_SSO_SCIM_LIVE_ERA139_POLICY_ID =
  "era139-enterprise-sso-scim-live-v1" as const;

export const ENTERPRISE_SSO_SCIM_LIVE_ERA139_SUMMARY_ARTIFACT =
  "artifacts/enterprise-sso-scim-live-smoke-summary.json" as const;

export const ENTERPRISE_SSO_SCIM_LIVE_ERA139_NPM_SCRIPT =
  "smoke:enterprise-sso-scim-live-era139" as const;

export const ENTERPRISE_SSO_SCIM_LIVE_ERA139_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-enterprise-sso-scim-live-era139.ts" as const;

export const ENTERPRISE_SSO_SCIM_LIVE_ERA139_OPS_DOC =
  "docs/enterprise-sso-scim-live-era139-setup.md" as const;

export const ENTERPRISE_SSO_SCIM_LIVE_ERA139_SERVICE =
  "services/enterprise/enterprise-sso-scim-live-service.ts" as const;

export const ENTERPRISE_SSO_SCIM_LIVE_ERA139_WIRING_PATHS = [
  ENTERPRISE_SSO_SCIM_LIVE_ERA139_SERVICE,
  "lib/enterprise/enterprise-sso-scim-live-builders.ts",
  "lib/enterprise/enterprise-sso-scim-live-policy.ts",
  "app/dashboard/enterprise/sso-scim/page.tsx",
  "components/enterprise/enterprise-sso-scim-live-panel.tsx",
] as const;

export const ENTERPRISE_SSO_SCIM_LIVE_ERA139_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Enterprise → SSO + SCIM.",
  "Confirm SSO LIVE and SCIM LIVE badges on the command header.",
  "Review IdP cards — Okta, Microsoft Entra ID, Google Workspace.",
  "Inspect SCIM 2.0 provisioning card — Users/Groups endpoints and bearer token.",
  "Run npm run smoke:enterprise-sso-scim-live-era139 — artifact overall PASSED.",
] as const;

export const ENTERPRISE_SSO_SCIM_LIVE_ERA139_CI_SCRIPTS = [
  "test:ci:enterprise-sso-scim-live-era139",
  "test:ci:enterprise-sso-scim-live-era139:cert",
] as const;

export const ENTERPRISE_SSO_SCIM_LIVE_ERA139_UNIT_TESTS = [
  "tests/unit/enterprise-sso-scim-live-era139.test.ts",
  "tests/unit/enterprise-sso-scim-live.test.ts",
] as const;

export const ENTERPRISE_SSO_SCIM_LIVE_ERA139_CANONICAL_POLICY_ID =
  ENTERPRISE_SSO_SCIM_LIVE_POLICY_ID;

export const ENTERPRISE_SSO_SCIM_LIVE_ERA139_ROUTE = ENTERPRISE_SSO_SCIM_LIVE_PATH;

export const ENTERPRISE_SSO_SCIM_LIVE_ERA139_IDPS = ENTERPRISE_SSO_LIVE_IDPS;

export const ENTERPRISE_SSO_SCIM_LIVE_ERA139_CAPABILITIES = [
  "sso",
  "scim",
  "idps",
] as const;
