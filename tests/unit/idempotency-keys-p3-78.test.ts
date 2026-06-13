import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditAllIdempotencyKeys } from "@/lib/idempotency/idempotency-keys-policy";
import {
  auditIdempotencyKeysP3_78,
  formatIdempotencyKeysP3_78AuditLines,
} from "@/lib/idempotency/idempotency-keys-p3-78-audit";
import { validateIdempotencyKeysContract } from "@/lib/idempotency/idempotency-keys-p3-78-measurement";
import {
  IDEMPOTENCY_KEYS_P3_78_AUDIT_SCRIPT,
  IDEMPOTENCY_KEYS_P3_78_CHECK_NPM_SCRIPT,
  IDEMPOTENCY_KEYS_P3_78_DOC,
  IDEMPOTENCY_KEYS_P3_78_NPM_SCRIPT,
  IDEMPOTENCY_KEYS_P3_78_NPM_SCRIPTS,
  IDEMPOTENCY_KEYS_P3_78_POLICY_ID,
  IDEMPOTENCY_KEYS_P3_78_REGISTRY_COUNT,
  IDEMPOTENCY_KEYS_P3_78_UNIT_TEST,
  IDEMPOTENCY_KEYS_P3_78_UPSTREAM_POLICY_ID,
  IDEMPOTENCY_KEYS_P3_78_UPSTREAM_TEST,
} from "@/lib/idempotency/idempotency-keys-p3-78-policy";

const ROOT = process.cwd();

describe("Idempotency keys (P3-78)", () => {
  it("locks P3-78 policy and upstream registry count", () => {
    expect(IDEMPOTENCY_KEYS_P3_78_POLICY_ID).toBe("idempotency-keys-p3-78-v1");
    expect(IDEMPOTENCY_KEYS_P3_78_UPSTREAM_POLICY_ID).toBe("idempotency-keys-p1-32-v1");
    expect(IDEMPOTENCY_KEYS_P3_78_REGISTRY_COUNT).toBe(10);
  });

  it("validates upstream registry + POS audit metadata wiring", () => {
    const validation = validateIdempotencyKeysContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.upstreamRegistryOk).toBe(true);
    expect(validation.posCheckoutAuditWired).toBe(true);
    expect(validation.posVoidAuditWired).toBe(true);
  });

  it("passes full idempotency keys P3-78 audit", () => {
    const summary = auditIdempotencyKeysP3_78(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatIdempotencyKeysP3_78AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script, upstream test, and npm wiring", () => {
    expect(existsSync(join(ROOT, IDEMPOTENCY_KEYS_P3_78_DOC))).toBe(true);
    expect(existsSync(join(ROOT, IDEMPOTENCY_KEYS_P3_78_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, IDEMPOTENCY_KEYS_P3_78_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, IDEMPOTENCY_KEYS_P3_78_UPSTREAM_TEST))).toBe(true);

    const upstream = auditAllIdempotencyKeys(ROOT);
    expect(upstream.passed).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[IDEMPOTENCY_KEYS_P3_78_NPM_SCRIPT]).toContain(
      "audit-idempotency-keys-p3-78.ts",
    );
    expect(pkg.scripts?.[IDEMPOTENCY_KEYS_P3_78_CHECK_NPM_SCRIPT]).toContain(
      IDEMPOTENCY_KEYS_P3_78_UNIT_TEST,
    );
    for (const script of IDEMPOTENCY_KEYS_P3_78_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
