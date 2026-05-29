/**
 * Linear chain terminus guard post-linear-path-closed orchestrator — Step 17 FORBIDDEN milestones.
 * Policy: era24-linear-chain-terminus-guard-post-linear-path-closed-orchestrator-v1
 *
 * NOT a catalog step · guards repo integrity after Step 16 terminal closure.
 */
import {
  LINEAR_CHAIN_FORBIDDEN_PROPOSALS,
  LINEAR_CHAIN_MAX_STEP,
  LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
  LINEAR_CHAIN_TERMINUS_GUARD_FOREVER_COMMANDS,
  LINEAR_CHAIN_TERMINUS_GUARD_PLATFORM_ANCHOR,
  LINEAR_CHAIN_TERMINUS_GUARD_REPORT_PATH,
  evaluateLinearChainTerminusGuard,
} from "@/lib/commercial/linear-chain-terminus-guard-era24";
import {
  LINEAR_PATH_PERMANENTLY_CLOSED_BLOCKED_MILESTONES,
  type LinearPathPermanentlyClosedMilestone,
} from "@/lib/commercial/linear-path-permanently-closed-post-absolute-end-orchestrator-era24";
import { LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC } from "@/lib/commercial/linear-path-permanently-closed-phases-era24";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { ERA_CHARTER_READINESS_CHECKLIST_PATH } from "@/lib/commercial/post-terminus-steady-state-phases-era24";

export const LINEAR_CHAIN_TERMINUS_GUARD_POST_LINEAR_PATH_CLOSED_ORCHESTRATOR_ERA24_POLICY_ID =
  "era24-linear-chain-terminus-guard-post-linear-path-closed-orchestrator-v1" as const;

export const LINEAR_CHAIN_TERMINUS_GUARD_POST_LINEAR_PATH_CLOSED_ORCHESTRATOR_COMMAND =
  "npm run ops:run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator" as const;

export type LinearChainTerminusGuardMilestone =
  | LinearPathPermanentlyClosedMilestone
  | "linear_path_closure_blocked"
  | "attention_catalog_integrity"
  | "step17_forbidden_healthy";

export const LINEAR_CHAIN_TERMINUS_GUARD_BLOCKED_MILESTONES: readonly LinearChainTerminusGuardMilestone[] =
  [
    ...LINEAR_PATH_PERMANENTLY_CLOSED_BLOCKED_MILESTONES,
    "linear_path_closure_blocked",
  ] as const;

export type LinearChainTerminusGuardPostLinearPathClosedOrchestratorSummary = {
  policyId: typeof LINEAR_CHAIN_TERMINUS_GUARD_POST_LINEAR_PATH_CLOSED_ORCHESTRATOR_ERA24_POLICY_ID;
  milestone: LinearChainTerminusGuardMilestone;
  step17Forbidden: boolean;
  guardPassed: boolean;
  linearPathPermanentlyClosedMilestone: LinearPathPermanentlyClosedMilestone;
  readyForLinearPathClosureSmokes: boolean;
  readyForCatalogIntegritySmokes: boolean;
  maxLinearStep: number;
  catalogStepCount: number;
  violationCount: number;
  firstViolationId: string | null;
  firstViolationDetail: string | null;
  forbiddenDocPresent: boolean;
  step16DocPresent: boolean;
  step18DocPresent: boolean;
  terminusGuardReportPresent: boolean;
  recommendedCommands: readonly string[];
};

export function resolveLinearChainTerminusGuardMilestone(input: {
  linearPathPermanentlyClosedMilestone: LinearPathPermanentlyClosedMilestone;
  guardPassed: boolean;
}): LinearChainTerminusGuardMilestone {
  if (input.linearPathPermanentlyClosedMilestone !== "linear_path_permanently_closed_healthy") {
    if (
      (LINEAR_PATH_PERMANENTLY_CLOSED_BLOCKED_MILESTONES as readonly string[]).includes(
        input.linearPathPermanentlyClosedMilestone,
      )
    ) {
      return input.linearPathPermanentlyClosedMilestone;
    }
    return "linear_path_closure_blocked";
  }

  if (!input.guardPassed) {
    return "attention_catalog_integrity";
  }

  return "step17_forbidden_healthy";
}

