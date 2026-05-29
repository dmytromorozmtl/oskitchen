/**
 * era25 Owner Daily Briefing Breakthrough post-gates orchestrator.
 * Policy: era25-owner-daily-briefing-breakthrough-post-gates-orchestrator-v1
 */
import {
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_FOREVER_COMMANDS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_GUARDRAILS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_HUMAN_STEPS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PLATFORM_ANCHOR,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_REPORT_PATH,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-phases-era25";
import { ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC } from "@/lib/commercial/era25-first-product-slice-blueprint-phases-era24";
import type { Era25FirstProductSliceBlueprintMilestone } from "@/lib/commercial/era25-first-product-slice-blueprint-post-gates-orchestrator-era24";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluateOwnerDailyBriefingBreakthroughEra25 } from "@/lib/commercial/evaluate-owner-daily-briefing-breakthrough-era25";

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_POST_GATES_ORCHESTRATOR_POLICY_ID =
  "era25-owner-daily-briefing-breakthrough-post-gates-orchestrator-v1" as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_POST_GATES_ORCHESTRATOR_COMMAND =
  "npm run ops:run-owner-daily-briefing-breakthrough-post-gates-orchestrator-era25" as const;

export type OwnerDailyBriefingBreakthroughEra25Milestone =
  | "blueprint_regression_blocked"
  | "awaiting_staging_proof"
  | "attention_briefing_gaps"
  | "owner_daily_briefing_breakthrough_era25_ready";

export type OwnerDailyBriefingBreakthroughEra25OrchestratorSummary = {
  policyId: typeof OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_POST_GATES_ORCHESTRATOR_POLICY_ID;
  milestone: OwnerDailyBriefingBreakthroughEra25Milestone;
  era25FirstProductSliceBlueprintMilestone: Era25FirstProductSliceBlueprintMilestone;
  sliceBlocked: boolean;
  p0ProofStatus: string | null;
  wiredBriefingTileCount: number;
  briefingSchemeCount: number;
  allBriefingTilesWired: boolean;
  readyForBlueprintRegressionSmokes: boolean;
  readyForStagingProofSmokes: boolean;
  readyForBriefingGapSmokes: boolean;
  productReportPresent: boolean;
  recommendedCommands: readonly string[];
};

const BLUEPRINT_BLOCKED_MILESTONES: readonly Era25FirstProductSliceBlueprintMilestone[] = [
  "engineering_gates_blocked",
  "awaiting_canonical_charter_doc",
  "attention_charter_sections_for_slice",
  "attention_staging_checklist_gaps",
  "attention_premature_era25_product",
] as const;

export function resolveOwnerDailyBriefingBreakthroughEra25Milestone(input: {
  era25FirstProductSliceBlueprintMilestone: Era25FirstProductSliceBlueprintMilestone;
  allBriefingTilesWired: boolean;
  p0ProofStatus: string | null;
}): OwnerDailyBriefingBreakthroughEra25Milestone {
  if (
    input.era25FirstProductSliceBlueprintMilestone !== "era25_first_product_slice_blueprint_ready"
  ) {
    return "blueprint_regression_blocked";
  }

  if (!input.allBriefingTilesWired) {
    return "attention_briefing_gaps";
  }

  if (input.p0ProofStatus !== "proof_passed") {
    return "awaiting_staging_proof";
  }

  return "owner_daily_briefing_breakthrough_era25_ready";
}

