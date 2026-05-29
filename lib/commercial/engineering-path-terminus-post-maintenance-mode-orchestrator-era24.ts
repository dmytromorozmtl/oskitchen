/**
 * Engineering path terminus post-maintenance-mode orchestrator — master path milestones.
 * Policy: era24-engineering-path-terminus-post-maintenance-mode-orchestrator-v1
 */
import {
  COMMERCIAL_PILOT_PATH_STATUS_REPORT_PATH,
  ENGINEERING_PATH_TERMINUS_STEP13_DOC,
  type CommercialPilotPathStepStatus,
  type CommercialPilotPathSummary,
} from "@/lib/commercial/engineering-path-terminus-era24";
import { MAINTENANCE_MODE_STEP12_DOC } from "@/lib/commercial/maintenance-mode-phases-era24";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluateCommercialPilotPath } from "@/lib/commercial/evaluate-commercial-pilot-path";
import type { evaluateMaintenanceMode } from "@/scripts/ops/validate-maintenance-mode";

export const ENGINEERING_PATH_TERMINUS_POST_MAINTENANCE_MODE_ORCHESTRATOR_ERA24_POLICY_ID =
  "era24-engineering-path-terminus-post-maintenance-mode-orchestrator-v1" as const;

export const ENGINEERING_PATH_TERMINUS_POST_MAINTENANCE_MODE_ORCHESTRATOR_COMMAND =
  "npm run ops:run-engineering-path-terminus-post-maintenance-mode-orchestrator" as const;

export const ENGINEERING_PATH_TERMINUS_INFORMATIONAL_STEP_IDS = [
  "continuous_improvement_loop",
  "sustained_product_evolution",
  "maintenance_mode",
] as const;

export type EngineeringPathTerminusMilestone =
  | "era25_sustained_ops_convergence_blocked"
  | "product_evolution_blocked"
  | "maintenance_mode_blocked"
  | "attention_gate_chain"
  | "attention_informational_stack"
  | "engineering_path_terminus_healthy";

export const ENGINEERING_PATH_TERMINUS_BLOCKED_MILESTONES: readonly EngineeringPathTerminusMilestone[] =
  [
    "era25_sustained_ops_convergence_blocked",
    "product_evolution_blocked",
    "maintenance_mode_blocked",
  ] as const;

export type EngineeringPathTerminusPostMaintenanceModeOrchestratorSummary = {
  policyId: typeof ENGINEERING_PATH_TERMINUS_POST_MAINTENANCE_MODE_ORCHESTRATOR_ERA24_POLICY_ID;
  milestone: EngineeringPathTerminusMilestone;
  engineeringTerminusActive: boolean;
  pathComplete: boolean;
  gateStepsComplete: boolean;
  maintenanceModeActive: boolean;
  sustainedOpsConvergenceReady: boolean;
  pureOperationalModeEra25Active: boolean;
  productEvolutionReady: boolean;
  maintenanceModeMilestone: ReturnType<typeof evaluateMaintenanceMode>["maintenanceModeMilestone"];
  readyForGateChainSmokes: boolean;
  readyForMaintenanceRhythmSmokes: boolean;
  goDecision: string | null;
  completedSteps: number;
  totalSteps: number;
  firstBlockedStepNumber: number | null;
  firstBlockedStepLabel: string | null;
  firstBlockedGateStepNumber: number | null;
  firstBlockedGateStepLabel: string | null;
  statusReportPresent: boolean;
  recommendedCommands: readonly string[];
};

export function resolveEngineeringPathTerminusMilestone(input: {
  maintenanceMode: ReturnType<typeof evaluateMaintenanceMode>;
  summary: Pick<
    CommercialPilotPathSummary,
    "firstBlockedStep" | "firstBlockedGateStep" | "engineeringTerminusActive"
  >;
}): EngineeringPathTerminusMilestone {
  if (!input.maintenanceMode.prerequisites.sustainedOpsConvergenceReady) {
    return "era25_sustained_ops_convergence_blocked";
  }

  if (!input.maintenanceMode.prerequisites.productEvolutionReady) {
    return "product_evolution_blocked";
  }

  if (
    !input.maintenanceMode.maintenanceModeActive ||
    !input.summary.engineeringTerminusActive
  ) {
    return "maintenance_mode_blocked";
  }

  if (input.summary.firstBlockedGateStep) {
    return "attention_gate_chain";
  }

  const blocked = input.summary.firstBlockedStep;
  if (
    blocked &&
    (ENGINEERING_PATH_TERMINUS_INFORMATIONAL_STEP_IDS as readonly string[]).includes(blocked.id)
  ) {
    return "attention_informational_stack";
  }

  return "engineering_path_terminus_healthy";
}

