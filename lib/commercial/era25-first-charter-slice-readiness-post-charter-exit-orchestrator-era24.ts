/**
 * era25 first charter slice readiness post-charter-exit orchestrator.
 * Policy: era24-era25-first-charter-slice-readiness-post-charter-exit-orchestrator-v1
 */
import {
  ERA25_FIRST_CHARTER_SLICE_ENGINEERING_PATTERN,
  ERA25_FIRST_CHARTER_SLICE_FOREVER_COMMANDS,
  ERA25_FIRST_CHARTER_SLICE_GUARDRAILS,
  ERA25_FIRST_CHARTER_SLICE_READINESS_PLATFORM_ANCHOR,
  ERA25_FIRST_CHARTER_SLICE_READINESS_REPORT_PATH,
  ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC,
  ERA25_CHARTER_REQUIRED_SECTIONS,
} from "@/lib/commercial/era25-first-charter-slice-readiness-phases-era24";
import {
  type Era25CharterExitMilestone,
} from "@/lib/commercial/era25-charter-exit-post-terminus-guard-orchestrator-era24";
import { ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC } from "@/lib/commercial/era25-charter-exit-outside-linear-path-phases-era24";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluateEra25FirstCharterSliceReadiness } from "@/lib/commercial/evaluate-era25-first-charter-slice-readiness";

export const ERA25_FIRST_CHARTER_SLICE_READINESS_POST_CHARTER_EXIT_ORCHESTRATOR_ERA24_POLICY_ID =
  "era24-era25-first-charter-slice-readiness-post-charter-exit-orchestrator-v1" as const;

export const ERA25_FIRST_CHARTER_SLICE_READINESS_POST_CHARTER_EXIT_ORCHESTRATOR_COMMAND =
  "npm run ops:run-era25-first-charter-slice-readiness-post-charter-exit-orchestrator" as const;

export type Era25FirstCharterSliceReadinessMilestone =
  | "charter_exit_blocked"
  | "awaiting_signed_charter"
  | "attention_charter_sections"
  | "era25_first_charter_slice_ready";

export type Era25FirstCharterSliceReadinessPostCharterExitOrchestratorSummary = {
  policyId: typeof ERA25_FIRST_CHARTER_SLICE_READINESS_POST_CHARTER_EXIT_ORCHESTRATOR_ERA24_POLICY_ID;
  milestone: Era25FirstCharterSliceReadinessMilestone;
  era25CharterExitMilestone: Era25CharterExitMilestone;
  charterDocPath: string | null;
  sectionsValid: boolean;
  missingSectionCount: number;
  firstMissingSectionLabel: string | null;
  requiredSectionCount: number;
  readyForCharterExitSmokes: boolean;
  readyForCharterSectionSmokes: boolean;
  readinessReportPresent: boolean;
  recommendedCommands: readonly string[];
};

const CHARTER_EXIT_BLOCKED_MILESTONES: readonly Era25CharterExitMilestone[] = [
  "terminus_guard_blocked",
  "attention_charter_checklist",
] as const;

export function resolveEra25FirstCharterSliceReadinessMilestone(input: {
  era25CharterExitMilestone: Era25CharterExitMilestone;
  signedCharterPresent: boolean;
  sectionsValid: boolean;
}): Era25FirstCharterSliceReadinessMilestone {
  if (CHARTER_EXIT_BLOCKED_MILESTONES.includes(input.era25CharterExitMilestone)) {
    return "charter_exit_blocked";
  }

  if (!input.signedCharterPresent) {
    return "awaiting_signed_charter";
  }

  if (!input.sectionsValid) {
    return "attention_charter_sections";
  }

  return "era25_first_charter_slice_ready";
}

