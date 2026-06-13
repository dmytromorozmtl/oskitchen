/**
 * Blueprint P3-79 — Audit log for all money actions.
 *
 * @see docs/money-actions-audit-p3-79.md
 */

import {
  MONEY_ACTION_AUDIT_REGISTRY,
  MONEY_ACTIONS_AUDIT_POLICY_ID,
} from "@/lib/audit/money-actions-audit-policy";

export const MONEY_ACTIONS_AUDIT_P3_79_POLICY_ID = "money-actions-audit-p3-79-v1" as const;

export const MONEY_ACTIONS_AUDIT_P3_79_DOC = "docs/money-actions-audit-p3-79.md" as const;

export const MONEY_ACTIONS_AUDIT_P3_79_ARTIFACT =
  "artifacts/money-actions-audit-p3-79-registry.json" as const;

export const MONEY_ACTIONS_AUDIT_P3_79_AUDIT_SCRIPT =
  "scripts/audit-money-actions-audit-p3-79.ts" as const;

export const MONEY_ACTIONS_AUDIT_P3_79_NPM_SCRIPT = "audit:money-actions-audit-p3-79" as const;

export const MONEY_ACTIONS_AUDIT_P3_79_CHECK_NPM_SCRIPT =
  "check:money-actions-audit-p3-79" as const;

export const MONEY_ACTIONS_AUDIT_P3_79_UNIT_TEST =
  "tests/unit/money-actions-audit-p3-79.test.ts" as const;

export const MONEY_ACTIONS_AUDIT_P3_79_UPSTREAM_POLICY_ID = MONEY_ACTIONS_AUDIT_POLICY_ID;

export const MONEY_ACTIONS_AUDIT_P3_79_UPSTREAM_TEST =
  "tests/unit/money-actions-audit.test.ts" as const;

export const MONEY_ACTIONS_AUDIT_P3_79_TERMINAL_ROUTE = "app/api/pos/terminal/route.ts" as const;

export const MONEY_ACTIONS_AUDIT_P3_79_NPM_SCRIPTS = [
  "test:ci:money-actions-audit",
  "test:ci:money-actions-audit-p3-79:cert",
] as const;

export const MONEY_ACTIONS_AUDIT_P3_79_REGISTRY_COUNT = MONEY_ACTION_AUDIT_REGISTRY.length;

export const MONEY_ACTIONS_AUDIT_P3_79_WIRING_PATHS = [
  MONEY_ACTIONS_AUDIT_P3_79_DOC,
  "lib/audit/money-actions-audit-policy.ts",
  "lib/audit/money-actions-audit-p3-79-measurement.ts",
  "lib/audit/money-actions-audit-p3-79-audit.ts",
  MONEY_ACTIONS_AUDIT_P3_79_TERMINAL_ROUTE,
  "services/storefront/storefront-payment-audit.ts",
  "services/pos/pos-cash-count-service.ts",
  MONEY_ACTIONS_AUDIT_P3_79_UNIT_TEST,
  MONEY_ACTIONS_AUDIT_P3_79_UPSTREAM_TEST,
  MONEY_ACTIONS_AUDIT_P3_79_ARTIFACT,
] as const;