export function resolveEngineeringPathTerminusMilestoneFromSummary(input: {
  maintenanceMode: ReturnType<typeof evaluateMaintenanceMode>;
  summary: CommercialPilotPathSummary;
}): EngineeringPathTerminusMilestone {
  return resolveEngineeringPathTerminusMilestone({
    maintenanceMode: input.maintenanceMode,
    summary: input.summary,
  });
}

export function buildEngineeringPathTerminusPostMaintenanceModeOrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateCommercialPilotPath>;
  maintenanceMode: ReturnType<typeof evaluateMaintenanceMode>;
  artifacts: { statusReportPresent: boolean };
}): EngineeringPathTerminusPostMaintenanceModeOrchestratorSummary {
  const milestone = resolveEngineeringPathTerminusMilestone({
    maintenanceMode: input.maintenanceMode,
    summary: input.evaluation.summary,
  });

  const readyForGateChainSmokes = input.evaluation.summary.firstBlockedGateStep !== null;
  const readyForMaintenanceRhythmSmokes =
    input.maintenanceMode.maintenanceModeActive &&
    input.maintenanceMode.maintenanceModeMilestone !== "maintenance_mode_healthy";

  const recommendedCommands =
    milestone === "era25_sustained_ops_convergence_blocked"
      ? ([
          "npm run ops:validate-sustained-operational-excellence-convergence-era25 -- --json",
          "npm run ops:validate-pure-operational-mode-terminus-era25 -- --json",
          "npm run ops:validate-sustained-product-evolution -- --json",
          "npm run ops:validate-maintenance-mode -- --json",
        ] as const)
      : milestone === "product_evolution_blocked"
        ? ([
            "npm run ops:run-sustained-product-evolution-post-improvement-loop-orchestrator -- --write",
            "npm run ops:validate-sustained-product-evolution -- --json",
            "npm run ops:validate-maintenance-mode -- --json",
          ] as const)
        : input.maintenanceMode.maintenanceModeActive
    ? ([
        "npm run ops:validate-maintenance-mode -- --json",
        "npm run ops:validate-commercial-pilot-path -- --json",
        ENGINEERING_PATH_TERMINUS_POST_MAINTENANCE_MODE_ORCHESTRATOR_COMMAND + " -- --write",
        "npm run ops:sync-commercial-pilot-path-status-report -- --write",
        "npm run ops:run-maintenance-mode-post-product-evolution-orchestrator -- --write",
        "npm run ops:sync-maintenance-mode-playbook-report -- --write",
        ...(readyForGateChainSmokes || milestone === "attention_gate_chain"
          ? ([
              "npm run ops:validate-p0-vault-env -- --json",
              "npm run ops:validate-tier2-golden-path-env -- --json",
              "npm run ops:validate-commercial-go-closure-env -- --json",
            ] as const)
          : ([] as const)),
        ...(readyForMaintenanceRhythmSmokes || milestone === "attention_informational_stack"
          ? ([
              "npm run ops:validate-continuous-improvement-loop -- --json",
              "npm run ops:validate-sustained-product-evolution -- --json",
              "npm run smoke:pilot-metrics-baseline",
            ] as const)
          : ([] as const)),
        "npm run test:ci:commercial-pilot-runbook:cert",
      ] as const)
    : ([
        "npm run ops:run-maintenance-mode-post-product-evolution-orchestrator -- --write",
        "npm run ops:validate-maintenance-mode -- --json",
        "npm run ops:validate-sustained-product-evolution -- --json",
      ] as const);

  return {
    policyId: ENGINEERING_PATH_TERMINUS_POST_MAINTENANCE_MODE_ORCHESTRATOR_ERA24_POLICY_ID,
    milestone,
    engineeringTerminusActive: input.evaluation.summary.engineeringTerminusActive,
    pathComplete: input.evaluation.summary.pathComplete,
    gateStepsComplete: input.evaluation.summary.gateStepsComplete,
    maintenanceModeActive: input.maintenanceMode.maintenanceModeActive,
    sustainedOpsConvergenceReady: input.maintenanceMode.prerequisites.sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active: input.maintenanceMode.prerequisites.pureOperationalModeEra25Active,
    productEvolutionReady: input.maintenanceMode.prerequisites.productEvolutionReady,
    maintenanceModeMilestone: input.maintenanceMode.maintenanceModeMilestone,
    readyForGateChainSmokes,
    readyForMaintenanceRhythmSmokes,
    goDecision: input.evaluation.summary.goDecision,
    completedSteps: input.evaluation.summary.completedSteps,
    totalSteps: input.evaluation.summary.totalSteps,
    firstBlockedStepNumber: input.evaluation.summary.firstBlockedStep?.step ?? null,
    firstBlockedStepLabel: input.evaluation.summary.firstBlockedStep?.label ?? null,
    firstBlockedGateStepNumber: input.evaluation.summary.firstBlockedGateStep?.step ?? null,
    firstBlockedGateStepLabel: input.evaluation.summary.firstBlockedGateStep?.label ?? null,
    statusReportPresent: input.artifacts.statusReportPresent,
    recommendedCommands,
  };
}