export function buildOwnerDailyBriefingBreakthroughEra25OrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateOwnerDailyBriefingBreakthroughEra25>;
  artifacts: { productReportPresent: boolean };
}): OwnerDailyBriefingBreakthroughEra25OrchestratorSummary {
  const milestone = resolveOwnerDailyBriefingBreakthroughEra25Milestone({
    era25FirstProductSliceBlueprintMilestone:
      input.evaluation.blueprint.era25FirstProductSliceBlueprintMilestone,
    allBriefingTilesWired: input.evaluation.allBriefingTilesWired,
    p0ProofStatus: input.evaluation.p0ProofStatus,
  });

  const readyForBlueprintRegressionSmokes = BLUEPRINT_BLOCKED_MILESTONES.includes(
    input.evaluation.blueprint.era25FirstProductSliceBlueprintMilestone,
  );
  const readyForStagingProofSmokes = input.evaluation.p0ProofStatus !== "proof_passed";
  const readyForBriefingGapSmokes = !input.evaluation.allBriefingTilesWired;

  const recommendedCommands =
    milestone === "blueprint_regression_blocked"
      ? ([
          "npm run ops:run-era25-first-product-slice-blueprint-post-gates-orchestrator -- --write",
          "npm run ops:validate-era25-first-product-slice-blueprint -- --json",
          `Write docs/era25-owner-daily-briefing-breakthrough-charter-2026-*.md`,
        ] as const)
      : ([
          "npm run ops:validate-owner-daily-briefing-breakthrough-era25 -- --json",
          OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_POST_GATES_ORCHESTRATOR_COMMAND + " -- --write",
          "npm run ops:sync-owner-daily-briefing-breakthrough-era25-report -- --write",
          ...(readyForStagingProofSmokes
            ? ([
                "npm run smoke:p0-staging-proof-unblock -- --checklist-only",
                "npm run smoke:p0-staging-proof-unblock",
              ] as const)
            : ([] as const)),
          ...(milestone === "owner_daily_briefing_breakthrough_era25_ready"
            ? ([
                "Open /dashboard/today#era25-owner-daily-briefing-breakthrough",
                "npm run test:ci:owner-daily-briefing-breakthrough-era25:cert",
              ] as const)
            : ([] as const)),
          "npm run test:ci:commercial-pilot-runbook:cert",
        ] as const);

  return {
    policyId: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_POST_GATES_ORCHESTRATOR_POLICY_ID,
    milestone,
    era25FirstProductSliceBlueprintMilestone:
      input.evaluation.blueprint.era25FirstProductSliceBlueprintMilestone,
    sliceBlocked: input.evaluation.sliceBlocked,
    p0ProofStatus: input.evaluation.p0ProofStatus,
    wiredBriefingTileCount: input.evaluation.wiredBriefingTileCount,
    briefingSchemeCount: input.evaluation.briefingSchemeCount,
    allBriefingTilesWired: input.evaluation.allBriefingTilesWired,
    readyForBlueprintRegressionSmokes,
    readyForStagingProofSmokes,
    readyForBriefingGapSmokes,
    productReportPresent: input.artifacts.productReportPresent,
    recommendedCommands,
  };
}

export function buildOwnerDailyBriefingBreakthroughEra25OrchestratorReportMarkdown(input: {
  summary: OwnerDailyBriefingBreakthroughEra25OrchestratorSummary;
  evaluation: ReturnType<typeof evaluateOwnerDailyBriefingBreakthroughEra25>;
}): string {
  const lines: string[] = [
    "# era25 Owner Daily Briefing Breakthrough — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **First era25 product slice** — WOW pillar breakthrough briefing on Today.",
    "",
    `Policy: \`${OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_POST_GATES_ORCHESTRATOR_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Blueprint milestone: ${input.summary.era25FirstProductSliceBlueprintMilestone}`,
    `- Slice blocked: ${input.summary.sliceBlocked ? "yes" : "no"}`,
    `- P0 proof status: ${input.summary.p0ProofStatus ?? "unknown"}`,
    `- Briefing tiles wired: ${input.summary.wiredBriefingTileCount}/${input.summary.briefingSchemeCount}`,
    "",
    "## era25 briefing scheme B0–B4",
    "",
  ];

  for (const scheme of OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME) {
    const tile = input.evaluation.briefingTiles.find((t) => t.schemeId === scheme.id);
    lines.push(
      `- **${scheme.id}** ${scheme.label} — ${tile?.wired ? "wired" : "gap"} · ${tile?.headline ?? scheme.description}`,
    );
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_FOREVER_COMMANDS) {
    lines.push(`npm run ${cmd}`);
  }
  lines.push("```");
  lines.push("");
  lines.push("## Ops commands");
  lines.push("");
  lines.push("```bash");
  for (const command of input.summary.recommendedCommands) {
    lines.push(command);
  }
  lines.push("```");
  lines.push("");
  lines.push(`Product report: \`${OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_REPORT_PATH}\``);
  lines.push(
    `Product doc: [\`${OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC}\`](../${OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC})`,
  );
  lines.push(
    `Blueprint doc: [\`${ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC}\`](../${ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC})`,
  );
  lines.push(
    `Today: \`/dashboard/today${OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PLATFORM_ANCHOR}\``,
  );
  lines.push(
    `Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}${OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PLATFORM_ANCHOR}\``,
  );
  lines.push("");

  return lines.join("\n");
}
