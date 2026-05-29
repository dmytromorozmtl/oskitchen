/**
 * era25 charter exit post-terminus-guard orchestrator — outside linear catalog milestones.
 * Policy: era24-era25-charter-exit-post-terminus-guard-orchestrator-v1
 */
import {
  ERA25_CHARTER_EXIT_FOREVER_COMMANDS,
  ERA25_CHARTER_EXIT_GUARDRAILS,
  ERA25_CHARTER_EXIT_HUMAN_STEPS,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC,
  ERA25_CHARTER_EXIT_PLATFORM_ANCHOR,
  ERA25_CHARTER_EXIT_REPORT_PATH,
  ERA25_CHARTER_DOC_GLOB_HINT,
  ERA_CHARTER_CRITERIA,
  ERA_CHARTER_READINESS_CHECKLIST_PATH,
} from "@/lib/commercial/era25-charter-exit-outside-linear-path-phases-era24";
import {
  type LinearChainTerminusGuardMilestone,
} from "@/lib/commercial/linear-chain-terminus-guard-post-linear-path-closed-orchestrator-era24";
import { LINEAR_CHAIN_STEP17_FORBIDDEN_DOC } from "@/lib/commercial/linear-chain-terminus-guard-era24";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluateEra25CharterExitOutsideLinearPath } from "@/lib/commercial/evaluate-era25-charter-exit-outside-linear-path";

export const ERA25_CHARTER_EXIT_POST_TERMINUS_GUARD_ORCHESTRATOR_ERA24_POLICY_ID =
  "era24-era25-charter-exit-post-terminus-guard-orchestrator-v1" as const;

export const ERA25_CHARTER_EXIT_POST_TERMINUS_GUARD_ORCHESTRATOR_COMMAND =
  "npm run ops:run-era25-charter-exit-post-terminus-guard-orchestrator" as const;

export type Era25CharterExitMilestone =
  | "terminus_guard_blocked"
  | "attention_charter_checklist"
  | "awaiting_signed_charter"
  | "era25_charter_exit_healthy";

export type Era25CharterExitPostTerminusGuardOrchestratorSummary = {
  policyId: typeof ERA25_CHARTER_EXIT_POST_TERMINUS_GUARD_ORCHESTRATOR_ERA24_POLICY_ID;
  milestone: Era25CharterExitMilestone;
  linearChainTerminusGuardMilestone: LinearChainTerminusGuardMilestone;
  guardPassed: boolean;
  charterChecklistPresent: boolean;
  signedCharterPresent: boolean;
  era25CharterDocCount: number;
  firstEra25CharterDoc: string | null;
  readyForTerminusGuardSmokes: boolean;
  readyForCharterChecklistSmokes: boolean;
  criteriaCount: number;
  era25CharterExitReportPresent: boolean;
  recommendedCommands: readonly string[];
};

export function resolveEra25CharterExitMilestone(input: {
  linearChainTerminusGuardMilestone: LinearChainTerminusGuardMilestone;
  guardPassed: boolean;
  charterChecklistPresent: boolean;
  signedCharterPresent: boolean;
}): Era25CharterExitMilestone {
  if (
    input.linearChainTerminusGuardMilestone !== "step17_forbidden_healthy" ||
    !input.guardPassed
  ) {
    return "terminus_guard_blocked";
  }

  if (!input.charterChecklistPresent) {
    return "attention_charter_checklist";
  }

  if (!input.signedCharterPresent) {
    return "awaiting_signed_charter";
  }

  return "era25_charter_exit_healthy";
}

