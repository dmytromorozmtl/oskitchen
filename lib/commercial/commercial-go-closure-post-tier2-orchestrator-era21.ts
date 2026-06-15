/**
 * Commercial GO closure post-Tier2 orchestrator — milestones, readiness, honest gates.
 * Policy: era21-commercial-go-closure-post-tier2-orchestrator-v1
 */
import {
  COMMERCIAL_GO_CLOSURE_PROSPECT_DRAFT_TEMPLATE,
  COMMERCIAL_GO_CLOSURE_STEP3_DOC,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  resolveNextIncompleteCommercialGoClosurePhase,
} from "@/lib/commercial/commercial-go-closure-phases-era21";
import type { evaluateCommercialGoClosureEnv } from "@/scripts/ops/validate-commercial-go-closure-env";

export const COMMERCIAL_GO_CLOSURE_POST_TIER2_ORCHESTRATOR_ERA21_POLICY_ID =
  "era21-commercial-go-closure-post-tier2-orchestrator-v1" as const;

export const COMMERCIAL_GO_CLOSURE_READINESS_CHECKLIST_PATH =
  "docs/commercial-go-closure-readiness-checklist.md" as const;

export const COMMERCIAL_GO_CLOSURE_POST_TIER2_ORCHESTRATOR_COMMAND =
  "npm run ops:run-commercial-go-closure-post-tier2-orchestrator" as const;

export const COMMERCIAL_GO_CLOSURE_READINESS_EXPORT_COMMAND =
  "npm run ops:export-commercial-go-closure-readiness-checklist -- --write" as const;

export type CommercialGoClosureMilestone =
  | "tier2_blocked"
  | "awaiting_icp_qualification"
  | "awaiting_sales_compliance"
  | "awaiting_loi_customer"
  | "awaiting_go_orchestrator"
  | "decision_go";

export type CommercialGoClosurePostTier2OrchestratorSummary = {
  policyId: typeof COMMERCIAL_GO_CLOSURE_POST_TIER2_ORCHESTRATOR_ERA21_POLICY_ID;
  milestone: CommercialGoClosureMilestone;
  prerequisitesComplete: boolean;
  readyForGoOrchestrator: boolean;
  p0ProofStatus: string | null;
  tier2ProofStatus: string | null;
  decision: string | null;
  envPresentCount: number;
  envTotalCount: number;
  goNoGoArtifactPresent: boolean;
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  recommendedCommands: readonly string[];
};

export function resolveCommercialGoClosureMilestone(input: {
  prerequisitesComplete: boolean;
  decision: string | null;
  phases: readonly { id: string; complete: boolean }[];
}): CommercialGoClosureMilestone {
  if (!input.prerequisitesComplete) return "tier2_blocked";
  if (input.decision === "GO") return "decision_go";

  const byId = new Map(input.phases.map((phase) => [phase.id, phase.complete]));

  if (!byId.get("icp_qualification")) return "awaiting_icp_qualification";
  if (!byId.get("sales_compliance")) return "awaiting_sales_compliance";
  if (!byId.get("loi_customer")) return "awaiting_loi_customer";
  if (!byId.get("go_orchestrator")) return "awaiting_go_orchestrator";

  return "decision_go";
}

export function resolveCommercialGoClosureMilestoneFromPhaseStatuses(
  phases: readonly { id: string; complete: boolean }[],
  input: {
    prerequisitesComplete: boolean;
    decision: string | null;
  },
): CommercialGoClosureMilestone {
  return resolveCommercialGoClosureMilestone({
    prerequisitesComplete: input.prerequisitesComplete,
    decision: input.decision,
    phases,
  });
}

