/**
 * Commercial inflection readiness post-linear-closure orchestrator — sync report artifact.
 * Policy: commercial-inflection-readiness-post-linear-closure-orchestrator-v1
 */
import {
  COMMERCIAL_INFLECTION_EXECUTION_STEP_DOC,
  COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC,
  COMMERCIAL_INFLECTION_READINESS_PLATFORM_ANCHOR,
  COMMERCIAL_INFLECTION_READINESS_POLICY_ID,
  COMMERCIAL_INFLECTION_READINESS_REPORT_PATH,
  evaluateCommercialInflectionReadiness,
  type CommercialInflectionReadinessSummary,
} from "@/lib/commercial/commercial-inflection-readiness-era28";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const COMMERCIAL_INFLECTION_READINESS_POST_LINEAR_CLOSURE_ORCHESTRATOR_POLICY_ID =
  "commercial-inflection-readiness-post-linear-closure-orchestrator-v1" as const;

export const COMMERCIAL_INFLECTION_READINESS_POST_LINEAR_CLOSURE_ORCHESTRATOR_COMMAND =
  "npm run ops:run-commercial-inflection-readiness-orchestrator" as const;

export type CommercialInflectionReadinessOrchestratorSummary = CommercialInflectionReadinessSummary & {
  policyId: typeof COMMERCIAL_INFLECTION_READINESS_POST_LINEAR_CLOSURE_ORCHESTRATOR_POLICY_ID;
  inflectionReportPresent: boolean;
};

export function buildCommercialInflectionReadinessOrchestratorSummary(input: {
  evaluation: CommercialInflectionReadinessSummary;
  artifacts: { inflectionReportPresent: boolean };
}): CommercialInflectionReadinessOrchestratorSummary {
  return {
    ...input.evaluation,
    policyId: COMMERCIAL_INFLECTION_READINESS_POST_LINEAR_CLOSURE_ORCHESTRATOR_POLICY_ID,
    inflectionReportPresent: input.artifacts.inflectionReportPresent,
    recommendedCommands: [
      COMMERCIAL_INFLECTION_READINESS_POST_LINEAR_CLOSURE_ORCHESTRATOR_COMMAND + " -- --write",
      "npm run ops:validate-commercial-inflection-readiness -- --json",
      "npm run ops:sync-commercial-inflection-readiness-report -- --write",
      ...input.evaluation.recommendedCommands,
      "npm run ops:run-p0-vault-day0-orchestrator -- --json",
    ],
  };
}

export function buildCommercialInflectionReadinessOrchestratorReportMarkdown(
  summary: CommercialInflectionReadinessOrchestratorSummary,
): string {
  const lines: string[] = [
    "# Commercial Inflection Readiness — Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Governance 100 ≠ market ready** — pilot executable score is honest from blockers + artifacts.",
    "",
    `Policy: \`${COMMERCIAL_INFLECTION_READINESS_POST_LINEAR_CLOSURE_ORCHESTRATOR_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${summary.milestone}**`,
    `- Pilot executable score: **${summary.pilotExecutableScore}/100**`,
    `- Governance score: **${summary.governanceScore}/100** (orchestration only)`,
    `- P0 proof: **${summary.p0ProofStatus}**`,
    `- GO decision: **${summary.goDecision ?? "missing"}**`,
    `- Tier 2 proof: **${summary.tier2ProofStatus ?? "missing"}**`,
    `- P0 vault missing: **${summary.p0VaultMissingCount}/11**`,
    `- Integration registry LIVE: **${summary.integrationRegistryLiveCount}**`,
    `- Channel registry LIVE: **${summary.channelRegistryLiveCount}**`,
    `- P0 blockers (matrix): **${summary.blockedP0Count}**`,
    `- P1 attention items: **${summary.blockedP1Count}**`,
    "",
    "## Blockers by priority",
    "",
  ];

  for (const row of summary.blockers) {
    lines.push(`### [${row.priority}] ${row.title}`);
    lines.push("");
    lines.push(`- Status: **${row.status}** · Role: ${row.role}`);
    lines.push(`- ${row.detail}`);
    if (row.validateCommand) {
      lines.push(`- Command: \`${row.validateCommand}\``);
    }
    lines.push("");
  }

  lines.push("## Ops commands");
  lines.push("");
  lines.push("```bash");
  for (const command of summary.recommendedCommands) {
    lines.push(command);
  }
  lines.push("```");
  lines.push("");
  lines.push(`Matrix doc: [\`${COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC}\`](../${COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC})`);
  lines.push(`Execution doc: [\`${COMMERCIAL_INFLECTION_EXECUTION_STEP_DOC}\`](../${COMMERCIAL_INFLECTION_EXECUTION_STEP_DOC})`);
  lines.push(`P0 checklist: [\`${P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC}\`](../${P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC})`);
  lines.push(
    `Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}${COMMERCIAL_INFLECTION_READINESS_PLATFORM_ANCHOR}\``,
  );
  lines.push(`Report path: \`${COMMERCIAL_INFLECTION_READINESS_REPORT_PATH}\``);
  lines.push("");

  return lines.join("\n");
}
