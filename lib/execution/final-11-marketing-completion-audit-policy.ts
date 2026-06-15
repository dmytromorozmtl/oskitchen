import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditFinal10PmCompletion } from "@/lib/execution/final-10-pm-completion-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import { auditMarketingCompletionCapstone } from "@/lib/marketing/marketing-completion-capstone-audit-policy";
import {
  MARKETING_COMPLETION_CAPSTONE_POLICY_ID,
  MARKETING_COMPLETION_CAPSTONE_SUB_POLICIES,
} from "@/lib/marketing/marketing-completion-capstone-patterns";

/**
 * FINAL-11 — MKT-42 marketing completion capstone re-cert.
 */

export const FINAL_11_MARKETING_COMPLETION_POLICY_ID = "final-11-marketing-completion-v1" as const;

export const MARKETING_COMPLETION_CAPSTONE_AUDIT_POLICY_PATH =
  "lib/marketing/marketing-completion-capstone-audit-policy.ts" as const;

export const MARKETING_COMPLETION_CAPSTONE_PATTERNS_PATH =
  "lib/marketing/marketing-completion-capstone-patterns.ts" as const;

export const MARKETING_COMPLETION_CAPSTONE_UNIT_TEST_PATH =
  "tests/unit/marketing-completion-capstone-audit-policy.test.ts" as const;

export type Final11MarketingCompletionAuditReport = {
  policyId: typeof FINAL_11_MARKETING_COMPLETION_POLICY_ID;
  phaseId: "FINAL-11";
  taskSlot: number;
  mkt42PolicyPresent: boolean;
  threeCapstoneRegistryHonest: boolean;
  marketingCapstonePassed: boolean;
  allSubAuditsPassed: boolean;
  unitTestsPresent: boolean;
  mkt42RoleDone: boolean;
  final10Passed: boolean;
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditThreeCapstoneRegistry(root: string): boolean {
  const source = readSurface(root, MARKETING_COMPLETION_CAPSTONE_PATTERNS_PATH);
  if (!source.includes(MARKETING_COMPLETION_CAPSTONE_POLICY_ID)) return false;
  return MARKETING_COMPLETION_CAPSTONE_SUB_POLICIES.every(
    (entry) => source.includes(entry.id) && source.includes(entry.policyId),
  );
}

export function auditFinal11MarketingCompletion(
  root = process.cwd(),
): Final11MarketingCompletionAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[10]!;
  const mkt42PolicyPresent =
    existsSync(join(root, MARKETING_COMPLETION_CAPSTONE_PATTERNS_PATH)) &&
    existsSync(join(root, MARKETING_COMPLETION_CAPSTONE_AUDIT_POLICY_PATH));
  const threeCapstoneRegistryHonest = mkt42PolicyPresent && auditThreeCapstoneRegistry(root);
  const unitTestsPresent = existsSync(join(root, MARKETING_COMPLETION_CAPSTONE_UNIT_TEST_PATH));

  const capstone = auditMarketingCompletionCapstone(root);
  const marketingCapstonePassed = capstone.passed;
  const allSubAuditsPassed =
    capstone.subAudits.length === MARKETING_COMPLETION_CAPSTONE_SUB_POLICIES.length &&
    capstone.subAudits.every((audit) => audit.passed);

  const tracker = JSON.parse(
    readFileSync(join(root, "artifacts/execution-tracker-final.json"), "utf8"),
  ) as Record<string, string>;
  const mkt42RoleDone = tracker["MKT-42"] === "done";

  const final10Passed = auditFinal10PmCompletion(root).passed;

  const passed =
    mkt42PolicyPresent &&
    threeCapstoneRegistryHonest &&
    marketingCapstonePassed &&
    allSubAuditsPassed &&
    unitTestsPresent &&
    mkt42RoleDone &&
    final10Passed;

  return {
    policyId: FINAL_11_MARKETING_COMPLETION_POLICY_ID,
    phaseId: "FINAL-11",
    taskSlot: phase.taskSlot,
    mkt42PolicyPresent,
    threeCapstoneRegistryHonest,
    marketingCapstonePassed,
    allSubAuditsPassed,
    unitTestsPresent,
    mkt42RoleDone,
    final10Passed,
    passed,
  };
}
