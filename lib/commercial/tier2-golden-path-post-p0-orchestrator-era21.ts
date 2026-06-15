/**
 * Tier 2 golden path post-P0 orchestrator — milestones, readiness, honest gates.
 * Policy: era21-tier2-golden-path-post-p0-orchestrator-v1
 */
import {
  TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC,
  TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT,
} from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import {
  buildTier2GoldenPathPhaseStatuses,
  resolveNextIncompleteTier2GoldenPathPhase,
} from "@/lib/commercial/tier2-staging-golden-path-phases-era21";
import type { evaluateTier2GoldenPathEnv } from "@/scripts/ops/validate-tier2-golden-path-env";

export const TIER2_GOLDEN_PATH_POST_P0_ORCHESTRATOR_ERA21_POLICY_ID =
  "era21-tier2-golden-path-post-p0-orchestrator-v1" as const;

export const TIER2_GOLDEN_PATH_ERA21_STEP2_DOC =
  "docs/next-step-2-after-p0-pass-2026-05-28.md" as const;

export const TIER2_GOLDEN_PATH_READINESS_CHECKLIST_PATH =
  "docs/tier2-golden-path-readiness-checklist.md" as const;

export const TIER2_GOLDEN_PATH_POST_P0_ORCHESTRATOR_COMMAND =
  "npm run ops:run-tier2-golden-path-post-p0-orchestrator" as const;

export const TIER2_GOLDEN_PATH_READINESS_EXPORT_COMMAND =
  "npm run ops:export-tier2-golden-path-readiness-checklist -- --write" as const;

export type Tier2GoldenPathMilestone =
  | "p0_blocked"
  | "awaiting_child_smokes"
  | "awaiting_manual_fulfillment"
  | "awaiting_github_evidence"
  | "awaiting_operator_metadata"
  | "awaiting_smoke_rerun"
  | "proof_passed";

export type Tier2GoldenPathPostP0OrchestratorSummary = {
  policyId: typeof TIER2_GOLDEN_PATH_POST_P0_ORCHESTRATOR_ERA21_POLICY_ID;
  milestone: Tier2GoldenPathMilestone;
  p0GatePassed: boolean;
  tier2GatePassed: boolean;
  p0ProofStatus: string | null;
  tier2ProofStatus: string | null;
  envPresentCount: number;
  envTotalCount: number;
  artifactPresent: boolean;
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  recommendedCommands: readonly string[];
};

export function resolveTier2GoldenPathMilestone(input: {
  p0GatePassed: boolean;
  tier2GatePassed: boolean;
  phases: readonly { id: string; complete: boolean }[];
}): Tier2GoldenPathMilestone {
  if (!input.p0GatePassed) return "p0_blocked";
  if (input.tier2GatePassed) return "proof_passed";

  const byId = new Map(input.phases.map((phase) => [phase.id, phase.complete]));

  if (!byId.get("automated_child_smokes")) return "awaiting_child_smokes";
  if (!byId.get("manual_fulfillment")) return "awaiting_manual_fulfillment";
  if (!byId.get("github_kds_evidence")) return "awaiting_github_evidence";
  if (!byId.get("operator_metadata")) return "awaiting_operator_metadata";

  return "awaiting_smoke_rerun";
}

export function resolveTier2GoldenPathMilestoneFromPhaseStatuses(
  phases: readonly { id: string; complete: boolean }[],
  input: {
    p0GatePassed: boolean;
    tier2GatePassed: boolean;
  },
): Tier2GoldenPathMilestone {
  return resolveTier2GoldenPathMilestone({
    p0GatePassed: input.p0GatePassed,
    tier2GatePassed: input.tier2GatePassed,
    phases,
  });
}

