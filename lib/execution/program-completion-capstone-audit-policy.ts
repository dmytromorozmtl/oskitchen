import { auditCompetitorCompletionCapstone } from "@/lib/competitor/competitor-completion-capstone-audit-policy";
import { auditDevBetaGovernanceCapstone } from "@/lib/developer/dev-beta-governance-capstone-audit-policy";
import { auditStabilizationDesign } from "@/lib/design/stabilization-design-audit-policy";
import {
  PROGRAM_COMPLETION_CAPSTONE_POLICY_ID,
  PROGRAM_COMPLETION_CAPSTONE_SUB_POLICIES,
} from "@/lib/execution/program-completion-capstone-patterns";
import {
  betaGovernanceSmokeChainPassContract,
  betaGovernanceSmokeChainWithinPassContract,
  buildBetaGovernanceSmokeChainSummaries,
  BETA_GOVERNANCE_SMOKE_CHAIN_INTEGRATION_POLICY_ID,
} from "@/lib/integrations/beta-governance-smoke-chain-integration-policy";
import { auditMarketingCompletionCapstone } from "@/lib/marketing/marketing-completion-capstone-audit-policy";
import { auditPmCompletionCapstone } from "@/lib/pm/pm-completion-capstone-audit-policy";

/**
 * EXEC-01 — six-role program completion capstone (developer, QA, design, marketing, PM, competitor).
 */

export const PROGRAM_COMPLETION_CAPSTONE_AUDIT_POLICY_ID = PROGRAM_COMPLETION_CAPSTONE_POLICY_ID;

export type ProgramCompletionCapstoneSubAuditResult = {
  taskId: string;
  policyId: string;
  surface: string;
  nestedSubAuditCount: number;
  passed: boolean;
};

export type ProgramCompletionCapstoneAuditReport = {
  policyId: typeof PROGRAM_COMPLETION_CAPSTONE_AUDIT_POLICY_ID;
  subAudits: ProgramCompletionCapstoneSubAuditResult[];
  passed: boolean;
};

function auditQaBetaGovernanceChain(root?: string): boolean {
  const summaries = buildBetaGovernanceSmokeChainSummaries({ certPassed: true, root });
  const contract = betaGovernanceSmokeChainPassContract(summaries);
  return betaGovernanceSmokeChainWithinPassContract(contract);
}

const SUB_AUDIT_RUNNERS: Record<
  string,
  (root?: string) => { policyId: string; nestedSubAuditCount: number; passed: boolean }
> = {
  "DEV-56": (root) => {
    const report = auditDevBetaGovernanceCapstone(root);
    return {
      policyId: report.policyId,
      nestedSubAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
  "QA-45": (root) => ({
    policyId: BETA_GOVERNANCE_SMOKE_CHAIN_INTEGRATION_POLICY_ID,
    nestedSubAuditCount: 3,
    passed: auditQaBetaGovernanceChain(root),
  }),
  "DES-38": (root) => {
    const report = auditStabilizationDesign(root);
    return {
      policyId: report.policyId,
      nestedSubAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
  "MKT-42": (root) => {
    const report = auditMarketingCompletionCapstone(root);
    return {
      policyId: report.policyId,
      nestedSubAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
  "PM-06": (root) => {
    const report = auditPmCompletionCapstone(root);
    return {
      policyId: report.policyId,
      nestedSubAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
  "COMP-03": (root) => {
    const report = auditCompetitorCompletionCapstone(root);
    return {
      policyId: report.policyId,
      nestedSubAuditCount: report.subAudits.length,
      passed: report.passed,
    };
  },
};

export function auditProgramCompletionCapstone(
  root?: string,
): ProgramCompletionCapstoneAuditReport {
  const subAudits = PROGRAM_COMPLETION_CAPSTONE_SUB_POLICIES.map((entry) => {
    const report = SUB_AUDIT_RUNNERS[entry.id]!(root);
    return {
      taskId: entry.id,
      policyId: report.policyId,
      surface: entry.surface,
      nestedSubAuditCount: report.nestedSubAuditCount,
      passed: report.passed,
    };
  });

  return {
    policyId: PROGRAM_COMPLETION_CAPSTONE_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
