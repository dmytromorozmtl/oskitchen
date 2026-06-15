import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditFinal09CompetitorIntelligence } from "@/lib/execution/final-09-competitor-intelligence-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import { auditPmCompletionCapstone } from "@/lib/pm/pm-completion-capstone-audit-policy";
import {
  PM_COMPLETION_CAPSTONE_POLICY_ID,
  PM_COMPLETION_CAPSTONE_SUB_POLICIES,
} from "@/lib/pm/pm-completion-capstone-patterns";

/**
 * FINAL-10 — PM-06 program management completion capstone re-cert.
 */

export const FINAL_10_PM_COMPLETION_POLICY_ID = "final-10-pm-completion-v1" as const;

export const PM_COMPLETION_CAPSTONE_AUDIT_POLICY_PATH =
  "lib/pm/pm-completion-capstone-audit-policy.ts" as const;

export const PM_COMPLETION_CAPSTONE_PATTERNS_PATH =
  "lib/pm/pm-completion-capstone-patterns.ts" as const;

export const PM_COMPLETION_CAPSTONE_UNIT_TEST_PATH =
  "tests/unit/pm-completion-capstone-audit-policy.test.ts" as const;

export type Final10PmCompletionAuditReport = {
  policyId: typeof FINAL_10_PM_COMPLETION_POLICY_ID;
  phaseId: "FINAL-10";
  taskSlot: number;
  pm06PolicyPresent: boolean;
  fiveCapstoneRegistryHonest: boolean;
  pmCapstonePassed: boolean;
  allSubAuditsPassed: boolean;
  unitTestsPresent: boolean;
  pm06RoleDone: boolean;
  final09Passed: boolean;
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditFiveCapstoneRegistry(root: string): boolean {
  const source = readSurface(root, PM_COMPLETION_CAPSTONE_PATTERNS_PATH);
  if (!source.includes(PM_COMPLETION_CAPSTONE_POLICY_ID)) return false;
  return PM_COMPLETION_CAPSTONE_SUB_POLICIES.every(
    (entry) => source.includes(entry.id) && source.includes(entry.policyId),
  );
}

export function auditFinal10PmCompletion(root = process.cwd()): Final10PmCompletionAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[9]!;
  const pm06PolicyPresent =
    existsSync(join(root, PM_COMPLETION_CAPSTONE_PATTERNS_PATH)) &&
    existsSync(join(root, PM_COMPLETION_CAPSTONE_AUDIT_POLICY_PATH));
  const fiveCapstoneRegistryHonest = pm06PolicyPresent && auditFiveCapstoneRegistry(root);
  const unitTestsPresent = existsSync(join(root, PM_COMPLETION_CAPSTONE_UNIT_TEST_PATH));

  const capstone = auditPmCompletionCapstone(root);
  const pmCapstonePassed = capstone.passed;
  const allSubAuditsPassed =
    capstone.subAudits.length === PM_COMPLETION_CAPSTONE_SUB_POLICIES.length &&
    capstone.subAudits.every((audit) => audit.passed);

  const tracker = JSON.parse(
    readFileSync(join(root, "artifacts/execution-tracker-final.json"), "utf8"),
  ) as Record<string, string>;
  const pm06RoleDone = tracker["PM-06"] === "done";

  const final09Passed = auditFinal09CompetitorIntelligence(root).passed;

  const passed =
    pm06PolicyPresent &&
    fiveCapstoneRegistryHonest &&
    pmCapstonePassed &&
    allSubAuditsPassed &&
    unitTestsPresent &&
    pm06RoleDone &&
    final09Passed;

  return {
    policyId: FINAL_10_PM_COMPLETION_POLICY_ID,
    phaseId: "FINAL-10",
    taskSlot: phase.taskSlot,
    pm06PolicyPresent,
    fiveCapstoneRegistryHonest,
    pmCapstonePassed,
    allSubAuditsPassed,
    unitTestsPresent,
    pm06RoleDone,
    final09Passed,
    passed,
  };
}
