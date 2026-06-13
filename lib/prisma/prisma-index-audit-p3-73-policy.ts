/**
 * Blueprint P3-73 — Prisma index audit (401 models, hot-path FK wave 2).
 *
 * @see docs/prisma-index-audit-p3-73.md
 */

import {
  PRISMA_INDEX_AUDIT_EXPECTED_MODEL_COUNT,
  PRISMA_INDEX_AUDIT_NPM_SCRIPT,
  PRISMA_INDEX_AUDIT_POLICY_ID,
  PRISMA_INDEX_AUDIT_SCRIPT,
  PRISMA_INDEX_AUDIT_UNIT_TEST,
} from "@/lib/prisma/prisma-index-audit-policy";

export const PRISMA_INDEX_AUDIT_P3_73_POLICY_ID = "prisma-index-audit-p3-73-v1" as const;

export const PRISMA_INDEX_AUDIT_P3_73_DOC = "docs/prisma-index-audit-p3-73.md" as const;

export const PRISMA_INDEX_AUDIT_P3_73_ARTIFACT =
  "artifacts/prisma-index-audit-p3-73-registry.json" as const;

export const PRISMA_INDEX_AUDIT_P3_73_AUDIT_SCRIPT =
  "scripts/audit-prisma-index-audit-p3-73.ts" as const;

export const PRISMA_INDEX_AUDIT_P3_73_NPM_SCRIPT = "audit:prisma-index-audit-p3-73" as const;

export const PRISMA_INDEX_AUDIT_P3_73_CHECK_NPM_SCRIPT =
  "check:prisma-index-audit-p3-73" as const;

export const PRISMA_INDEX_AUDIT_P3_73_UNIT_TEST =
  "tests/unit/prisma-index-audit-p3-73.test.ts" as const;

export const PRISMA_INDEX_AUDIT_P3_73_UPSTREAM_POLICY_ID = PRISMA_INDEX_AUDIT_POLICY_ID;

export const PRISMA_INDEX_AUDIT_P3_73_UPSTREAM_TEST = PRISMA_INDEX_AUDIT_UNIT_TEST;

/** Hot-path models (order/KDS/POS/webhook/staff) — wave 2 FK index zero-gap requirement. */
export const PRISMA_INDEX_AUDIT_P3_73_HOT_PATH_MODELS = [
  "Order",
  "OrderItem",
  "WebhookEvent",
  "POSShift",
  "POSTransaction",
  "POSPayment",
  "POSAuditEvent",
  "KitchenTask",
  "KitchenTaskComment",
  "StaffShift",
  "StaffEvent",
  "CustomerFeedback",
] as const;

export const PRISMA_INDEX_AUDIT_P3_73_HOT_PATH_COUNT =
  PRISMA_INDEX_AUDIT_P3_73_HOT_PATH_MODELS.length;

export const PRISMA_INDEX_AUDIT_P3_73_NPM_SCRIPTS = [
  "test:ci:prisma-index-audit",
  "test:ci:prisma-index-audit-p3-73:cert",
  PRISMA_INDEX_AUDIT_NPM_SCRIPT,
] as const;

export const PRISMA_INDEX_AUDIT_P3_73_WIRING_PATHS = [
  PRISMA_INDEX_AUDIT_P3_73_DOC,
  PRISMA_INDEX_AUDIT_SCRIPT,
  "lib/prisma/prisma-index-audit.ts",
  "lib/prisma/prisma-index-audit-policy.ts",
  "lib/prisma/prisma-index-audit-p3-73-measurement.ts",
  "lib/prisma/prisma-index-audit-p3-73-audit.ts",
  PRISMA_INDEX_AUDIT_P3_73_UNIT_TEST,
  PRISMA_INDEX_AUDIT_P3_73_UPSTREAM_TEST,
  PRISMA_INDEX_AUDIT_P3_73_ARTIFACT,
  "prisma/schema.prisma",
] as const;

export const PRISMA_INDEX_AUDIT_P3_73_EXPECTED_MODEL_COUNT =
  PRISMA_INDEX_AUDIT_EXPECTED_MODEL_COUNT;
