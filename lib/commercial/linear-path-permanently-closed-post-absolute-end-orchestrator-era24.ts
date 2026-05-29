/**
 * Linear path permanently closed post-absolute-end orchestrator — doc chain terminus milestones.
 * Policy: era24-linear-path-permanently-closed-post-absolute-end-orchestrator-v1
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

import type { CommercialPilotPathAbsoluteEndMilestone } from "@/lib/commercial/commercial-pilot-path-absolute-end-post-steady-state-orchestrator-era24";
import {
  LINEAR_PATH_DOC_CHAIN_STEP_DOCS,
  LINEAR_PATH_PERMANENTLY_CLOSED_REPORT_PATH,
  LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC,
  TERMINAL_ERA25_EXIT,
  TERMINAL_FORBIDDEN_ACTIONS,
  TERMINAL_FOREVER_COMMANDS,
} from "@/lib/commercial/linear-path-permanently-closed-phases-era24";
import {
  LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
  evaluateLinearChainTerminusGuard,
} from "@/lib/commercial/linear-chain-terminus-guard-era24";
import { COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC } from "@/lib/commercial/commercial-pilot-path-absolute-end-phases-era24";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluateLinearPathPermanentlyClosed } from "@/lib/commercial/evaluate-linear-path-permanently-closed";

export const LINEAR_PATH_PERMANENTLY_CLOSED_POST_ABSOLUTE_END_ORCHESTRATOR_ERA24_POLICY_ID =
  "era24-linear-path-permanently-closed-post-absolute-end-orchestrator-v1" as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_POST_ABSOLUTE_END_ORCHESTRATOR_COMMAND =
  "npm run ops:run-linear-path-permanently-closed-post-absolute-end-orchestrator" as const;

export type LinearPathPermanentlyClosedMilestone =
  | "era25_sustained_ops_convergence_blocked"
  | "product_evolution_blocked"
  | "maintenance_mode_blocked"
  | "engineering_terminus_blocked"
  | "steady_state_blocked"
  | "absolute_end_blocked"
  | "attention_doc_chain"
  | "attention_terminus_guard"
  | "linear_path_permanently_closed_healthy";

/** Inlined from post-steady-state orchestrator — breaks era25 ↔ absolute-end import cycle. */
export const LINEAR_PATH_PERMANENTLY_CLOSED_ABSOLUTE_END_PREREQUISITE_MILESTONES: readonly CommercialPilotPathAbsoluteEndMilestone[] =
  [
    "era25_sustained_ops_convergence_blocked",
    "product_evolution_blocked",
    "maintenance_mode_blocked",
    "engineering_terminus_blocked",
    "steady_state_blocked",
  ] as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_BLOCKED_MILESTONES: readonly LinearPathPermanentlyClosedMilestone[] =
  [
    "era25_sustained_ops_convergence_blocked",
    "product_evolution_blocked",
    "maintenance_mode_blocked",
    "engineering_terminus_blocked",
    "steady_state_blocked",
    "absolute_end_blocked",
  ] as const;

function isAbsoluteEndPrerequisiteBlocked(
  milestone: CommercialPilotPathAbsoluteEndMilestone,
): milestone is
  | "era25_sustained_ops_convergence_blocked"
  | "product_evolution_blocked"
  | "maintenance_mode_blocked"
  | "engineering_terminus_blocked"
  | "steady_state_blocked" {
  return (LINEAR_PATH_PERMANENTLY_CLOSED_ABSOLUTE_END_PREREQUISITE_MILESTONES as readonly string[]).includes(
    milestone,
  );
}

export type LinearPathPermanentlyClosedPostAbsoluteEndOrchestratorSummary = {
  policyId: typeof LINEAR_PATH_PERMANENTLY_CLOSED_POST_ABSOLUTE_END_ORCHESTRATOR_ERA24_POLICY_ID;
  milestone: LinearPathPermanentlyClosedMilestone;
  terminalClosureActive: boolean;
  linearPathPermanentlyClosed: boolean;
  absoluteEndMilestone: CommercialPilotPathAbsoluteEndMilestone;
  readyForAbsoluteEndSmokes: boolean;
  readyForDocChainSmokes: boolean;
  goDecision: string | null;
  completedSteps: number;
  totalSteps: number;
  docChainSteps: number;
  missingDocChainDocs: readonly string[];
  terminusGuardPassed: boolean;
  terminusGuardViolationCount: number;
  linearPathReportPresent: boolean;
  recommendedCommands: readonly string[];
};