export function buildLinearChainTerminusGuardPostLinearPathClosedOrchestratorSummary(input: {
  guard: ReturnType<typeof evaluateLinearChainTerminusGuard>;
  linearPathPermanentlyClosedMilestone: LinearPathPermanentlyClosedMilestone;
  artifacts: { terminusGuardReportPresent: boolean };
}): LinearChainTerminusGuardPostLinearPathClosedOrchestratorSummary {
  const milestone = resolveLinearChainTerminusGuardMilestone({
    linearPathPermanentlyClosedMilestone: input.linearPathPermanentlyClosedMilestone,
    guardPassed: input.guard.guardPassed,
  });

  const readyForLinearPathClosureSmokes =
    input.linearPathPermanentlyClosedMilestone !== "linear_path_permanently_closed_healthy";
  const readyForCatalogIntegritySmokes = !input.guard.guardPassed;
  const firstViolation = input.guard.violations[0] ?? null;

  const recommendedCommands =
    milestone === "era25_sustained_ops_convergence_blocked"
      ? ([
          "npm run ops:validate-commercial-inflection-readiness -- --json",
          "npm run ops:validate-p0-vault-env -- --json",
          "npm run ops:run-p0-vault-day0-orchestrator -- --json",
          "npm run smoke:p0-staging-proof-unblock",
        ] as const)
      : milestone === "linear_path_closure_blocked" ||
          milestone === "absolute_end_blocked" ||
          milestone === "steady_state_blocked" ||
          milestone === "engineering_terminus_blocked" ||
          milestone === "maintenance_mode_blocked" ||
          milestone === "product_evolution_blocked"
        ? ([
            "npm run ops:run-linear-path-permanently-closed-post-absolute-end-orchestrator -- --write",
            "npm run ops:validate-linear-path-permanently-closed -- --json",
            "npm run ops:validate-commercial-pilot-path-absolute-end -- --json",
            "npm run ops:validate-commercial-pilot-path -- --json",
          ] as const)
        : ([
          "npm run ops:validate-linear-chain-terminus-guard -- --json",
          LINEAR_CHAIN_TERMINUS_GUARD_POST_LINEAR_PATH_CLOSED_ORCHESTRATOR_COMMAND + " -- --write",
          "npm run ops:sync-linear-chain-terminus-guard-report -- --write",
          "npm run ops:validate-linear-path-permanently-closed -- --json",
          ...(readyForCatalogIntegritySmokes || milestone === "attention_catalog_integrity"
            ? ([
                "npm run test:ci:linear-chain-terminus-guard-era24",
                "npm run test:ci:linear-chain-terminus-guard-era24:cert",
              ] as const)
            : ([] as const)),
          ...(readyForLinearPathClosureSmokes
            ? ([
                "npm run ops:run-linear-path-permanently-closed-post-absolute-end-orchestrator -- --write",
              ] as const)
            : ([] as const)),
          "npm run ops:export-era-charter-readiness-checklist -- --write",
          "npm run test:ci:commercial-pilot-runbook:cert",
        ] as const);

  return {
    policyId: LINEAR_CHAIN_TERMINUS_GUARD_POST_LINEAR_PATH_CLOSED_ORCHESTRATOR_ERA24_POLICY_ID,
    milestone,
    step17Forbidden: true,
    guardPassed: input.guard.guardPassed,
    linearPathPermanentlyClosedMilestone: input.linearPathPermanentlyClosedMilestone,
    readyForLinearPathClosureSmokes,
    readyForCatalogIntegritySmokes,
    maxLinearStep: input.guard.maxLinearStep,
    catalogStepCount: input.guard.catalogStepCount,
    violationCount: input.guard.violations.length,
    firstViolationId: firstViolation?.id ?? null,
    firstViolationDetail: firstViolation?.detail ?? null,
    forbiddenDocPresent: input.guard.forbiddenDocPresent,
    step16DocPresent: input.guard.step16DocPresent,
    step18DocPresent: input.guard.step18DocPresent,
    terminusGuardReportPresent: input.artifacts.terminusGuardReportPresent,
    recommendedCommands,
  };
}

