/**
 * Era 140 — Audit & Compliance wiring cert (Phase 9 #67).
 *
 * Full path: SOC2-ready audit trail → control readiness → retention & export.
 */

import {
  AUDIT_COMPLIANCE_CATEGORY_BREAKDOWN,
  AUDIT_COMPLIANCE_PATH,
  AUDIT_COMPLIANCE_POLICY_ID,
  AUDIT_COMPLIANCE_SOC2_CONTROLS,
} from "@/lib/enterprise/audit-compliance-policy";

export const AUDIT_COMPLIANCE_ERA140_POLICY_ID = "era140-audit-compliance-v1" as const;

export const AUDIT_COMPLIANCE_ERA140_SUMMARY_ARTIFACT =
  "artifacts/audit-compliance-smoke-summary.json" as const;

export const AUDIT_COMPLIANCE_ERA140_NPM_SCRIPT = "smoke:audit-compliance-era140" as const;

export const AUDIT_COMPLIANCE_ERA140_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-audit-compliance-era140.ts" as const;

export const AUDIT_COMPLIANCE_ERA140_OPS_DOC = "docs/audit-compliance-era140-setup.md" as const;

export const AUDIT_COMPLIANCE_ERA140_SERVICE = "services/enterprise/audit-service.ts" as const;

export const AUDIT_COMPLIANCE_ERA140_WIRING_PATHS = [
  AUDIT_COMPLIANCE_ERA140_SERVICE,
  "lib/enterprise/audit-compliance-builders.ts",
  "lib/enterprise/audit-compliance-policy.ts",
  "app/dashboard/enterprise/audit/page.tsx",
  "components/enterprise/audit-compliance-panel.tsx",
] as const;

export const AUDIT_COMPLIANCE_ERA140_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Enterprise → Audit & Compliance.",
  "Review compliance score, 30-day events, retention, and critical/warning counts.",
  "Inspect SOC 2 control readiness — CC6/CC7 evidence mapped to audit capabilities.",
  "Check category breakdown and recent critical & warning events.",
  "Run npm run smoke:audit-compliance-era140 — artifact overall PASSED.",
] as const;

export const AUDIT_COMPLIANCE_ERA140_CI_SCRIPTS = [
  "test:ci:audit-compliance-era140",
  "test:ci:audit-compliance-era140:cert",
] as const;

export const AUDIT_COMPLIANCE_ERA140_UNIT_TESTS = [
  "tests/unit/audit-compliance-era140.test.ts",
  "tests/unit/audit-compliance.test.ts",
] as const;

export const AUDIT_COMPLIANCE_ERA140_CANONICAL_POLICY_ID = AUDIT_COMPLIANCE_POLICY_ID;

export const AUDIT_COMPLIANCE_ERA140_ROUTE = AUDIT_COMPLIANCE_PATH;

export const AUDIT_COMPLIANCE_ERA140_SOC2_CONTROLS = AUDIT_COMPLIANCE_SOC2_CONTROLS;

export const AUDIT_COMPLIANCE_ERA140_CATEGORIES = AUDIT_COMPLIANCE_CATEGORY_BREAKDOWN;

export const AUDIT_COMPLIANCE_ERA140_CAPABILITIES = [
  "audit_trail",
  "soc2_controls",
  "retention_export",
] as const;
