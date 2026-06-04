import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditFinal05BetaGovernanceSmokeChain } from "@/lib/execution/final-05-beta-governance-smoke-chain-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import { auditProgramCompletionCapstone } from "@/lib/execution/program-completion-capstone-audit-policy";
import {
  PROGRAM_COMPLETION_CAPSTONE_POLICY_ID,
  PROGRAM_COMPLETION_CAPSTONE_SUB_POLICIES,
} from "@/lib/execution/program-completion-capstone-patterns";

/**
 * FINAL-06 — EXEC-01 six-role program completion capstone re-cert.
 */

export const FINAL_06_PROGRAM_CAPSTONE_POLICY_ID = "final-06-program-capstone-v1" as const;

export const PROGRAM_COMPLETION_CAPSTONE_AUDIT_POLICY_PATH =
  "lib/execution/program-completion-capstone-audit-policy.ts" as const;

export const PROGRAM_COMPLETION_CAPSTONE_PATTERNS_PATH =
  "lib/execution/program-completion-capstone-patterns.ts" as const;

export const PROGRAM_COMPLETION_CAPSTONE_UNIT_TEST_PATH =
  "tests/unit/program-completion-capstone-audit-policy.test.ts" as const;

export type Final06ProgramCapstoneAuditReport = {
  policyId: typeof FINAL_06_PROGRAM_CAPSTONE_POLICY_ID;
  phaseId: "FINAL-06";
  taskSlot: number;
  exec01PolicyPresent: boolean;
  sixRoleRegistryHonest: boolean;
  programCapstonePassed: boolean;
  allSixSubAuditsPassed: boolean;
  unitTestsPresent: boolean;
  final05Passed: boolean;
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditSixRoleRegistry(root: string): boolean {
  const source = readSurface(root, PROGRAM_COMPLETION_CAPSTONE_PATTERNS_PATH);
  if (!source.includes(PROGRAM_COMPLETION_CAPSTONE_POLICY_ID)) return false;
  return PROGRAM_COMPLETION_CAPSTONE_SUB_POLICIES.every(
    (entry) => source.includes(entry.id) && source.includes(entry.policyId),
  );
}

export function auditFinal06ProgramCapstone(
  root = process.cwd(),
): Final06ProgramCapstoneAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[5]!;
  const exec01PolicyPresent =
    existsSync(join(root, PROGRAM_COMPLETION_CAPSTONE_PATTERNS_PATH)) &&
    existsSync(join(root, PROGRAM_COMPLETION_CAPSTONE_AUDIT_POLICY_PATH));
  const sixRoleRegistryHonest = exec01PolicyPresent && auditSixRoleRegistry(root);
  const unitTestsPresent = existsSync(join(root, PROGRAM_COMPLETION_CAPSTONE_UNIT_TEST_PATH));

  const capstone = auditProgramCompletionCapstone(root);
  const programCapstonePassed = capstone.passed;
  const allSixSubAuditsPassed =
    capstone.subAudits.length === PROGRAM_COMPLETION_CAPSTONE_SUB_POLICIES.length &&
    capstone.subAudits.every((audit) => audit.passed);

  const final05Passed = auditFinal05BetaGovernanceSmokeChain(root).passed;

  const passed =
    exec01PolicyPresent &&
    sixRoleRegistryHonest &&
    programCapstonePassed &&
    allSixSubAuditsPassed &&
    unitTestsPresent &&
    final05Passed;

  return {
    policyId: FINAL_06_PROGRAM_CAPSTONE_POLICY_ID,
    phaseId: "FINAL-06",
    taskSlot: phase.taskSlot,
    exec01PolicyPresent,
    sixRoleRegistryHonest,
    programCapstonePassed,
    allSixSubAuditsPassed,
    unitTestsPresent,
    final05Passed,
    passed,
  };
}