export function buildLinearChainTerminusGuardOrchestratorReportMarkdown(input: {
  summary: LinearChainTerminusGuardPostLinearPathClosedOrchestratorSummary;
  guard: ReturnType<typeof evaluateLinearChainTerminusGuard>;
}): string {
  const lines: string[] = [
    "# Linear Chain Terminus Guard — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Step 17 FORBIDDEN** — not a catalog step · guards linear chain integrity at 16 steps.",
    "",
    `Policy: \`${LINEAR_CHAIN_TERMINUS_GUARD_POST_LINEAR_PATH_CLOSED_ORCHESTRATOR_ERA24_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Step 17 forbidden: **yes** (meta-doc only)`,
    `- Guard passed: ${input.summary.guardPassed ? "yes" : "no"}`,
    `- Linear path milestone: ${input.summary.linearPathPermanentlyClosedMilestone}`,
    `- Catalog steps: ${input.summary.catalogStepCount} (max ${LINEAR_CHAIN_MAX_STEP})`,
    `- Violations: ${input.summary.violationCount}`,
    `- Ready for linear path closure smokes: ${input.summary.readyForLinearPathClosureSmokes ? "yes" : "no"}`,
    `- Ready for catalog integrity smokes: ${input.summary.readyForCatalogIntegritySmokes ? "yes" : "no"}`,
    "",
    "## Guard checks",
    "",
    `- Forbidden doc present: ${input.guard.forbiddenDocPresent ? "yes" : "no"}`,
    `- Step 16 doc present: ${input.guard.step16DocPresent ? "yes" : "no"}`,
    `- Step 18 doc forbidden absent: ${input.guard.step18DocPresent ? "no — VIOLATION" : "yes"}`,
    "",
  ];

  if (input.guard.violations.length > 0) {
    lines.push("### Violations");
    lines.push("");
    for (const violation of input.guard.violations) {
      lines.push(`- **${violation.id}** — ${violation.detail}`);
    }
    lines.push("");
  }

  lines.push("## Forbidden proposals (never)");
  lines.push("");
  for (const proposal of LINEAR_CHAIN_FORBIDDEN_PROPOSALS) {
    lines.push(`- ${proposal}`);
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of LINEAR_CHAIN_TERMINUS_GUARD_FOREVER_COMMANDS) {
    lines.push(`npm run ${cmd}`);
  }
  lines.push("```");
  lines.push("");
  lines.push("## era25+ exit (only path for new gates)");
  lines.push("");
  lines.push("- `npm run ops:export-era-charter-readiness-checklist -- --write`");
  lines.push(`- Checklist artifact: \`${ERA_CHARTER_READINESS_CHECKLIST_PATH}\``);
  lines.push("- `docs/era25-<name>-charter-2026-*.md` — **outside** Steps 1–16");
  lines.push("");
  lines.push("## Ops commands");
  lines.push("");
  lines.push("```bash");
  for (const command of input.summary.recommendedCommands) {
    lines.push(command);
  }
  lines.push("```");
  lines.push("");
  lines.push(`Terminus guard report: \`${LINEAR_CHAIN_TERMINUS_GUARD_REPORT_PATH}\``);
  lines.push(
    `Step 16 doc: [\`${LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC}\`](../${LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC})`,
  );
  lines.push(
    `Step 17 forbidden: [\`${LINEAR_CHAIN_STEP17_FORBIDDEN_DOC}\`](../${LINEAR_CHAIN_STEP17_FORBIDDEN_DOC})`,
  );
  lines.push(
    `Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}${LINEAR_CHAIN_TERMINUS_GUARD_PLATFORM_ANCHOR}\``,
  );
  lines.push("");

  return lines.join("\n");
}
