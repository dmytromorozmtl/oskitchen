import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditStabilizationDesign } from "@/lib/design/stabilization-design-audit-policy";
import {
  STABILIZATION_DESIGN_PATTERNS_POLICY_ID,
  STABILIZATION_DESIGN_SUB_POLICIES,
} from "@/lib/design/stabilization-design-patterns";
import { auditFinal11MarketingCompletion } from "@/lib/execution/final-11-marketing-completion-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

/**
 * FINAL-12 — DES-38 stabilization design capstone re-cert.
 */

export const FINAL_12_DESIGN_STABILIZATION_POLICY_ID =
  "final-12-design-stabilization-v1" as const;

export const STABILIZATION_DESIGN_AUDIT_POLICY_PATH =
  "lib/design/stabilization-design-audit-policy.ts" as const;

export const STABILIZATION_DESIGN_PATTERNS_PATH =
  "lib/design/stabilization-design-patterns.ts" as const;

export const STABILIZATION_DESIGN_UNIT_TEST_PATH =
  "tests/unit/stabilization-design-audit-policy.test.ts" as const;

export type Final12DesignStabilizationAuditReport = {
  policyId: typeof FINAL_12_DESIGN_STABILIZATION_POLICY_ID;
  phaseId: "FINAL-12";
  taskSlot: number;
  des38PolicyPresent: boolean;
  elevenSubPolicyRegistryHonest: boolean;
  stabilizationDesignPassed: boolean;
  allSubAuditsPassed: boolean;
  unitTestsPresent: boolean;
  des38RoleDone: boolean;
  final11Passed: boolean;
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditElevenSubPolicyRegistry(root: string): boolean {
  const source = readSurface(root, STABILIZATION_DESIGN_PATTERNS_PATH);
  if (!source.includes(STABILIZATION_DESIGN_PATTERNS_POLICY_ID)) return false;
  return STABILIZATION_DESIGN_SUB_POLICIES.every(
    (entry) => source.includes(entry.id) && source.includes(entry.policyId),
  );
}

export function auditFinal12DesignStabilization(
  root = process.cwd(),
): Final12DesignStabilizationAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[11]!;
  const des38PolicyPresent =
    existsSync(join(root, STABILIZATION_DESIGN_PATTERNS_PATH)) &&
    existsSync(join(root, STABILIZATION_DESIGN_AUDIT_POLICY_PATH));
  const elevenSubPolicyRegistryHonest = des38PolicyPresent && auditElevenSubPolicyRegistry(root);
  const unitTestsPresent = existsSync(join(root, STABILIZATION_DESIGN_UNIT_TEST_PATH));

  const capstone = auditStabilizationDesign();
  const stabilizationDesignPassed = capstone.passed;
  const allSubAuditsPassed =
    capstone.subAudits.length === STABILIZATION_DESIGN_SUB_POLICIES.length &&
    capstone.subAudits.every((audit) => audit.passed);

  const tracker = JSON.parse(
    readFileSync(join(root, "artifacts/execution-tracker-final.json"), "utf8"),
  ) as Record<string, string>;
  const des38RoleDone = tracker["DES-38"] === "done";

  const final11Passed = auditFinal11MarketingCompletion(root).passed;

  const passed =
    des38PolicyPresent &&
    elevenSubPolicyRegistryHonest &&
    stabilizationDesignPassed &&
    allSubAuditsPassed &&
    unitTestsPresent &&
    des38RoleDone &&
    final11Passed;

  return {
    policyId: FINAL_12_DESIGN_STABILIZATION_POLICY_ID,
    phaseId: "FINAL-12",
    taskSlot: phase.taskSlot,
    des38PolicyPresent,
    elevenSubPolicyRegistryHonest,
    stabilizationDesignPassed,
    allSubAuditsPassed,
    unitTestsPresent,
    des38RoleDone,
    final11Passed,
    passed,
  };
}