export function buildTier2GoldenPathPostP0OrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateTier2GoldenPathEnv>;
  artifactPresent: boolean;
}): Tier2GoldenPathPostP0OrchestratorSummary {
  const nextPhase = resolveNextIncompleteTier2GoldenPathPhase(input.evaluation.phases);
  const milestone = resolveTier2GoldenPathMilestone({
    p0GatePassed: input.evaluation.p0GatePassed,
    tier2GatePassed: input.evaluation.tier2GatePassed,
    phases: input.evaluation.phases,
  });

  const recommendedCommands = input.evaluation.p0GatePassed
    ? ([
        "npm run ops:validate-p0-staging-proof-integrity -- --json",
        "npm run ops:validate-tier2-staging-golden-path-integrity -- --json",
        "npm run ops:validate-p0-vault-env -- --json",
        "npm run ops:validate-tier2-golden-path-env -- --json",
        TIER2_GOLDEN_PATH_POST_P0_ORCHESTRATOR_COMMAND + " -- --write",
        "npm run ops:export-tier2-golden-path-env-template -- --write",
        "npm run ops:sync-tier2-golden-path-progress-report -- --write",
        TIER2_GOLDEN_PATH_READINESS_EXPORT_COMMAND,
        "npm run smoke:tier2-staging-golden-path -- --checklist-only",
        "npm run smoke:tier2-staging-golden-path",
      ] as const)
    : ([
        "npm run ops:run-p0-vault-day0-orchestrator -- --write",
        "npm run ops:validate-p0-vault-env -- --json",
        "npm run smoke:p0-staging-proof-unblock",
      ] as const);

  return {
    policyId: TIER2_GOLDEN_PATH_POST_P0_ORCHESTRATOR_ERA21_POLICY_ID,
    milestone,
    p0GatePassed: input.evaluation.p0GatePassed,
    tier2GatePassed: input.evaluation.tier2GatePassed,
    p0ProofStatus: input.evaluation.p0ProofStatus,
    tier2ProofStatus: input.evaluation.tier2ProofStatus,
    envPresentCount: input.evaluation.present.length,
    envTotalCount: input.evaluation.present.length + input.evaluation.missing.length,
    artifactPresent: input.artifactPresent,
    nextPhaseId: nextPhase?.id ?? null,
    nextPhaseLabel: nextPhase?.label ?? null,
    recommendedCommands,
  };
}

export function buildTier2GoldenPathReadinessChecklistMarkdown(input: {
  summary: Tier2GoldenPathPostP0OrchestratorSummary;
  evaluation: ReturnType<typeof evaluateTier2GoldenPathEnv>;
}): string {
  const lines: string[] = [
    "# Tier 2 Golden Path — Readiness Checklist",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Honest ops only** — checklist reflects P0 gate + Tier 2 artifact + env state.",
    "",
    `Policy: \`${TIER2_GOLDEN_PATH_POST_P0_ORCHESTRATOR_ERA21_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- P0 gate: ${input.summary.p0GatePassed ? "PASS" : "BLOCKED"} (\`${input.summary.p0ProofStatus ?? "missing"}\`)`,
    `- Tier 2 artifact: \`${input.summary.tier2ProofStatus ?? "missing"}\``,
    `- Env vars in shell: ${input.summary.envPresentCount}/${input.summary.envTotalCount}`,
    `- Next phase: ${input.summary.nextPhaseLabel ?? "none"}`,
    "",
    "## Phase checklist",
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
  lines.push("## Manual sign-off env vars");
  lines.push("");
  if (input.evaluation.missing.length === 0) {
    lines.push("All tracked env vars present in local shell.");
  } else {
    for (const key of input.evaluation.missing) {
      lines.push(`- [ ] \`${key}\``);
    }
  }

  lines.push("");
  lines.push("## Product verification (after P0 PASS)");
  lines.push("");
  lines.push("- [ ] `/dashboard/integration-health` — Tier 2 golden path banner");
  lines.push("- [ ] `/dashboard/today` — Tier 2 top action (priority 1)");
  lines.push("- [ ] `/dashboard/launch-wizard` — Tier 2 panel + commercial blockers");
  lines.push("- [ ] `/platform/commercial-pilot-ops` — Tier 2 phases panel");
  lines.push("");
  lines.push("## Ops commands");
  lines.push("");
  lines.push("```bash");
  for (const command of input.summary.recommendedCommands) {
    lines.push(command);
  }
  lines.push("```");
  lines.push("");
  lines.push(`Artifact: \`${TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT}\``);
  lines.push(`Playbook: [\`${TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC}\`](../${TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC})`);
  lines.push(`Step 2 doc: [\`${TIER2_GOLDEN_PATH_ERA21_STEP2_DOC}\`](../${TIER2_GOLDEN_PATH_ERA21_STEP2_DOC})`);
  lines.push("");

  return lines.join("\n");
}