export function buildCommercialGoClosurePostTier2OrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateCommercialGoClosureEnv>;
  goNoGoArtifactPresent: boolean;
}): CommercialGoClosurePostTier2OrchestratorSummary {
  const nextPhase = resolveNextIncompleteCommercialGoClosurePhase(input.evaluation.phases);
  const milestone = resolveCommercialGoClosureMilestone({
    prerequisitesComplete: input.evaluation.prerequisites.prerequisitesComplete,
    decision: input.evaluation.decision,
    phases: input.evaluation.phases,
  });

  const recommendedCommands = input.evaluation.prerequisites.prerequisitesComplete
    ? ([
        "npm run ops:validate-tier2-staging-golden-path-integrity -- --json",
        "npm run ops:validate-pilot-gono-go-integrity -- --json",
        "npm run ops:validate-tier2-golden-path-env -- --json",
        "npm run ops:validate-commercial-go-closure-env -- --json",
        COMMERCIAL_GO_CLOSURE_POST_TIER2_ORCHESTRATOR_COMMAND + " -- --write",
        "npm run ops:export-commercial-go-closure-env-template -- --write",
        "npm run ops:sync-commercial-go-closure-progress-report -- --write",
        COMMERCIAL_GO_CLOSURE_READINESS_EXPORT_COMMAND,
        "npm run smoke:pilot-forbidden-claims-enforcement",
        "npm run smoke:pilot-gono-go",
      ] as const)
    : ([
        "npm run ops:run-tier2-golden-path-post-p0-orchestrator -- --write",
        "npm run ops:validate-tier2-golden-path-env -- --json",
        "npm run smoke:tier2-staging-golden-path",
      ] as const);

  return {
    policyId: COMMERCIAL_GO_CLOSURE_POST_TIER2_ORCHESTRATOR_ERA21_POLICY_ID,
    milestone,
    prerequisitesComplete: input.evaluation.prerequisites.prerequisitesComplete,
    readyForGoOrchestrator: input.evaluation.readyForGoOrchestrator,
    p0ProofStatus: input.evaluation.prerequisites.p0ProofStatus,
    tier2ProofStatus: input.evaluation.prerequisites.tier2ProofStatus,
    decision: input.evaluation.decision,
    envPresentCount: input.evaluation.present.length,
    envTotalCount: input.evaluation.present.length + input.evaluation.missing.length,
    goNoGoArtifactPresent: input.goNoGoArtifactPresent,
    nextPhaseId: nextPhase?.id ?? null,
    nextPhaseLabel: nextPhase?.label ?? null,
    recommendedCommands,
  };
}

export function buildCommercialGoClosureReadinessChecklistMarkdown(input: {
  summary: CommercialGoClosurePostTier2OrchestratorSummary;
  evaluation: ReturnType<typeof evaluateCommercialGoClosureEnv>;
}): string {
  const lines: string[] = [
    "# Commercial GO Closure — Readiness Checklist",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Honest ops only** — real ICP prospect, signed LOI, and GO artifact required.",
    "",
    `Policy: \`${COMMERCIAL_GO_CLOSURE_POST_TIER2_ORCHESTRATOR_ERA21_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- P0: \`${input.summary.p0ProofStatus ?? "missing"}\` · Tier 2: \`${input.summary.tier2ProofStatus ?? "missing"}\``,
    `- Decision: ${input.summary.decision ?? "not evaluated"}`,
    `- Ready for smoke:pilot-gono-go: ${input.summary.readyForGoOrchestrator ? "yes" : "no"}`,
    `- Next phase: ${input.summary.nextPhaseLabel ?? "none"}`,
    "",
    "## Phase checklist (5 phases)",
    "",
  ];

  for (const phase of input.evaluation.phases) {
    lines.push(`- [${phase.complete ? "x" : " "}] **${phase.label}**`);
    lines.push(`  - ${phase.detail}`);
    if (phase.routes.length > 0) {
      lines.push(`  - Routes: ${phase.routes.map((route) => `\`${route}\``).join(", ")}`);
    }
  }

  lines.push("");
  lines.push("## Tracked env vars");
  lines.push("");
  if (input.evaluation.missing.length === 0) {
    lines.push("All tracked commercial GO env vars present in local shell.");
  } else {
    for (const key of input.evaluation.missing) {
      lines.push(`- [ ] \`${key}\``);
    }
  }

  lines.push("");
  lines.push("## Commercial execution steps");
  lines.push("");
  lines.push(`- [ ] Fill prospect JSON from [\`${COMMERCIAL_GO_CLOSURE_PROSPECT_DRAFT_TEMPLATE}\`](../${COMMERCIAL_GO_CLOSURE_PROSPECT_DRAFT_TEMPLATE})`);
  lines.push("- [ ] Sales/legal: forbidden claims training + role checklists");
  lines.push("- [ ] Sign LOI → set PILOT_GONOGO_CUSTOMER_NAME + PILOT_GONOGO_LOI_SIGNED_DATE");
  lines.push("- [ ] Run smoke:pilot-forbidden-claims-enforcement");
  lines.push("- [ ] Run smoke:pilot-gono-go → decision: GO");
  lines.push("");
  lines.push("## Product verification");
  lines.push("");
  lines.push("- [ ] `/dashboard/launch-wizard` — Commercial GO 5-phase panel");
  lines.push("- [ ] `/dashboard/today` — Top action priority 2 (Commercial GO)");
  lines.push("- [ ] `/dashboard/implementation` — ICP qualification panel");
  lines.push("- [ ] `/platform/commercial-pilot-ops` — Commercial GO phases panel");
  lines.push("");
  lines.push("## Ops commands");
  lines.push("");
  lines.push("```bash");
  for (const command of input.summary.recommendedCommands) {
    lines.push(command);
  }
  lines.push("```");
  lines.push("");
  lines.push(`GO artifact: \`${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH}\``);
  lines.push(`Step 3 doc: [\`${COMMERCIAL_GO_CLOSURE_STEP3_DOC}\`](../${COMMERCIAL_GO_CLOSURE_STEP3_DOC})`);
  lines.push("");

  return lines.join("\n");
}
