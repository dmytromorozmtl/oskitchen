import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditCompetitorCompletionCapstone } from "@/lib/competitor/competitor-completion-capstone-audit-policy";
import {
  COMPETITOR_COMPLETION_CAPSTONE_POLICY_ID,
  COMPETITOR_COMPLETION_CAPSTONE_SUB_POLICIES,
} from "@/lib/competitor/competitor-completion-capstone-patterns";
import { auditFinal08ForbiddenClaims } from "@/lib/execution/final-08-forbidden-claims-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

/**
 * FINAL-09 — COMP-03 competitor intelligence completion capstone re-cert.
 */

export const FINAL_09_COMPETITOR_INTELLIGENCE_POLICY_ID =
  "final-09-competitor-intelligence-v1" as const;

export const COMPETITOR_COMPLETION_CAPSTONE_AUDIT_POLICY_PATH =
  "lib/competitor/competitor-completion-capstone-audit-policy.ts" as const;

export const COMPETITOR_COMPLETION_CAPSTONE_PATTERNS_PATH =
  "lib/competitor/competitor-completion-capstone-patterns.ts" as const;

export const COMPETITOR_COMPLETION_CAPSTONE_UNIT_TEST_PATH =
  "tests/unit/competitor-completion-capstone-audit-policy.test.ts" as const;

export type Final09CompetitorIntelligenceAuditReport = {
  policyId: typeof FINAL_09_COMPETITOR_INTELLIGENCE_POLICY_ID;
  phaseId: "FINAL-09";
  taskSlot: number;
  comp03PolicyPresent: boolean;
  twoCapstoneRegistryHonest: boolean;
  competitorCapstonePassed: boolean;
  allSubAuditsPassed: boolean;
  unitTestsPresent: boolean;
  comp03RoleDone: boolean;
  final08Passed: boolean;
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditTwoCapstoneRegistry(root: string): boolean {
  const source = readSurface(root, COMPETITOR_COMPLETION_CAPSTONE_PATTERNS_PATH);
  if (!source.includes(COMPETITOR_COMPLETION_CAPSTONE_POLICY_ID)) return false;
  return COMPETITOR_COMPLETION_CAPSTONE_SUB_POLICIES.every(
    (entry) => source.includes(entry.id) && source.includes(entry.policyId),
  );
}

export function auditFinal09CompetitorIntelligence(
  root = process.cwd(),
): Final09CompetitorIntelligenceAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[8]!;
  const comp03PolicyPresent =
    existsSync(join(root, COMPETITOR_COMPLETION_CAPSTONE_PATTERNS_PATH)) &&
    existsSync(join(root, COMPETITOR_COMPLETION_CAPSTONE_AUDIT_POLICY_PATH));
  const twoCapstoneRegistryHonest = comp03PolicyPresent && auditTwoCapstoneRegistry(root);
  const unitTestsPresent = existsSync(join(root, COMPETITOR_COMPLETION_CAPSTONE_UNIT_TEST_PATH));

  const capstone = auditCompetitorCompletionCapstone(root);
  const competitorCapstonePassed = capstone.passed;
  const allSubAuditsPassed =
    capstone.subAudits.length === COMPETITOR_COMPLETION_CAPSTONE_SUB_POLICIES.length &&
    capstone.subAudits.every((audit) => audit.passed);

  const tracker = JSON.parse(
    readFileSync(join(root, "artifacts/execution-tracker-final.json"), "utf8"),
  ) as Record<string, string>;
  const comp03RoleDone = tracker["COMP-03"] === "done";

  const final08Passed = auditFinal08ForbiddenClaims(root).passed;

  const passed =
    comp03PolicyPresent &&
    twoCapstoneRegistryHonest &&
    competitorCapstonePassed &&
    allSubAuditsPassed &&
    unitTestsPresent &&
    comp03RoleDone &&
    final08Passed;

  return {
    policyId: FINAL_09_COMPETITOR_INTELLIGENCE_POLICY_ID,
    phaseId: "FINAL-09",
    taskSlot: phase.taskSlot,
    comp03PolicyPresent,
    twoCapstoneRegistryHonest,
    competitorCapstonePassed,
    allSubAuditsPassed,
    unitTestsPresent,
    comp03RoleDone,
    final08Passed,
    passed,
  };
}
