import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCrossTenantP380,
  formatCrossTenantAuditP380AuditLines,
} from "@/lib/security/cross-tenant-audit-p3-80-audit";
import {
  CROSS_TENANT_AUDIT_P3_80_ARTIFACT,
  CROSS_TENANT_AUDIT_P3_80_BASELINE_COVERAGE,
  CROSS_TENANT_AUDIT_P3_80_CHECK_NPM_SCRIPT,
  CROSS_TENANT_AUDIT_P3_80_CI_WORKFLOW,
  CROSS_TENANT_AUDIT_P3_80_DOC,
  CROSS_TENANT_AUDIT_P3_80_MAX_HITS,
  CROSS_TENANT_AUDIT_P3_80_POLICY_ID,
  CROSS_TENANT_AUDIT_P3_80_TARGET_COVERAGE,
  CROSS_TENANT_AUDIT_P3_80_UNIT_TEST,
  CROSS_TENANT_AUDIT_P3_80_WIRING_PATHS,
} from "@/lib/security/cross-tenant-audit-p3-80-policy";
import { auditServiceUserIdScope } from "@/lib/security/cross-tenant-service-scope-audit";
import { runCrossTenantAuditBenchmarkP380 } from "@/lib/security/cross-tenant-audit-p3-80-scoring";

const ROOT = process.cwd();

describe("Cross-tenant service scope audit (P3-80)", () => {
  it("locks P3-80 policy and coverage targets", () => {
    expect(CROSS_TENANT_AUDIT_P3_80_POLICY_ID).toBe("cross-tenant-audit-p3-80-v1");
    expect(CROSS_TENANT_AUDIT_P3_80_BASELINE_COVERAGE).toBe(88);
    expect(CROSS_TENANT_AUDIT_P3_80_TARGET_COVERAGE).toBe(100);
    expect(CROSS_TENANT_AUDIT_P3_80_MAX_HITS).toBe(0);
  });

  it("passes service scope audit with zero unscoped hits", () => {
    const hits = auditServiceUserIdScope(ROOT);
    expect(hits).toHaveLength(0);
  });

  it("passes cross-tenant benchmark at 100%", () => {
    const benchmark = runCrossTenantAuditBenchmarkP380({
      hitCount: 0,
      coveragePercent: 100,
      upstreamP015Present: true,
      scopeHelpersPresent: true,
      auditScriptWired: true,
      baselineMaxHits: 0,
    });
    expect(benchmark.passPct).toBe(100);
    expect(benchmark.passed).toBe(true);
  });

  it("passes full P3-80 cross-tenant audit", () => {
    const summary = auditCrossTenantP380(ROOT);
    expect(summary.hitCount).toBe(0);
    expect(summary.coveragePercent).toBe(100);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-80 wiring paths, CI gate, and artifact", () => {
    for (const path of CROSS_TENANT_AUDIT_P3_80_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CROSS_TENANT_AUDIT_P3_80_CHECK_NPM_SCRIPT]).toContain(
      CROSS_TENANT_AUDIT_P3_80_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, CROSS_TENANT_AUDIT_P3_80_CI_WORKFLOW), "utf8");
    expect(ci).toContain(CROSS_TENANT_AUDIT_P3_80_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(readFileSync(join(ROOT, CROSS_TENANT_AUDIT_P3_80_ARTIFACT), "utf8"));
    expect(artifact.policyId).toBe(CROSS_TENANT_AUDIT_P3_80_POLICY_ID);
    expect(artifact.unscopedHitsAfter).toBe(0);

    const doc = readFileSync(join(ROOT, CROSS_TENANT_AUDIT_P3_80_DOC), "utf8");
    expect(doc).toContain(CROSS_TENANT_AUDIT_P3_80_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditCrossTenantP380(ROOT);
    const lines = formatCrossTenantAuditP380AuditLines(summary);
    expect(lines.some((line) => line.includes(CROSS_TENANT_AUDIT_P3_80_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
