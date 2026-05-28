/**
 * P0 ops vault Day 0 orchestrator — milestones, staging health, honest readiness.
 * Policy: era21-p0-ops-vault-day0-orchestrator-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import {
  buildP0OpsVaultPhaseStatuses,
  resolveNextIncompleteP0OpsVaultPhase,
} from "@/lib/commercial/p0-ops-vault-phases-era21";
import type { evaluateP0VaultEnv } from "@/scripts/ops/validate-p0-vault-env";

export const P0_OPS_VAULT_ERA21_DAY0_DOC =
  "docs/next-step-1-ops-vault-day0-execution-2026-05-28.md" as const;

export const P0_OPS_VAULT_DAY0_ORCHESTRATOR_ERA21_POLICY_ID =
  "era21-p0-ops-vault-day0-orchestrator-v1" as const;

export const P0_OPS_VAULT_DAY0_PARTIAL_VAR_COUNT = 5 as const;

export const P0_OPS_VAULT_DAY0_READINESS_CHECKLIST_PATH =
  "docs/p0-ops-vault-day0-readiness-checklist.md" as const;

export const P0_OPS_VAULT_DAY0_ORCHESTRATOR_COMMAND =
  "npm run ops:run-p0-vault-day0-orchestrator" as const;

export const P0_OPS_VAULT_STAGING_HEALTH_COMMAND =
  "npm run ops:check-p0-staging-health" as const;

export const P0_OPS_VAULT_DAY0_READINESS_EXPORT_COMMAND =
  "npm run ops:export-p0-vault-day0-readiness-checklist -- --write" as const;

export type P0VaultDay0Milestone =
  | "blocked"
  | "phase1_complete"
  | "day0_partial"
  | "phase3_in_progress"
  | "env_complete"
  | "proof_passed";

export type P0StagingHealthResult = {
  checked: boolean;
  ok: boolean;
  url: string | null;
  statusCode: number | null;
  error: string | null;
};

export type P0VaultDay0OrchestratorSummary = {
  policyId: typeof P0_OPS_VAULT_DAY0_ORCHESTRATOR_ERA21_POLICY_ID;
  milestone: P0VaultDay0Milestone;
  day0PartialComplete: boolean;
  envPresentCount: number;
  envTotalCount: number;
  artifactPresent: boolean;
  p0ProofStatus: string | null;
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  stagingHealth: P0StagingHealthResult;
  recommendedCommands: readonly string[];
};

function normalizeStagingBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, "");
}

export function resolveP0VaultDay0MilestoneFromPhaseStatuses(
  phases: readonly { id: string; complete: boolean }[],
  p0ProofStatus?: string | null,
): P0VaultDay0Milestone {
  const phase1 = phases.find((phase) => phase.id === "staging_login");
  const phase2 = phases.find((phase) => phase.id === "database_encryption");
  const phase3 = phases.find((phase) => phase.id === "channel_live");
  const phase4 = phases.find((phase) => phase.id === "sso_idp");
  const completeCount = phases.filter((phase) => phase.complete).length;

  if (p0ProofStatus === "proof_passed") return "proof_passed";
  if (phases.every((phase) => phase.complete)) return "env_complete";
  if (phase1?.complete && phase2?.complete) {
    if (phase3?.complete && phase4?.complete) return "env_complete";
    if (phase3?.complete || completeCount > 2) return "phase3_in_progress";
    return "day0_partial";
  }
  if (phase1?.complete) return "phase1_complete";
  return "blocked";
}

export function resolveP0VaultDay0Milestone(input: {
  env: Pick<ReturnType<typeof evaluateP0VaultEnv>, "allPresent" | "present" | "phases">;
  p0ProofStatus?: string | null;
}): P0VaultDay0Milestone {
  if (input.p0ProofStatus === "proof_passed") return "proof_passed";
  if (input.env.allPresent) return "env_complete";

  const phase1 = input.env.phases.find((phase) => phase.id === "staging_login");
  const phase2 = input.env.phases.find((phase) => phase.id === "database_encryption");
  const phase3 = input.env.phases.find((phase) => phase.id === "channel_live");
  const phase4 = input.env.phases.find((phase) => phase.id === "sso_idp");

  if (phase1?.complete && phase2?.complete) {
    if (phase3?.complete && phase4?.complete) return "env_complete";
    if (phase3?.complete || (phase3 && !phase3.complete && input.env.present.length > 5)) {
      return "phase3_in_progress";
    }
    return "day0_partial";
  }

  if (phase1?.complete) return "phase1_complete";
  return "blocked";
}

export function isP0VaultDay0PartialComplete(
  env: Pick<ReturnType<typeof evaluateP0VaultEnv>, "phases">,
): boolean {
  const phase1 = env.phases.find((phase) => phase.id === "staging_login");
  const phase2 = env.phases.find((phase) => phase.id === "database_encryption");
  return Boolean(phase1?.complete && phase2?.complete);
}

export async function checkP0StagingHealth(
  baseUrl: string | undefined,
  options: { timeoutMs?: number } = {},
): Promise<P0StagingHealthResult> {
  if (!baseUrl?.trim()) {
    return {
      checked: false,
      ok: false,
      url: null,
      statusCode: null,
      error: "E2E_STAGING_BASE_URL not set",
    };
  }

  const normalized = normalizeStagingBaseUrl(baseUrl);
  const healthUrl = `${normalized}/api/health`;
  const timeoutMs = options.timeoutMs ?? 10_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(healthUrl, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    return {
      checked: true,
      ok: response.ok,
      url: healthUrl,
      statusCode: response.status,
      error: response.ok ? null : `HTTP ${response.status}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      checked: true,
      ok: false,
      url: healthUrl,
      statusCode: null,
      error: message,
    };
  } finally {
    clearTimeout(timer);
  }
}

export function loadP0StagingProofArtifact(
  root: string = process.cwd(),
): {
  p0ProofStatus?: string;
  overall?: string;
  allMissingEnvVars?: string[];
} | null {
  const path = join(root, P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as {
    p0ProofStatus?: string;
    overall?: string;
    allMissingEnvVars?: string[];
  };
}

export function buildP0VaultDay0OrchestratorSummary(input: {
  env: ReturnType<typeof evaluateP0VaultEnv>;
  artifact: ReturnType<typeof loadP0StagingProofArtifact>;
  stagingHealth: P0StagingHealthResult;
}): P0VaultDay0OrchestratorSummary {
  const milestone = resolveP0VaultDay0Milestone({
    env: input.env,
    p0ProofStatus: input.artifact?.p0ProofStatus,
  });
  const phases = buildP0OpsVaultPhaseStatuses({
    missingEnvVars: input.env.missing,
  });
  const nextPhase = resolveNextIncompleteP0OpsVaultPhase(phases);

  const recommendedCommands = [
    "npm run ops:export-p0-vault-env-template -- --write",
    "npm run ops:validate-p0-vault-env -- --json",
    P0_OPS_VAULT_STAGING_HEALTH_COMMAND,
    "npm run ops:sync-p0-vault-progress-report -- --write",
    P0_OPS_VAULT_DAY0_READINESS_EXPORT_COMMAND,
    "npm run ops:print-p0-github-secrets-checklist",
    "npm run smoke:p0-staging-proof-unblock -- --checklist-only",
  ] as const;

  return {
    policyId: P0_OPS_VAULT_DAY0_ORCHESTRATOR_ERA21_POLICY_ID,
    milestone,
    day0PartialComplete: isP0VaultDay0PartialComplete(input.env),
    envPresentCount: input.env.present.length,
    envTotalCount: input.env.present.length + input.env.missing.length,
    artifactPresent: input.artifact !== null,
    p0ProofStatus: input.artifact?.p0ProofStatus ?? null,
    nextPhaseId: nextPhase?.id ?? null,
    nextPhaseLabel: nextPhase?.label ?? null,
    stagingHealth: input.stagingHealth,
    recommendedCommands,
  };
}

export function buildP0VaultDay0ReadinessChecklistMarkdown(input: {
  summary: P0VaultDay0OrchestratorSummary;
  env: ReturnType<typeof evaluateP0VaultEnv>;
}): string {
  const lines: string[] = [
    "# P0 Ops Vault — Day 0 Readiness Checklist",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Honest ops only** — checklist reflects env + artifact state, never hand-edited PASS.",
    "",
    `Policy: \`${P0_OPS_VAULT_DAY0_ORCHESTRATOR_ERA21_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Day 0 partial (Phase 1+2): ${input.summary.day0PartialComplete ? "yes (5/11 target)" : "no"}`,
    `- Env vars present: ${input.summary.envPresentCount}/${input.summary.envTotalCount}`,
    `- Artifact: ${input.summary.artifactPresent ? "present" : "missing"}`,
    `- p0ProofStatus: ${input.summary.p0ProofStatus ?? "n/a"}`,
    "",
    "## Staging health",
    "",
  ];

  if (!input.summary.stagingHealth.checked) {
    lines.push("- [ ] Set `E2E_STAGING_BASE_URL` and run staging health check");
  } else {
    lines.push(
      `- [${input.summary.stagingHealth.ok ? "x" : " "}] \`${input.summary.stagingHealth.url}\` — ${
        input.summary.stagingHealth.ok
          ? "OK"
          : input.summary.stagingHealth.error ?? "failed"
      }`,
    );
  }

  lines.push("");
  lines.push("## Phase checklist (11 vars)");
  lines.push("");

  for (const phase of input.env.phases) {
    lines.push(`- [${phase.complete ? "x" : " "}] **${phase.label}**`);
    if (phase.missing.length > 0) {
      for (const key of phase.missing) {
        lines.push(`  - [ ] \`${key}\``);
      }
    }
  }

  lines.push("");
  lines.push("## Day 0 execution steps");
  lines.push("");
  lines.push("- [ ] Deploy `main` to staging");
  lines.push("- [ ] Phase 1 GitHub Secrets (E2E login trio)");
  lines.push("- [ ] Phase 2 GitHub Secrets (`DATABASE_URL`, `ENCRYPTION_KEY` matching Vercel)");
  lines.push("- [ ] Phase 3 channel tenant (`CHANNEL_SMOKE_OWNER_EMAIL` + DB creds)");
  lines.push("- [ ] Phase 4 SSO IdP (5 vars)");
  lines.push("- [ ] Full orchestrator smoke: `npm run smoke:p0-staging-proof-unblock`");
  lines.push("");
  lines.push("## Product verification");
  lines.push("");
  lines.push("- [ ] `/dashboard/integration-health` — P0 banner + phased panel");
  lines.push("- [ ] `/dashboard/today` — Owner Briefing top action `#1`");
  lines.push("- [ ] `/dashboard/launch-wizard` — Tier 2 blocked until `proof_passed`");
  lines.push("- [ ] `/platform/commercial-pilot-ops` — P0 phases panel");
  lines.push("");
  lines.push("## Ops commands");
  lines.push("");
  lines.push("```bash");
  for (const command of input.summary.recommendedCommands) {
    lines.push(command);
  }
  lines.push("```");
  lines.push("");
  lines.push(`Day 0 runbook: [\`${P0_OPS_VAULT_ERA21_DAY0_DOC}\`](../${P0_OPS_VAULT_ERA21_DAY0_DOC})`);
  lines.push("");

  return lines.join("\n");
}