export function resolveMissingDocChainDocs(
  root: string = process.cwd(),
): readonly string[] {
  return LINEAR_PATH_DOC_CHAIN_STEP_DOCS.filter((docPath) => !existsSync(join(root, docPath)));
}

export function resolveLinearPathPermanentlyClosedMilestone(input: {
  terminalClosureActive: boolean;
  absoluteEndMilestone: CommercialPilotPathAbsoluteEndMilestone;
  missingDocChainDocs: readonly string[];
  terminusGuardPassed: boolean;
}): LinearPathPermanentlyClosedMilestone {
  if (isAbsoluteEndPrerequisiteBlocked(input.absoluteEndMilestone)) {
    return input.absoluteEndMilestone;
  }

  if (
    !input.terminalClosureActive ||
    input.absoluteEndMilestone !== "absolute_end_healthy"
  ) {
    return "absolute_end_blocked";
  }

  if (input.missingDocChainDocs.length > 0) {
    return "attention_doc_chain";
  }

  if (!input.terminusGuardPassed) {
    return "attention_terminus_guard";
  }

  return "linear_path_permanently_closed_healthy";
}

export function buildLinearPathPermanentlyClosedPostAbsoluteEndOrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateLinearPathPermanentlyClosed>;
  absoluteEndMilestone: CommercialPilotPathAbsoluteEndMilestone;
  missingDocChainDocs: readonly string[];
  terminusGuardPassed: boolean;
  terminusGuardViolationCount: number;
  artifacts: { linearPathReportPresent: boolean };
}): LinearPathPermanentlyClosedPostAbsoluteEndOrchestratorSummary {
  const milestone = resolveLinearPathPermanentlyClosedMilestone({
    terminalClosureActive: input.evaluation.terminalClosureActive,
    absoluteEndMilestone: input.absoluteEndMilestone,
    missingDocChainDocs: input.missingDocChainDocs,
    terminusGuardPassed: input.terminusGuardPassed,
  });

  const readyForAbsoluteEndSmokes =
    !input.evaluation.terminalClosureActive ||
    input.absoluteEndMilestone !== "absolute_end_healthy";
  const readyForDocChainSmokes = input.missingDocChainDocs.length > 0;

  const recommendedCommands = input.evaluation.terminalClosureActive
    ? ([
        "npm run ops:validate-commercial-pilot-path-absolute-end -- --json",
        "npm run ops:validate-linear-chain-terminus-guard -- --json",
        LINEAR_PATH_PERMANENTLY_CLOSED_POST_ABSOLUTE_END_ORCHESTRATOR_COMMAND + " -- --write",
        "npm run ops:sync-linear-path-permanently-closed-report -- --write",
        "npm run ops:run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator -- --write",
        ...(readyForAbsoluteEndSmokes || milestone === "absolute_end_blocked"
          ? ([
              "npm run ops:validate-steady-state-operator-loop -- --json",
              "npm run ops:validate-commercial-pilot-path -- --json",
            ] as const)
          : ([] as const)),
        ...(readyForDocChainSmokes || milestone === "attention_doc_chain"
          ? ([
              "npm run ops:validate-commercial-pilot-path -- --json",
              "npm run test:ci:linear-path-permanently-closed-era24:cert",
            ] as const)
          : ([] as const)),
        ...(milestone === "attention_terminus_guard"
          ? ([
              "npm run ops:validate-linear-chain-terminus-guard -- --json",
              "npm run test:ci:linear-path-permanently-closed-era24",
            ] as const)
          : ([] as const)),
        "npm run test:ci:commercial-pilot-runbook:cert",
      ] as const)
    : ([
        "npm run ops:run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator -- --write",
        "npm run ops:validate-commercial-pilot-path-absolute-end -- --json",
        "npm run ops:validate-commercial-pilot-path -- --json",
      ] as const);

  return {
    policyId: LINEAR_PATH_PERMANENTLY_CLOSED_POST_ABSOLUTE_END_ORCHESTRATOR_ERA24_POLICY_ID,
    milestone,
    terminalClosureActive: input.evaluation.terminalClosureActive,
    linearPathPermanentlyClosed: input.evaluation.linearPathPermanentlyClosed,
    absoluteEndMilestone: input.absoluteEndMilestone,
    readyForAbsoluteEndSmokes,
    readyForDocChainSmokes,
    goDecision: input.evaluation.goDecision,
    completedSteps: input.evaluation.completedSteps,
    totalSteps: input.evaluation.totalSteps,
    docChainSteps: input.evaluation.docChainSteps,
    missingDocChainDocs: input.missingDocChainDocs,
    terminusGuardPassed: input.terminusGuardPassed,
    terminusGuardViolationCount: input.terminusGuardViolationCount,
    linearPathReportPresent: input.artifacts.linearPathReportPresent,
    recommendedCommands,
  };
}

