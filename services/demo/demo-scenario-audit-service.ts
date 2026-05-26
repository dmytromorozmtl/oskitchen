import { GOLDEN_DEMO_SCENARIOS } from "@/lib/demo/golden-demo-scenarios";
import { DEMO_SCENARIO_REQUIREMENTS } from "@/lib/demo/demo-scenario-requirements";
import type { GoldenDemoScenarioId } from "@/lib/demo/demo-data-contract";
import type { DemoSeedRecordKind } from "@/lib/demo/demo-data-contract";

export type DemoScenarioPlanAuditStatus = "PASS" | "WARN" | "FAIL";

export type DemoScenarioPlanAuditRow = {
  scenarioId: GoldenDemoScenarioId;
  title: string;
  status: DemoScenarioPlanAuditStatus;
  missingMust: DemoSeedRecordKind[];
  missingShould: DemoSeedRecordKind[];
};

function auditOne(scenarioId: GoldenDemoScenarioId, title: string, kinds: Set<DemoSeedRecordKind>): DemoScenarioPlanAuditRow {
  const req = DEMO_SCENARIO_REQUIREMENTS[scenarioId];
  const missingMust = req.mustHave.filter((k) => !kinds.has(k));
  const missingShould = req.shouldHave.filter((k) => !kinds.has(k));

  let status: DemoScenarioPlanAuditStatus = "PASS";
  if (missingMust.length) status = "FAIL";
  else if (missingShould.length) status = "WARN";

  return { scenarioId, title, status, missingMust, missingShould };
}

/**
 * Validates golden scenario **plan lines** against `DEMO_SCENARIO_REQUIREMENTS`.
 * No DB access, no seeding.
 */
export function auditGoldenDemoScenarioPlans(): DemoScenarioPlanAuditRow[] {
  return GOLDEN_DEMO_SCENARIOS.map((plan) => {
    const kinds = new Set(plan.lines.map((l) => l.kind));
    return auditOne(plan.scenarioId, plan.title, kinds);
  });
}

export function summarizeDemoScenarioPlanAudit(rows: DemoScenarioPlanAuditRow[]): {
  failCount: number;
  warnCount: number;
  passCount: number;
} {
  return {
    failCount: rows.filter((r) => r.status === "FAIL").length,
    warnCount: rows.filter((r) => r.status === "WARN").length,
    passCount: rows.filter((r) => r.status === "PASS").length,
  };
}