export function buildEra25FirstCharterSliceReadinessPostCharterExitOrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateEra25FirstCharterSliceReadiness>;
  era25CharterExitMilestone: Era25CharterExitMilestone;
  artifacts: { readinessReportPresent: boolean };
}): Era25FirstCharterSliceReadinessPostCharterExitOrchestratorSummary {
  const milestone = resolveEra25FirstCharterSliceReadinessMilestone({
    era25CharterExitMilestone: input.era25CharterExitMilestone,
    signedCharterPresent: input.evaluation.charterExit.signedCharterPresent,
    sectionsValid: input.evaluation.charterValidation.sectionsValid,
  });

  const readyForCharterExitSmokes = CHARTER_EXIT_BLOCKED_MILESTONES.includes(
    input.era25CharterExitMilestone,
  );
  const readyForCharterSectionSmokes =
    input.evaluation.charterExit.signedCharterPresent &&
    !input.evaluation.charterValidation.sectionsValid;
  const firstMissing = input.evaluation.charterValidation.missingSectionLabels[0] ?? null;

  const recommendedCommands =
    milestone === "charter_exit_blocked"
      ? ([
          "npm run ops:run-era25-charter-exit-post-terminus-guard-orchestrator -- --write",
          "npm run ops:validate-era25-charter-exit-outside-linear-path -- --json",
          "npm run ops:validate-linear-chain-terminus-guard -- --json",
        ] as const)
      : ([
          "npm run ops:validate-era25-first-charter-slice-readiness-integrity -- --json",
          "npm run ops:validate-era25-first-charter-slice-readiness -- --json",
          ERA25_FIRST_CHARTER_SLICE_READINESS_POST_CHARTER_EXIT_ORCHESTRATOR_COMMAND +
            " -- --write",
          "npm run ops:sync-era25-first-charter-slice-readiness-report -- --write",
          "npm run ops:export-era-charter-readiness-checklist -- --write",
          ...(readyForCharterSectionSmokes || milestone === "attention_charter_sections"
            ? ([
                `Complete charter doc sections in ${input.evaluation.charterValidation.charterDocPath ?? "docs/era25-*-charter-*.md"}`,
                "npm run test:ci:era25-first-charter-slice-readiness-era24",
              ] as const)
            : ([] as const)),
          ...(milestone === "awaiting_signed_charter"
            ? ([
                "Write docs/era25-<name>-charter-2026-*.md after leadership sign-off",
              ] as const)
            : ([] as const)),
          ...(readyForCharterExitSmokes
            ? ([
                "npm run ops:run-era25-charter-exit-post-terminus-guard-orchestrator -- --write",
              ] as const)
            : ([] as const)),
          "npm run test:ci:commercial-pilot-runbook:cert",
        ] as const);

  return {
    policyId: ERA25_FIRST_CHARTER_SLICE_READINESS_POST_CHARTER_EXIT_ORCHESTRATOR_ERA24_POLICY_ID,
    milestone,
    era25CharterExitMilestone: input.era25CharterExitMilestone,
    charterDocPath: input.evaluation.charterValidation.charterDocPath,
    sectionsValid: input.evaluation.charterValidation.sectionsValid,
    missingSectionCount: input.evaluation.charterValidation.missingSectionIds.length,
    firstMissingSectionLabel: firstMissing,
    requiredSectionCount: input.evaluation.requiredSectionCount,
    readyForCharterExitSmokes,
    readyForCharterSectionSmokes,
    readinessReportPresent: input.artifacts.readinessReportPresent,
    recommendedCommands,
  };
}

export function buildEra25FirstCharterSliceReadinessOrchestratorReportMarkdown(input: {
  summary: Era25FirstCharterSliceReadinessPostCharterExitOrchestratorSummary;
  evaluation: ReturnType<typeof evaluateEra25FirstCharterSliceReadiness>;
}): string {
  const lines: string[] = [
    "# era25 First Charter Slice — Readiness Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Outside linear catalog** — validates charter doc sections before era25 engineering.",
    "",
    `Policy: \`${ERA25_FIRST_CHARTER_SLICE_READINESS_POST_CHARTER_EXIT_ORCHESTRATOR_ERA24_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- era25 charter exit milestone: ${input.summary.era25CharterExitMilestone}`,
    `- Charter doc: ${input.summary.charterDocPath ?? "none"}`,
    `- Sections valid: ${input.summary.sectionsValid ? "yes" : "no"}`,
    `- Missing sections: ${input.summary.missingSectionCount}/${input.summary.requiredSectionCount}`,
    `- Ready for charter exit smokes: ${input.summary.readyForCharterExitSmokes ? "yes" : "no"}`,
    `- Ready for charter section smokes: ${input.summary.readyForCharterSectionSmokes ? "yes" : "no"}`,
    "",
    "## Required charter sections",
    "",
  ];

  for (const result of input.evaluation.charterValidation.sectionResults) {
    lines.push(`- [${result.present ? "x" : " "}] **${result.label}** (\`${result.sectionId}\`)`);
  }

  lines.push("");
  lines.push("## Engineering pattern (after charter validates)");
  lines.push("");
  for (const row of ERA25_FIRST_CHARTER_SLICE_ENGINEERING_PATTERN) {
    lines.push(`- **${row.component}** → \`${row.artifact}\``);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of ERA25_FIRST_CHARTER_SLICE_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of ERA25_FIRST_CHARTER_SLICE_FOREVER_COMMANDS) {
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
  lines.push(`Readiness report: \`${ERA25_FIRST_CHARTER_SLICE_READINESS_REPORT_PATH}\``);
  lines.push(
    `Template doc: [\`${ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC}\`](../${ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC})`,
  );
  lines.push(
    `Charter exit doc: [\`${ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC}\`](../${ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC})`,
  );
  lines.push(
    `Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_FIRST_CHARTER_SLICE_READINESS_PLATFORM_ANCHOR}\``,
  );
  lines.push("");

  return lines.join("\n");
}