export function buildEngineeringPathTerminusOrchestratorReportMarkdown(input: {
  summary: EngineeringPathTerminusPostMaintenanceModeOrchestratorSummary;
  evaluation: ReturnType<typeof evaluateCommercialPilotPath>;
  steps: readonly CommercialPilotPathStepStatus[];
}): string {
  const lines: string[] = [
    "# Engineering Path Terminus — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Informational only** — master orchestration across Steps 1–16; no new briefing priority or env attestation keys.",
    "",
    `Policy: \`${ENGINEERING_PATH_TERMINUS_POST_MAINTENANCE_MODE_ORCHESTRATOR_ERA24_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Engineering terminus active: ${input.summary.engineeringTerminusActive ? "yes" : "no"}`,
    `- Maintenance mode active: ${input.summary.maintenanceModeActive ? "yes" : "no"}`,
    `- era25 sustained ops convergence ready: ${input.summary.sustainedOpsConvergenceReady ? "yes" : "no"}`,
    `- Product evolution ready: ${input.summary.productEvolutionReady ? "yes" : "no"}`,
    `- Maintenance mode milestone: ${input.summary.maintenanceModeMilestone}`,
    `- Gate chain complete: ${input.summary.gateStepsComplete ? "yes" : "no"}`,
    `- Path complete: ${input.summary.pathComplete ? "yes" : "no"}`,
    `- Steps complete: ${input.summary.completedSteps}/${input.summary.totalSteps}`,
    `- GO decision: ${input.summary.goDecision ?? "missing"}`,
    `- First blocked: ${input.summary.firstBlockedStepLabel ?? "none"}`,
    `- First blocked gate: ${input.summary.firstBlockedGateStepLabel ?? "none"}`,
    `- Ready for gate chain smokes: ${input.summary.readyForGateChainSmokes ? "yes" : "no"}`,
    `- Ready for maintenance rhythm smokes: ${input.summary.readyForMaintenanceRhythmSmokes ? "yes" : "no"}`,
    "",
    "## Step catalog",
    "",
  ];

  for (const step of input.steps) {
    lines.push(
      `- [${step.complete ? "x" : " "}] **Step ${step.step}** — ${step.label} (${step.kind})`,
    );
    lines.push(`  - ${step.detail}`);
  }

  lines.push("");
  lines.push("## Product verification");
  lines.push("");
  lines.push("- [ ] `/platform/commercial-pilot-ops#maintenance-mode` — `#engineering-path-terminus` catalog");
  lines.push("- [ ] `/dashboard/today` — maintenance compact panel (use Platform ops for catalog)");
  lines.push("- [ ] `/dashboard/launch-wizard` — new pilots only · isolated GO artifacts");
  lines.push("");
  lines.push("## Ops commands");
  lines.push("");
  lines.push("```bash");
  for (const command of input.summary.recommendedCommands) {
    lines.push(command);
  }
  lines.push("```");
  lines.push("");
  lines.push(`Status report: \`${COMMERCIAL_PILOT_PATH_STATUS_REPORT_PATH}\``);
  lines.push(
    `Step 12 doc: [\`${MAINTENANCE_MODE_STEP12_DOC}\`](../${MAINTENANCE_MODE_STEP12_DOC})`,
  );
  lines.push(
    `Step 13 doc: [\`${ENGINEERING_PATH_TERMINUS_STEP13_DOC}\`](../${ENGINEERING_PATH_TERMINUS_STEP13_DOC})`,
  );
  lines.push(`Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}#engineering-path-terminus\``);
  lines.push("");

  return lines.join("\n");
}