export function buildLinearPathPermanentlyClosedOrchestratorReportMarkdown(input: {
  summary: LinearPathPermanentlyClosedPostAbsoluteEndOrchestratorSummary;
  evaluation: ReturnType<typeof evaluateLinearPathPermanentlyClosed>;
  guard: ReturnType<typeof evaluateLinearChainTerminusGuard>;
}): string {
  const lines: string[] = [
    "# Linear Path Permanently Closed — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Informational only** — doc chain terminus; Step 17+ forbidden in this linear path.",
    "",
    `Policy: \`${LINEAR_PATH_PERMANENTLY_CLOSED_POST_ABSOLUTE_END_ORCHESTRATOR_ERA24_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Terminal closure active: ${input.summary.terminalClosureActive ? "yes" : "no"}`,
    `- Linear path permanently closed: ${input.summary.linearPathPermanentlyClosed ? "yes" : "no"}`,
    `- Absolute end milestone: ${input.summary.absoluteEndMilestone}`,
    `- Doc chain steps: ${input.summary.docChainSteps}`,
    `- Missing docs: ${input.summary.missingDocChainDocs.length === 0 ? "none" : input.summary.missingDocChainDocs.join(", ")}`,
    `- Terminus guard: ${input.summary.terminusGuardPassed ? "PASS" : "FAIL"} (${input.summary.terminusGuardViolationCount} violations)`,
    `- Path progress: ${input.summary.completedSteps}/${input.summary.totalSteps}`,
    `- GO decision: ${input.summary.goDecision ?? "missing"}`,
    `- Ready for absolute end smokes: ${input.summary.readyForAbsoluteEndSmokes ? "yes" : "no"}`,
    `- Ready for doc chain smokes: ${input.summary.readyForDocChainSmokes ? "yes" : "no"}`,
    "",
    "## Doc chain (Steps 1–16)",
    "",
  ];

  for (const [index, docPath] of LINEAR_PATH_DOC_CHAIN_STEP_DOCS.entries()) {
    const present = !input.summary.missingDocChainDocs.includes(docPath);
    lines.push(`${index + 1}. [${present ? "x" : " "}] \`${docPath}\``);
  }

  lines.push("");
  lines.push("## Terminus guard (Step 17 FORBIDDEN — not a path step)");
  lines.push("");
  lines.push(`- Guard passed: ${input.guard.guardPassed ? "yes" : "no"}`);
  lines.push(`- Max linear step: ${input.guard.maxLinearStep}`);
  lines.push(`- Step 17 forbidden doc: \`${LINEAR_CHAIN_STEP17_FORBIDDEN_DOC}\``);
  if (input.guard.violations.length > 0) {
    lines.push("- Violations:");
    for (const violation of input.guard.violations) {
      lines.push(`  - **${violation.id}** — ${violation.detail}`);
    }
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of TERMINAL_FOREVER_COMMANDS) {
    lines.push(`npm run ${cmd}`);
  }
  lines.push("```");
  lines.push("");
  lines.push("## Forbidden (never)");
  lines.push("");
  for (const rule of TERMINAL_FORBIDDEN_ACTIONS) {
    lines.push(`- ${rule}`);
  }
  lines.push("");
  lines.push("## era25+ exit (only path for new gates)");
  lines.push("");
  for (const step of TERMINAL_ERA25_EXIT) {
    lines.push(`- ${step}`);
  }
  lines.push("");
  lines.push("## Ops commands");
  lines.push("");
  lines.push("```bash");
  for (const command of input.summary.recommendedCommands) {
    lines.push(command);
  }
  lines.push("```");
  lines.push("");
  lines.push(`Linear path report: \`${LINEAR_PATH_PERMANENTLY_CLOSED_REPORT_PATH}\``);
  lines.push(
    `Step 15 doc: [\`${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC}\`](../${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC})`,
  );
  lines.push(
    `Step 16 doc: [\`${LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC}\`](../${LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC})`,
  );
  lines.push(
    `Step 17 forbidden: [\`${LINEAR_CHAIN_STEP17_FORBIDDEN_DOC}\`](../${LINEAR_CHAIN_STEP17_FORBIDDEN_DOC})`,
  );
  lines.push(
    `Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}#linear-path-permanently-closed\``,
  );
  lines.push("");

  return lines.join("\n");
}
