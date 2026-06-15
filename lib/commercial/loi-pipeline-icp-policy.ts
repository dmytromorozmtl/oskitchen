/**
 * Absolute Final Task 26 — LOI pipeline + ICP targeting human gate.
 *
 * @see docs/loi-signed.md
 * @see lib/commercial/pilot-icp-contract-era17.ts
 * @see docs/icp-definition-final.md
 */

export const LOI_PIPELINE_ICP_POLICY_ID = "loi-pipeline-icp-absolute-final-v1" as const;

export const LOI_PIPELINE_ICP_DOC = "docs/loi-signed.md" as const;

export const LOI_PIPELINE_ICP_REQUIRED_HEADINGS = [
  "LOI pipeline — human gates",
  "ICP targeting — qualification gates",
  "Human gate checklist",
] as const;

export const LOI_PIPELINE_STAGES = [
  "Prospect",
  "ICP qualified",
  "LOI draft",
  "Live walkthrough",
  "Legal review",
  "Countersigned",
  "Pilot Week 0",
] as const;

export const LOI_PIPELINE_ICP_PRIMARY_SEGMENTS = [
  "Ghost kitchen",
  "Commissary",
  "Meal prep",
] as const;

export const LOI_PIPELINE_ICP_REQUIRED_CRITERIA = [
  "Single-location or ≤5 locations in pilot scope",
  "Owner or ops lead committed to weekly sync",
  "Needs order hub + storefront and/or in-browser POS + KDS",
  "Accepts BETA / pilot_ready labels",
] as const;

export const LOI_PIPELINE_ICP_DISQUALIFIERS = [
  "Production SSO/SAML",
  "SOC 2 Type II",
  "Unified cross-channel inventory",
  "Rush-hour KDS SLA",
  "Offline POS or Toast/Square hardware parity",
] as const;

export const LOI_PIPELINE_ICP_EVALUATOR = "evaluatePilotIcpQualification" as const;

export const LOI_PIPELINE_ICP_CI_SCRIPTS = ["test:ci:loi-pipeline-icp"] as const;

export type LoiPipelineIcpDocAudit = {
  policyId: typeof LOI_PIPELINE_ICP_POLICY_ID;
  missingHeadings: string[];
  stageCount: number;
  segmentCount: number;
  passed: boolean;
};

export function auditLoiPipelineIcpDoc(source: string): LoiPipelineIcpDocAudit {
  const missingHeadings = LOI_PIPELINE_ICP_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const stageCount = LOI_PIPELINE_STAGES.filter((stage) => source.includes(stage)).length;
  const segmentCount = LOI_PIPELINE_ICP_PRIMARY_SEGMENTS.filter((segment) =>
    source.includes(segment),
  ).length;

  return {
    policyId: LOI_PIPELINE_ICP_POLICY_ID,
    missingHeadings,
    stageCount,
    segmentCount,
    passed:
      missingHeadings.length === 0 &&
      stageCount === LOI_PIPELINE_STAGES.length &&
      segmentCount === LOI_PIPELINE_ICP_PRIMARY_SEGMENTS.length,
  };
}
