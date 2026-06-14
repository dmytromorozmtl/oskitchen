import {
  CROSS_TENANT_AUDIT_P3_80_MAX_HITS,
  CROSS_TENANT_AUDIT_P3_80_SCENARIO_COUNT,
  CROSS_TENANT_AUDIT_P3_80_TARGET_COVERAGE,
} from "@/lib/security/cross-tenant-audit-p3-80-policy";

export type CrossTenantAuditBenchmarkInputP380 = {
  hitCount: number;
  coveragePercent: number;
  upstreamP015Present: boolean;
  scopeHelpersPresent: boolean;
  auditScriptWired: boolean;
  baselineMaxHits: number;
};

export type CrossTenantAuditBenchmarkP380Result = {
  scenarioCount: number;
  passedCount: number;
  passPct: number;
  passed: boolean;
  scenarioScores: Array<{ scenarioId: string; passed: boolean; message?: string }>;
};

function scenario(
  id: string,
  label: string,
  run: () => { passed: boolean; message?: string },
) {
  return { id, label, run };
}

export function buildCrossTenantAuditCorpusP380(
  input: CrossTenantAuditBenchmarkInputP380,
): ReturnType<typeof scenario>[] {
  return [
    scenario("ct-01-zero-hits", "No unscoped userId where hits in services/", () => {
      if (input.hitCount > CROSS_TENANT_AUDIT_P3_80_MAX_HITS) {
        return { passed: false, message: `${input.hitCount} unscoped hits remain` };
      }
      return { passed: true };
    }),
    scenario("ct-02-coverage-100", "Service scope coverage at 100%", () => {
      if (input.coveragePercent < CROSS_TENANT_AUDIT_P3_80_TARGET_COVERAGE) {
        return {
          passed: false,
          message: `Coverage ${input.coveragePercent}% < ${CROSS_TENANT_AUDIT_P3_80_TARGET_COVERAGE}%`,
        };
      }
      return { passed: true };
    }),
    scenario("ct-03-baseline", "Baseline maxHits honored", () => {
      if (input.hitCount > input.baselineMaxHits) {
        return {
          passed: false,
          message: `${input.hitCount} hits > baseline ${input.baselineMaxHits}`,
        };
      }
      return { passed: true };
    }),
    scenario("ct-04-upstream-p015", "P0-15 cross-tenant E2E artifact present", () => {
      if (!input.upstreamP015Present) return { passed: false, message: "P0-15 artifact missing" };
      return { passed: true };
    }),
    scenario("ct-05-scope-helpers", "Owner scope helpers module present", () => {
      if (!input.scopeHelpersPresent) {
        return { passed: false, message: "workspace-resource-scope missing" };
      }
      return { passed: true };
    }),
    scenario("ct-06-audit-script", "Service scope audit script wired", () => {
      if (!input.auditScriptWired) {
        return { passed: false, message: "audit-service-userid-scope.ts missing" };
      }
      return { passed: true };
    }),
  ];
}

export function runCrossTenantAuditBenchmarkP380(
  input: CrossTenantAuditBenchmarkInputP380,
): CrossTenantAuditBenchmarkP380Result {
  const scenarios = buildCrossTenantAuditCorpusP380(input);
  const scenarioScores = scenarios.map((scenarioItem) => {
    const outcome = scenarioItem.run();
    return {
      scenarioId: scenarioItem.id,
      passed: outcome.passed,
      message: outcome.message,
    };
  });
  const passedCount = scenarioScores.filter((score) => score.passed).length;
  const passPct =
    scenarios.length === 0 ? 0 : Math.round((passedCount / scenarios.length) * 100);

  return {
    scenarioCount: scenarios.length,
    passedCount,
    passPct,
    passed:
      scenarios.length === CROSS_TENANT_AUDIT_P3_80_SCENARIO_COUNT &&
      passedCount === scenarios.length,
    scenarioScores,
  };
}