export function buildEra25CharterExitPostTerminusGuardOrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateEra25CharterExitOutsideLinearPath>;
  artifacts: { era25CharterExitReportPresent: boolean };
}): Era25CharterExitPostTerminusGuardOrchestratorSummary {
  const milestone = resolveEra25CharterExitMilestone({
    linearChainTerminusGuardMilestone:
      input.evaluation.terminusGuard.linearChainTerminusGuardMilestone,
    guardPassed: input.evaluation.terminusGuard.guard.guardPassed,
    charterChecklistPresent: input.evaluation.charterChecklistPresent,
    signedCharterPresent: input.evaluation.signedCharterPresent,
  });

  const readyForTerminusGuardSmokes =
    input.evaluation.terminusGuard.linearChainTerminusGuardMilestone !==
      "step17_forbidden_healthy" || !input.evaluation.terminusGuard.guard.guardPassed;
  const readyForCharterChecklistSmokes = !input.evaluation.charterChecklistPresent;

  const recommendedCommands =
    milestone === "terminus_guard_blocked"
      ? ([
          "npm run ops:run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator -- --write",
          "npm run ops:validate-linear-chain-terminus-guard -- --json",
          "npm run ops:validate-linear-path-permanently-closed -- --json",
          "npm run ops:validate-commercial-pilot-path -- --json",
        ] as const)
      : ([
          "npm run ops:validate-era25-charter-exit-outside-linear-path-integrity -- --json",
          "npm run ops:validate-era25-charter-exit-outside-linear-path -- --json",
          ERA25_CHARTER_EXIT_POST_TERMINUS_GUARD_ORCHESTRATOR_COMMAND + " -- --write",
          "npm run ops:sync-era25-charter-exit-outside-linear-path-report -- --write",
          "npm run ops:export-era-charter-readiness-checklist -- --write",
          "npm run ops:validate-linear-chain-terminus-guard -- --json",
          ...(readyForCharterChecklistSmokes || milestone === "attention_charter_checklist"
            ? ([
                "npm run ops:export-era-charter-readiness-checklist -- --write",
                "npm run test:ci:era25-charter-exit-outside-linear-path-era24:cert",
              ] as const)
            : ([] as const)),
          ...(milestone === "awaiting_signed_charter"
            ? ([
                `Write ${ERA25_CHARTER_DOC_GLOB_HINT} after leadership sign-off`,
              ] as const)
            : ([] as const)),
          ...(readyForTerminusGuardSmokes
            ? ([
                "npm run ops:run-linear-path-permanently-closed-post-absolute-end-orchestrator -- --write",
              ] as const)
            : ([] as const)),
          "npm run test:ci:commercial-pilot-runbook:cert",
        ] as const);

  return {
    policyId: ERA25_CHARTER_EXIT_POST_TERMINUS_GUARD_ORCHESTRATOR_ERA24_POLICY_ID,
    milestone,
    linearChainTerminusGuardMilestone:
      input.evaluation.terminusGuard.linearChainTerminusGuardMilestone,
    guardPassed: input.evaluation.terminusGuard.guard.guardPassed,
    charterChecklistPresent: input.evaluation.charterChecklistPresent,
    signedCharterPresent: input.evaluation.signedCharterPresent,
    era25CharterDocCount: input.evaluation.era25CharterDocs.length,
    firstEra25CharterDoc: input.evaluation.era25CharterDocs[0] ?? null,
    readyForTerminusGuardSmokes,
    readyForCharterChecklistSmokes,
    criteriaCount: input.evaluation.criteriaCount,
    era25CharterExitReportPresent: input.artifacts.era25CharterExitReportPresent,
    recommendedCommands,
  };
}

export function buildEra25CharterExitOrchestratorReportMarkdown(input: {
  summary: Era25CharterExitPostTerminusGuardOrchestratorSummary;
  evaluation: ReturnType<typeof evaluateEra25CharterExitOutsideLinearPath>;
}): string {
  const lines: string[] = [
    "# era25+ Charter Exit — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Outside linear catalog** — NOT Step 18 · human charter sign-off required.",
    "",
    `Policy: \`${ERA25_CHARTER_EXIT_POST_TERMINUS_GUARD_ORCHESTRATOR_ERA24_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Terminus guard milestone: ${input.summary.linearChainTerminusGuardMilestone}`,
    `- Guard passed: ${input.summary.guardPassed ? "yes" : "no"}`,
    `- Charter checklist present: ${input.summary.charterChecklistPresent ? "yes" : "no"}`,
    `- Signed charter present: ${input.summary.signedCharterPresent ? "yes" : "no"}`,
    `- era25 charter docs: ${input.summary.era25CharterDocCount}`,
    `- Ready for terminus guard smokes: ${input.summary.readyForTerminusGuardSmokes ? "yes" : "no"}`,
    `- Ready for charter checklist smokes: ${input.summary.readyForCharterChecklistSmokes ? "yes" : "no"}`,
    "",
    "## Human steps (era25 exit)",
    "",
  ];

  for (const step of ERA25_CHARTER_EXIT_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Charter criteria (ALL required before era25 engineering)");
  lines.push("");
  for (const criterion of ERA_CHARTER_CRITERIA) {
    lines.push(`- **${criterion.label}** — e.g. ${criterion.example}`);
  }

  if (input.evaluation.era25CharterDocs.length > 0) {
    lines.push("");
    lines.push("## Signed charter docs found");
    lines.push("");
    for (const doc of input.evaluation.era25CharterDocs) {
      lines.push(`- \`${doc}\``);
    }
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of ERA25_CHARTER_EXIT_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of ERA25_CHARTER_EXIT_FOREVER_COMMANDS) {
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
  lines.push(`Charter exit report: \`${ERA25_CHARTER_EXIT_REPORT_PATH}\``);
  lines.push(`Checklist: \`${ERA_CHARTER_READINESS_CHECKLIST_PATH}\``);
  lines.push(
    `Process doc: [\`${ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC}\`](../${ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC})`,
  );
  lines.push(
    `Step 17 forbidden: [\`${LINEAR_CHAIN_STEP17_FORBIDDEN_DOC}\`](../${LINEAR_CHAIN_STEP17_FORBIDDEN_DOC})`,
  );
  lines.push(
    `Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_CHARTER_EXIT_PLATFORM_ANCHOR}\``,
  );
  lines.push("");

  return lines.join("\n");
}
