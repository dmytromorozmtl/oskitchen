import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPrismaIndexAuditP3_73,
  formatPrismaIndexAuditP3_73AuditLines,
} from "@/lib/prisma/prisma-index-audit-p3-73-audit";
import { validatePrismaIndexAuditContract } from "@/lib/prisma/prisma-index-audit-p3-73-measurement";
import {
  PRISMA_INDEX_AUDIT_P3_73_AUDIT_SCRIPT,
  PRISMA_INDEX_AUDIT_P3_73_CHECK_NPM_SCRIPT,
  PRISMA_INDEX_AUDIT_P3_73_DOC,
  PRISMA_INDEX_AUDIT_P3_73_EXPECTED_MODEL_COUNT,
  PRISMA_INDEX_AUDIT_P3_73_HOT_PATH_COUNT,
  PRISMA_INDEX_AUDIT_P3_73_HOT_PATH_MODELS,
  PRISMA_INDEX_AUDIT_P3_73_NPM_SCRIPT,
  PRISMA_INDEX_AUDIT_P3_73_NPM_SCRIPTS,
  PRISMA_INDEX_AUDIT_P3_73_POLICY_ID,
  PRISMA_INDEX_AUDIT_P3_73_UNIT_TEST,
  PRISMA_INDEX_AUDIT_P3_73_UPSTREAM_POLICY_ID,
  PRISMA_INDEX_AUDIT_P3_73_UPSTREAM_TEST,
} from "@/lib/prisma/prisma-index-audit-p3-73-policy";

const ROOT = process.cwd();

describe("Prisma index audit (P3-73)", () => {
  it("locks P3-73 policy and hot-path model list", () => {
    expect(PRISMA_INDEX_AUDIT_P3_73_POLICY_ID).toBe("prisma-index-audit-p3-73-v1");
    expect(PRISMA_INDEX_AUDIT_P3_73_UPSTREAM_POLICY_ID).toBe("prisma-index-audit-p1-36-v1");
    expect(PRISMA_INDEX_AUDIT_P3_73_HOT_PATH_COUNT).toBe(12);
    expect(PRISMA_INDEX_AUDIT_P3_73_HOT_PATH_MODELS).toContain("Order");
    expect(PRISMA_INDEX_AUDIT_P3_73_HOT_PATH_MODELS).toContain("POSTransaction");
  });

  it("validates 401 models with zero tenant-scope and hot-path FK gaps", () => {
    const validation = validatePrismaIndexAuditContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.modelCountOk).toBe(true);
    expect(validation.tenantScopeZero).toBe(true);
    expect(validation.hotPathZeroGaps).toBe(true);
    expect(validation.upstreamPolicyAligned).toBe(true);
    expect(validation.hotPathReports).toHaveLength(PRISMA_INDEX_AUDIT_P3_73_HOT_PATH_COUNT);
  });

  it("passes full Prisma index audit P3-73 audit", () => {
    const summary = auditPrismaIndexAuditP3_73(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.hotPathCount).toBe(PRISMA_INDEX_AUDIT_P3_73_HOT_PATH_COUNT);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatPrismaIndexAuditP3_73AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script, upstream test, and npm wiring", () => {
    expect(existsSync(join(ROOT, PRISMA_INDEX_AUDIT_P3_73_DOC))).toBe(true);
    expect(existsSync(join(ROOT, PRISMA_INDEX_AUDIT_P3_73_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, PRISMA_INDEX_AUDIT_P3_73_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, PRISMA_INDEX_AUDIT_P3_73_UPSTREAM_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PRISMA_INDEX_AUDIT_P3_73_NPM_SCRIPT]).toContain(
      "audit-prisma-index-audit-p3-73.ts",
    );
    expect(pkg.scripts?.[PRISMA_INDEX_AUDIT_P3_73_CHECK_NPM_SCRIPT]).toContain(
      PRISMA_INDEX_AUDIT_P3_73_UNIT_TEST,
    );
    for (const script of PRISMA_INDEX_AUDIT_P3_73_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });

  it("locks expected model count at 401", () => {
    expect(PRISMA_INDEX_AUDIT_P3_73_EXPECTED_MODEL_COUNT).toBe(401);
  });
});
