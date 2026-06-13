/**
 * Blueprint P3-78 — Idempotency keys for critical money operations.
 *
 * @see docs/idempotency-keys-p3-78.md
 */

import {
  IDEMPOTENCY_KEY_REGISTRY,
  IDEMPOTENCY_KEYS_POLICY_ID,
} from "@/lib/idempotency/idempotency-keys-policy";

export const IDEMPOTENCY_KEYS_P3_78_POLICY_ID = "idempotency-keys-p3-78-v1" as const;

export const IDEMPOTENCY_KEYS_P3_78_DOC = "docs/idempotency-keys-p3-78.md" as const;

export const IDEMPOTENCY_KEYS_P3_78_ARTIFACT =
  "artifacts/idempotency-keys-p3-78-registry.json" as const;

export const IDEMPOTENCY_KEYS_P3_78_AUDIT_SCRIPT =
  "scripts/audit-idempotency-keys-p3-78.ts" as const;

export const IDEMPOTENCY_KEYS_P3_78_NPM_SCRIPT = "audit:idempotency-keys-p3-78" as const;

export const IDEMPOTENCY_KEYS_P3_78_CHECK_NPM_SCRIPT =
  "check:idempotency-keys-p3-78" as const;

export const IDEMPOTENCY_KEYS_P3_78_UNIT_TEST =
  "tests/unit/idempotency-keys-p3-78.test.ts" as const;

export const IDEMPOTENCY_KEYS_P3_78_UPSTREAM_POLICY_ID = IDEMPOTENCY_KEYS_POLICY_ID;

export const IDEMPOTENCY_KEYS_P3_78_UPSTREAM_TEST = "tests/unit/idempotency-keys.test.ts" as const;

export const IDEMPOTENCY_KEYS_P3_78_CRITICAL_POS_PATHS = [
  "services/pos/pos-checkout-service.ts",
  "services/pos/pos-refund-service.ts",
  "services/pos/pos-void-service.ts",
] as const;

export const IDEMPOTENCY_KEYS_P3_78_NPM_SCRIPTS = [
  "test:ci:idempotency-keys",
  "test:ci:idempotency-keys-p3-78:cert",
] as const;

export const IDEMPOTENCY_KEYS_P3_78_REGISTRY_COUNT = IDEMPOTENCY_KEY_REGISTRY.length;

export const IDEMPOTENCY_KEYS_P3_78_WIRING_PATHS = [
  IDEMPOTENCY_KEYS_P3_78_DOC,
  "lib/idempotency/idempotency-keys.ts",
  "lib/idempotency/idempotency-keys-policy.ts",
  "lib/idempotency/idempotency-keys-p3-78-measurement.ts",
  "lib/idempotency/idempotency-keys-p3-78-audit.ts",
  ...IDEMPOTENCY_KEYS_P3_78_CRITICAL_POS_PATHS,
  IDEMPOTENCY_KEYS_P3_78_UNIT_TEST,
  IDEMPOTENCY_KEYS_P3_78_UPSTREAM_TEST,
  IDEMPOTENCY_KEYS_P3_78_ARTIFACT,
] as const;
