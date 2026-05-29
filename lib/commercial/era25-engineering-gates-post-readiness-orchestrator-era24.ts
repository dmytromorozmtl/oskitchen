/**
 * era25 engineering gates post-readiness orchestrator — gate open/closed milestones.
 * Policy: era24-era25-engineering-gates-post-readiness-orchestrator-v1
 */
import {
  ERA25_ENGINEERING_GATES_FOREVER_COMMANDS,
  ERA25_ENGINEERING_GATES_GUARDRAILS,
  ERA25_ENGINEERING_GATES_HUMAN_STEPS,
  ERA25_ENGINEERING_GATES_PLATFORM_ANCHOR,
  ERA25_ENGINEERING_GATES_REPORT_PATH,
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC,
  ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS,
} from "@/lib/commercial/era25-engineering-gates-require-signed-charter-phases-era24";
import {
  type Era25FirstCharterSliceReadinessMilestone,
} from "@/lib/commercial/era25-first-charter-slice-readiness-post-charter-exit-orchestrator-era24";
import { ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC } from "@/lib/commercial/era25-first-charter-slice-readiness-phases-era24";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluateEra25EngineeringGatesRequireSignedCharter } from "@/lib/commercial/evaluate-era25-engineering-gates-require-signed-charter";

export const ERA25_ENGINEERING_GATES_POST_READINESS_ORCHESTRATOR_ERA24_POLICY_ID =
  "era24-era25-engineering-gates-post-readiness-orchestrator-v1" as const;

export const ERA25_ENGINEERING_GATES_POST_READINESS_ORCHESTRATOR_COMMAND =
  "npm run ops:run-era25-engineering-gates-post-readiness-orchestrator" as const;

export type Era25EngineeringGatesMilestone =
  | "charter_readiness_blocked"
  | "awaiting_human_charter_signoff"
  | "attention_illegal_era25_artifacts"
  | "era25_engineering_gates_open";

export type Era25EngineeringGatesPostReadinessOrchestratorSummary = {
  policyId: typeof ERA25_ENGINEERING_GATES_POST_READINESS_ORCHESTRATOR_ERA24_POLICY_ID;
  milestone: Era25EngineeringGatesMilestone;
  era25FirstCharterSliceReadinessMilestone: Era25FirstCharterSliceReadinessMilestone;
  gatesBlocked: boolean;
  terminusGuardPassed: boolean;
  illegalArtifactCount: number;
  firstIllegalArtifactPath: string | null;
  firstIllegalArtifactReason: string | null;
  readyForCharterReadinessSmokes: boolean;
  readyForIllegalArtifactSmokes: boolean;
  gatesReportPresent: boolean;
  recommendedCommands: readonly string[];
};

const READINESS_BLOCKED_MILESTONES: readonly Era25FirstCharterSliceReadinessMilestone[] = [
  "charter_exit_blocked",
  "attention_charter_sections",
] as const;

export function resolveEra25EngineeringGatesMilestone(input: {
  era25FirstCharterSliceReadinessMilestone: Era25FirstCharterSliceReadinessMilestone;
  illegalArtifactCount: number;
}): Era25EngineeringGatesMilestone {
  if (READINESS_BLOCKED_MILESTONES.includes(input.era25FirstCharterSliceReadinessMilestone)) {
    return "charter_readiness_blocked";
  }

  if (input.illegalArtifactCount > 0) {
    return "attention_illegal_era25_artifacts";
  }

  if (input.era25FirstCharterSliceReadinessMilestone !== "era25_first_charter_slice_ready") {
    return "awaiting_human_charter_signoff";
  }

  return "era25_engineering_gates_open";
}

export function buildEra25EngineeringGatesPostReadinessOrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateEra25EngineeringGatesRequireSignedCharter>;
  artifacts: { gatesReportPresent: boolean };
}): Era25EngineeringGatesPostReadinessOrchestratorSummary {
  const milestone = resolveEra25EngineeringGatesMilestone({
    era25FirstCharterSliceReadinessMilestone:
      input.evaluation.readiness.era25FirstCharterSliceReadinessMilestone,
    illegalArtifactCount: input.evaluation.illegalArtifacts.length,
  });

  const readyForCharterReadinessSmokes = READINESS_BLOCKED_MILESTONES.includes(
    input.evaluation.readiness.era25FirstCharterSliceReadinessMilestone,
  );
  const readyForIllegalArtifactSmokes = input.evaluation.illegalArtifacts.length > 0;
  const firstIllegal = input.evaluation.illegalArtifacts[0] ?? null;

  const recommendedCommands =
    milestone === "charter_readiness_blocked"
      ? ([
          "npm run ops:run-era25-first-charter-slice-readiness-post-charter-exit-orchestrator -- --write",
          "npm run ops:validate-era25-first-charter-slice-readiness -- --json",
          "npm run ops:validate-era25-charter-exit-outside-linear-path -- --json",
        ] as const)
      : ([
          "npm run ops:validate-era25-engineering-gates-require-signed-charter -- --json",
          ERA25_ENGINEERING_GATES_POST_READINESS_ORCHESTRATOR_COMMAND + " -- --write",
          "npm run ops:sync-era25-engineering-gates-require-signed-charter-report -- --write",
          "npm run ops:validate-linear-chain-terminus-guard -- --json",
          ...(readyForIllegalArtifactSmokes || milestone === "attention_illegal_era25_artifacts"
            ? ([
                "npm run test:ci:era25-engineering-gates-require-signed-charter-era24",
                "npm run test:ci:era25-engineering-gates-require-signed-charter-era24:cert",
              ] as const)
            : ([] as const)),
          ...(milestone === "awaiting_human_charter_signoff"
            ? ([
                "Write docs/era25-<name>-charter-2026-*.md with all 10 sections",
                "npm run ops:export-era-charter-readiness-checklist -- --write",
              ] as const)
            : ([] as const)),
          ...(milestone === "era25_engineering_gates_open"
            ? ([
                "Begin first era25 product slice on new #era25-<name> anchor only",
              ] as const)
            : ([] as const)),
          "npm run test:ci:commercial-pilot-runbook:cert",
        ] as const);

  return {
    policyId: ERA25_ENGINEERING_GATES_POST_READINESS_ORCHESTRATOR_ERA24_POLICY_ID,
    milestone,
    era25FirstCharterSliceReadinessMilestone:
      input.evaluation.readiness.era25FirstCharterSliceReadinessMilestone,
    gatesBlocked: input.evaluation.gatesBlocked,
    terminusGuardPassed: input.evaluation.terminusGuardPassed,
    illegalArtifactCount: input.evaluation.illegalArtifacts.length,
    firstIllegalArtifactPath: firstIllegal?.path ?? null,
    firstIllegalArtifactReason: firstIllegal?.reason ?? null,
    readyForCharterReadinessSmokes,
    readyForIllegalArtifactSmokes,
    gatesReportPresent: input.artifacts.gatesReportPresent,
    recommendedCommands,
  };
}

export function buildEra25EngineeringGatesOrchestratorReportMarkdown(input: {
  summary: Era25EngineeringGatesPostReadinessOrchestratorSummary;
  evaluation: ReturnType<typeof evaluateEra25EngineeringGatesRequireSignedCharter>;
}): string {
  const lines: string[] = [
    "# era25 Engineering Gates — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Gate enforcement only** — era25 product engineering blocked until charter readiness healthy.",
    "",
    `Policy: \`${ERA25_ENGINEERING_GATES_POST_READINESS_ORCHESTRATOR_ERA24_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Readiness milestone: ${input.summary.era25FirstCharterSliceReadinessMilestone}`,
    `- Gates blocked: ${input.summary.gatesBlocked ? "yes" : "no"}`,
    `- Terminus guard passed: ${input.summary.terminusGuardPassed ? "yes" : "no"}`,
    `- Illegal era25 artifacts: ${input.summary.illegalArtifactCount}`,
    `- Ready for charter readiness smokes: ${input.summary.readyForCharterReadinessSmokes ? "yes" : "no"}`,
    `- Ready for illegal artifact smokes: ${input.summary.readyForIllegalArtifactSmokes ? "yes" : "no"}`,
    "",
  ];

  if (input.evaluation.illegalArtifacts.length > 0) {
    lines.push("## Illegal artifacts detected");
    lines.push("");
    for (const artifact of input.evaluation.illegalArtifacts) {
      lines.push(`- \`${artifact.path}\` — ${artifact.reason}`);
    }
    lines.push("");
  }

  lines.push("## First product slice requirements (when gates open)");
  lines.push("");
  for (const req of ERA25_FIRST_PRODUCT_SLICE_REQUIREMENTS) {
    lines.push(`- **${req.label}** — e.g. ${req.example}`);
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of ERA25_ENGINEERING_GATES_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of ERA25_ENGINEERING_GATES_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of ERA25_ENGINEERING_GATES_FOREVER_COMMANDS) {
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
  lines.push(`Gates report: \`${ERA25_ENGINEERING_GATES_REPORT_PATH}\``);
  lines.push(
    `Gates doc: [\`${ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC}\`](../${ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC})`,
  );
  lines.push(
    `Readiness template: [\`${ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC}\`](../${ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC})`,
  );
  lines.push(
    `Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_ENGINEERING_GATES_PLATFORM_ANCHOR}\``,
  );
  lines.push("");

  return lines.join("\n");
}
