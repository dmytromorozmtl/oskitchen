import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CROSS_TENANT_AUDIT_P3_80_ARTIFACT,
  CROSS_TENANT_AUDIT_P3_80_MAX_HITS,
  CROSS_TENANT_AUDIT_P3_80_POLICY_ID,
  CROSS_TENANT_AUDIT_P3_80_WIRING_PATHS,
} from "@/lib/security/cross-tenant-audit-p3-80-policy";
import { runCrossTenantAuditBenchmarkP380 } from "@/lib/security/cross-tenant-audit-p3-80-scoring";
import {
  auditServiceUserIdScope,
  serviceUserIdScopeCoveragePercent,
} from "@/lib/security/cross-tenant-service-scope-audit";

export type CrossTenantAuditP380AuditSummary = {
  policyId: typeof CROSS_TENANT_AUDIT_P3_80_POLICY_ID;
  wiringComplete: boolean;
  hitCount: number;
  coveragePercent: number;
  baselineMaxHits: number;
  upstreamP015Present: boolean;
  scoringPassed: boolean;
  passPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditCrossTenantP380(root = process.cwd()): CrossTenantAuditP380AuditSummary {
  const wiringComplete = CROSS_TENANT_AUDIT_P3_80_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  const hits = auditServiceUserIdScope(root);
  const hitCount = hits.length;
  const coveragePercent =
    hitCount === 0 ? 100 : serviceUserIdScopeCoveragePercent(hits);

  let baselineMaxHits = CROSS_TENANT_AUDIT_P3_80_MAX_HITS;
  const baselinePath = join(root, "scripts/service-userid-scope-baseline.json");
  if (existsSync(baselinePath)) {
    const baseline = JSON.parse(readFileSync(baselinePath, "utf8")) as { maxHits?: number };
    baselineMaxHits = baseline.maxHits ?? CROSS_TENANT_AUDIT_P3_80_MAX_HITS;
  }

  const upstreamP015Present = existsSync(
    join(root, "artifacts/cross-tenant-data-leak-e2e.json"),
  );

  const benchmark = runCrossTenantAuditBenchmarkP380({
    hitCount,
    coveragePercent,
    upstreamP015Present,
    scopeHelpersPresent: existsSync(join(root, "lib/scope/workspace-resource-scope.ts")),
    auditScriptWired: existsSync(join(root, "scripts/audit-service-userid-scope.ts")),
    baselineMaxHits,
  });

  const artifactPresent = existsSync(join(root, CROSS_TENANT_AUDIT_P3_80_ARTIFACT));

  const passed = wiringComplete && benchmark.passed && artifactPresent && hitCount === 0;

  return {
    policyId: CROSS_TENANT_AUDIT_P3_80_POLICY_ID,
    wiringComplete,
    hitCount,
    coveragePercent,
    baselineMaxHits,
    upstreamP015Present,
    scoringPassed: benchmark.passed,
    passPct: benchmark.passPct,
    artifactPresent,
    passed,
  };
}

export function formatCrossTenantAuditP380AuditLines(
  summary: CrossTenantAuditP380AuditSummary,
): string[] {
  return [
    `Cross-tenant service scope audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Unscoped hits: ${summary.hitCount} (max ${summary.baselineMaxHits})`,
    `Coverage: ${summary.coveragePercent}%`,
    `P0-15 artifact: ${summary.upstreamP015Present ? "present" : "missing"}`,
    `Benchmark: ${summary.passPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
