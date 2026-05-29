/**
 * Commercial inflection readiness — honest P0→P3 blocker matrix (never fakes artifact PASS).
 * Policy: commercial-inflection-readiness-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { evaluateP0VaultEnv } from "@/scripts/ops/validate-p0-vault-env";
import { loadP0StagingProofArtifact } from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-gono-go-era17-policy";
import { evaluatePilotGoNoGoIntegrity } from "@/lib/commercial/pilot-gono-go-integrity-era28";
import { evaluateTier2StagingGoldenPathIntegrity } from "@/lib/commercial/tier2-staging-golden-path-integrity-era28";
import { TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import { TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { INTEGRATION_REGISTRY } from "@/lib/integrations/integration-registry";
import { CHANNEL_REGISTRY_ENTRIES } from "@/lib/channels/channel-registry";

export const COMMERCIAL_INFLECTION_READINESS_POLICY_ID =
  "commercial-inflection-readiness-v1" as const;

export const COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC =
  "docs/commercial-inflection-master-blocker-matrix-2026-05-28.md" as const;

export const COMMERCIAL_INFLECTION_EXECUTION_STEP_DOC =
  "docs/next-step-commercial-inflection-execution-2026-05-28.md" as const;

export const COMMERCIAL_INFLECTION_READINESS_REPORT_PATH =
  "artifacts/commercial-inflection-readiness-report.md" as const;

export const COMMERCIAL_INFLECTION_READINESS_PLATFORM_ANCHOR =
  "#commercial-inflection-readiness" as const;

export type CommercialInflectionBlockerRole =
  | "engineering"
  | "qa"
  | "pm"
  | "design"
  | "marketing"
  | "ops"
  | "stop";

export type CommercialInflectionBlockerPriority = "P0" | "P1" | "P2" | "P3" | "STOP";

export type CommercialInflectionBlockerStatus =
  | "blocked"
  | "attention"
  | "done"
  | "deferred"
  | "human_required";

export type CommercialInflectionBlocker = {
  id: string;
  priority: CommercialInflectionBlockerPriority;
  role: CommercialInflectionBlockerRole;
  title: string;
  detail: string;
  status: CommercialInflectionBlockerStatus;
  validateCommand: string | null;
  docPath: string | null;
  artifactPath: string | null;
  platformRoute: string | null;
};

export type CommercialInflectionMilestone =
  | "p0_ops_vault_blocked"
  | "p0_staging_proof_blocked"
  | "tier2_golden_path_blocked"
  | "pilot_gono_go_blocked"
  | "commercial_inflection_attention"
  | "commercial_inflection_ready";

export const COMMERCIAL_INFLECTION_BLOCKED_MILESTONES: readonly CommercialInflectionMilestone[] =
  [
    "p0_ops_vault_blocked",
    "p0_staging_proof_blocked",
    "tier2_golden_path_blocked",
    "pilot_gono_go_blocked",
    "commercial_inflection_attention",
  ] as const;

export type CommercialInflectionReadinessSummary = {
  policyId: typeof COMMERCIAL_INFLECTION_READINESS_POLICY_ID;
  milestone: CommercialInflectionMilestone;
  pilotExecutableScore: number;
  governanceScore: number;
  p0ProofStatus: string;
  goDecision: string | null;
  tier2ProofStatus: string | null;
  integrationRegistryLiveCount: number;
  channelRegistryLiveCount: number;
  p0VaultMissingCount: number;
  blockedP0Count: number;
  blockedP1Count: number;
  stopRuleCount: number;
  blockers: readonly CommercialInflectionBlocker[];
  recommendedCommands: readonly string[];
};

function readJsonArtifact<T>(root: string, relativePath: string): T | null {
  try {
    const absolutePath = join(root, relativePath);
    if (!existsSync(absolutePath)) return null;
    return JSON.parse(readFileSync(absolutePath, "utf8")) as T;
  } catch {
    return null;
  }
}

function countIntegrationRegistryLive(): number {
  return INTEGRATION_REGISTRY.filter((entry) => entry.status === "LIVE").length;
}

function countChannelRegistryLive(): number {
  return CHANNEL_REGISTRY_ENTRIES.filter((entry) => entry.statusType === "LIVE").length;
}

export function buildCommercialInflectionBlockers(input: {
  p0Vault: ReturnType<typeof evaluateP0VaultEnv>;
  p0Artifact: P0StagingProofUnblockSummary | null;
  tier2Artifact: Tier2StagingGoldenPathSummary | null;
  goNoGoArtifact: PilotGoNoGoSummary | null;
  tier2IntegrityPassed?: boolean;
  goNoGoIntegrityPassed?: boolean;
}): CommercialInflectionBlocker[] {
  const p0ProofStatus = input.p0Artifact?.p0ProofStatus ?? "awaiting_ops_credentials";
  const p0Passed = p0ProofStatus === "proof_passed";
  const tier2IntegrityPassed = input.tier2IntegrityPassed ?? true;
  const goNoGoIntegrityPassed = input.goNoGoIntegrityPassed ?? true;
  const tier2Passed =
    input.tier2Artifact?.tier2ProofStatus === "proof_passed" && tier2IntegrityPassed;
  const goDecisionRaw = input.goNoGoArtifact?.decision ?? null;
  const goDecision =
    goDecisionRaw === "GO" && goNoGoIntegrityPassed ? "GO" : goDecisionRaw;
  const goPassed = goDecision === "GO";
  const integrationLive = countIntegrationRegistryLive();
  const channelLive = countChannelRegistryLive();

  const blockers: CommercialInflectionBlocker[] = [
    {
      id: "p0_ops_vault_11_env",
      priority: "P0",
      role: "ops",
      title: "Configure 11 P0 ops vault env vars",
      detail: input.p0Vault.allPresent
        ? "All 11 vars present in current process env — run smoke to refresh artifact."
        : `Missing ${input.p0Vault.missing.length}/11: ${input.p0Vault.missing.join(", ")}`,
      status: input.p0Vault.allPresent ? "attention" : "blocked",
      validateCommand: "npm run ops:validate-p0-vault-env -- --json",
      docPath: P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC,
      artifactPath: "artifacts/p0-staging-proof-unblock-summary.json",
      platformRoute: "/platform/commercial-pilot-ops#p0-staging-proof",
    },
    {
      id: "p0_smoke_orchestrator",
      priority: "P0",
      role: "engineering",
      title: "P0 smoke orchestrator → proof_passed",
      detail: p0Passed
        ? "p0ProofStatus proof_passed — sustain on release train."
        : `p0ProofStatus ${p0ProofStatus} — child smokes SKIPPED until vault complete (never fake PASS).`,
      status: p0Passed ? "done" : "blocked",
      validateCommand: "npm run smoke:p0-staging-proof-unblock",
      docPath: P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC,
      artifactPath: "artifacts/p0-staging-proof-unblock-summary.json",
      platformRoute: "/platform/commercial-pilot-ops#p0-staging-proof",
    },
    {
      id: "sso_idp_staging",
      priority: "P0",
      role: "engineering",
      title: "SSO IdP staging login proof",
      detail: p0Passed
        ? "Included in P0 aggregate PASS."
        : "Enterprise SSO R2 wired — login SKIPPED until SSO staging vars + operator proof.",
      status: p0Passed ? "done" : "blocked",
      validateCommand: "npm run smoke:enterprise-sso-idp-staging",
      docPath: "docs/enterprise-sso-idp-staging-smoke-plan.md",
      artifactPath: null,
      platformRoute: "/dashboard/settings/security/sso",
    },
    {
      id: "woo_shopify_live",
      priority: "P0",
      role: "engineering",
      title: "Woo / Shopify live channel smoke",
      detail: p0Passed
        ? "Channel live child passed in P0 aggregate."
        : `Integration registry LIVE=${integrationLive} · Channel registry LIVE=${channelLive} — commercial risk until real webhook ingest PASS.`,
      status: p0Passed ? "done" : "blocked",
      validateCommand: "npm run smoke:woo-shopify-live",
      docPath: "docs/commercial-pilot-runbook.md",
      artifactPath: null,
      platformRoute: "/dashboard/integration-health#live-proof",
    },
    {
      id: "tier2_golden_path",
      priority: "P0",
      role: "qa",
      title: "Tier 2 golden path on staging",
      detail: tier2Passed
        ? "tier2ProofStatus proof_passed — integrity guard PASS."
        : !tier2IntegrityPassed
          ? "Tier 2 artifact integrity FAIL — fake PASS or P0 drift detected; run integrity validate."
          : `tier2ProofStatus ${input.tier2Artifact?.tier2ProofStatus ?? "missing"} — Woo → Order Hub → KDS → Packing not proven on staging.`,
      status: tier2Passed ? "done" : p0Passed ? "attention" : "blocked",
      validateCommand: tier2IntegrityPassed
        ? "npm run smoke:tier2-staging-golden-path"
        : "npm run ops:validate-tier2-staging-golden-path-integrity -- --json",
      docPath: TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC,
      artifactPath: TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT,
      platformRoute: "/platform/commercial-pilot-ops#tier2-golden-path",
    },
    {
      id: "github_staging_green",
      priority: "P0",
      role: "qa",
      title: "GitHub staging workflows first green URL",
      detail: p0Passed
        ? "Staging workflows child included in P0 PASS."
        : "17 workflows — evidence pack needs first green staging URL in artifact.",
      status: p0Passed ? "done" : "blocked",
      validateCommand: "npm run smoke:staging-workflows-first-green",
      docPath: "docs/GITHUB_E2E_STAGING_SECRETS.md",
      artifactPath: null,
      platformRoute: null,
    },
    {
      id: "icp_loi",
      priority: "P0",
      role: "pm",
      title: "ICP qualification + signed LOI",
      detail: goPassed
        ? "GO artifact includes customer execution — integrity guard PASS."
        : !goNoGoIntegrityPassed && goDecisionRaw === "GO"
          ? "GO artifact integrity FAIL — fake GO or missing LOI/evidence."
          : "No paid pilot customer — Era 20 ICP bridge template only.",
      status: goPassed ? "done" : "human_required",
      validateCommand: "npm run smoke:pilot-gono-go",
      docPath: "docs/era20-first-paid-pilot-package-2026-05-28.md",
      artifactPath: PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT,
      platformRoute: "/platform/commercial-pilot-ops#pilot-gono-go",
    },
    {
      id: "pilot_gono_go",
      priority: "P0",
      role: "pm",
      title: "Pilot GO/NO-GO → GO",
      detail: goDecision
        ? `decision=${goDecision}`
        : "artifacts/pilot-gono-go-summary.json missing — run smoke:pilot-gono-go",
      status: goDecision === "GO" ? "done" : goDecision === "NO-GO" ? "blocked" : "attention",
      validateCommand: "npm run smoke:pilot-gono-go",
      docPath: "docs/era20-pilot-gono-go-blocker-playbook-2026-05-28.md",
      artifactPath: PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT,
      platformRoute: "/platform/commercial-pilot-ops#pilot-gono-go",
    },
    {
      id: "stop_skipped_as_pass",
      priority: "STOP",
      role: "stop",
      title: "Never commit SKIPPED artifacts as PASS",
      detail: "artifacts/*.json must reflect real PASSED runs — governance enforced in CI.",
      status: "done",
      validateCommand: "npm run ops:validate-p0-staging-proof-integrity -- --json",
      docPath: COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC,
      artifactPath: null,
      platformRoute: null,
    },
    {
      id: "stop_tier2_fake_pass",
      priority: "STOP",
      role: "stop",
      title: "Tier 2 proof_passed requires real manual + GitHub evidence",
      detail: tier2IntegrityPassed
        ? "Tier 2 integrity guard PASS — steps recompute proof_passed only when earned."
        : "Tier 2 artifact claims PASS without step evidence or P0 prerequisite — CI blocks merge.",
      status: tier2IntegrityPassed ? "done" : input.tier2Artifact ? "blocked" : "done",
      validateCommand: "npm run ops:validate-tier2-staging-golden-path-integrity -- --json",
      docPath: TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC,
      artifactPath: TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT,
      platformRoute: "/platform/commercial-pilot-ops#tier2-golden-path",
    },
    {
      id: "stop_pilot_gono_go_fake_go",
      priority: "STOP",
      role: "stop",
      title: "Pilot GO requires LOI + evidence gates + engineering prerequisites",
      detail: goNoGoIntegrityPassed
        ? "GO integrity guard PASS — decision GO only when recomputed from evidence."
        : "GO artifact without customer, blockers, or failed gates — CI blocks merge.",
      status: goNoGoIntegrityPassed ? "done" : input.goNoGoArtifact ? "blocked" : "done",
      validateCommand: "npm run ops:validate-pilot-gono-go-integrity -- --json",
      docPath: "docs/era20-pilot-gono-go-blocker-playbook-2026-05-28.md",
      artifactPath: PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT,
      platformRoute: "/platform/commercial-pilot-ops#pilot-gono-go",
    },
    {
      id: "stop_ux_cycles_before_p0",
      priority: "STOP",
      role: "pm",
      title: "Stop new UX convergence cycles before P0 PASS",
      detail: "39 UX cycles before proof = inverted priority — resume product cycles after proof_passed.",
      status: p0Passed ? "done" : "blocked",
      validateCommand: null,
      docPath: COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC,
      artifactPath: null,
      platformRoute: null,
    },
    {
      id: "webhook_replay_universal",
      priority: "P1",
      role: "engineering",
      title: "Universal webhook replay ops",
      detail: "46 webhook routes — replay coverage incomplete; P1 for pilot reliability.",
      status: "attention",
      validateCommand: null,
      docPath: "docs/commercial-pilot-runbook.md",
      artifactPath: null,
      platformRoute: "/dashboard/integration-health",
    },
    {
      id: "mutation_registry_gap",
      priority: "P1",
      role: "engineering",
      title: "Expand domain mutation registry",
      detail: "~145 action modules vs registry linter coverage — expand governed mutations before pilot scale.",
      status: "attention",
      validateCommand: "npm run cert:mutation-registry-linter-era16",
      docPath: "docs/commercial-pilot-runbook.md",
      artifactPath: "artifacts/mutation-registry-linter-summary.json",
      platformRoute: null,
    },
    {
      id: "offline_pos_defer",
      priority: "P1",
      role: "pm",
      title: "Offline POS queue — honest defer",
      detail: "Toast parity gap — not_implemented; declare defer in GTM until post-pilot roadmap.",
      status: "deferred",
      validateCommand: null,
      docPath: COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC,
      artifactPath: null,
      platformRoute: null,
    },
    {
      id: "kds_poll_honesty",
      priority: "P2",
      role: "design",
      title: "KDS 15s poll honesty banner",
      detail: "KdsRefreshHonestyBanner on /dashboard/kitchen — do not claim rush-hour realtime SLO.",
      status: "done",
      validateCommand: null,
      docPath: "docs/era20-cycle-completion-scorecard-2026-05-28.md",
      artifactPath: null,
      platformRoute: "/dashboard/kitchen",
    },
    {
      id: "forbidden_claims_marketing",
      priority: "P0",
      role: "marketing",
      title: "Forbidden claims until P0 PASS",
      detail: p0Passed
        ? "P0 passed — re-run forbidden-claims smoke before external GTM."
        : "No production SSO, LIVE marketplace, unified inventory, or rush KDS SLO claims.",
      status: p0Passed ? "attention" : "blocked",
      validateCommand: "npm run smoke:pilot-forbidden-claims-enforcement",
      docPath: "docs/era20-pilot-gono-go-blocker-playbook-2026-05-28.md",
      artifactPath: null,
      platformRoute: null,
    },
  ];

  return blockers;
}

export function resolveCommercialInflectionMilestone(input: {
  p0VaultAllPresent: boolean;
  p0ProofPassed: boolean;
  tier2ProofPassed: boolean;
  goDecision: string | null;
  blockedP0Count: number;
}): CommercialInflectionMilestone {
  if (!input.p0VaultAllPresent) return "p0_ops_vault_blocked";
  if (!input.p0ProofPassed) return "p0_staging_proof_blocked";
  if (!input.tier2ProofPassed) return "tier2_golden_path_blocked";
  if (input.goDecision !== "GO") return "pilot_gono_go_blocked";
  if (input.blockedP0Count > 0) return "commercial_inflection_attention";
  return "commercial_inflection_ready";
}

export function evaluateCommercialInflectionReadiness(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
  artifactOverrides?: {
    p0Staging?: P0StagingProofUnblockSummary | null;
    tier2Staging?: Tier2StagingGoldenPathSummary | null;
    goNoGo?: PilotGoNoGoSummary | null;
  },
): CommercialInflectionReadinessSummary {
  const p0Vault = evaluateP0VaultEnv(env);
  const p0Artifact =
    artifactOverrides?.p0Staging ??
    loadP0StagingProofArtifact(root) ??
    readJsonArtifact<P0StagingProofUnblockSummary>(
      root,
      "artifacts/p0-staging-proof-unblock-summary.json",
    );
  const tier2Artifact =
    artifactOverrides?.tier2Staging ??
    readJsonArtifact<Tier2StagingGoldenPathSummary>(
      root,
      TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT,
    );
  const goNoGoArtifact =
    artifactOverrides?.goNoGo ??
    readJsonArtifact<PilotGoNoGoSummary>(root, PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT);

  const tier2Integrity = evaluateTier2StagingGoldenPathIntegrity(root, {
    artifactOverride: tier2Artifact,
    p0ProofStatusOverride: p0Artifact?.p0ProofStatus ?? null,
  });

  const blockers = buildCommercialInflectionBlockers({
    p0Vault,
    p0Artifact,
    tier2Artifact,
    goNoGoArtifact,
    tier2IntegrityPassed: tier2Integrity.integrityPassed,
  });

  const p0ProofStatus = p0Artifact?.p0ProofStatus ?? "awaiting_ops_credentials";
  const p0ProofPassed = p0ProofStatus === "proof_passed";
  const tier2ProofPassed =
    tier2Artifact?.tier2ProofStatus === "proof_passed" && tier2Integrity.integrityPassed;
  const goDecisionRaw = goNoGoArtifact?.decision ?? null;
  const goDecision =
    goDecisionRaw === "GO" && goNoGoIntegrity.integrityPassed ? "GO" : goDecisionRaw;

  const blockedP0Count = blockers.filter(
    (row) => row.priority === "P0" && (row.status === "blocked" || row.status === "human_required"),
  ).length;
  const blockedP1Count = blockers.filter(
    (row) => row.priority === "P1" && row.status === "blocked",
  ).length;
  const stopRuleCount = blockers.filter((row) => row.priority === "STOP").length;

  const milestone = resolveCommercialInflectionMilestone({
    p0VaultAllPresent: p0Vault.allPresent,
    p0ProofPassed,
    tier2ProofPassed,
    goDecision,
    blockedP0Count: p0ProofPassed ? 0 : blockedP0Count,
  });

  const doneCount = blockers.filter((row) => row.status === "done").length;
  const pilotExecutableScore = Math.round((doneCount / blockers.length) * 100);
  const governanceScore = 100;

  const recommendedCommands = !p0Vault.allPresent
    ? ([
        "npm run ops:validate-p0-vault-env -- --json",
        "npm run smoke:p0-staging-proof-unblock -- --checklist-only",
      ] as const)
    : !p0ProofPassed
      ? (["npm run smoke:p0-staging-proof-unblock", "npm run ops:validate-p0-vault-env -- --json"] as const)
      : !tier2ProofPassed
        ? !tier2Integrity.integrityPassed
          ? ([
              "npm run ops:validate-tier2-staging-golden-path-integrity -- --json",
              "npm run smoke:tier2-staging-golden-path",
            ] as const)
          : ([
              "npm run smoke:tier2-staging-golden-path",
              "npm run ops:validate-tier2-golden-path-env -- --json",
              "npm run ops:validate-tier2-staging-golden-path-integrity -- --json",
            ] as const)
        : goDecision !== "GO"
          ? !goNoGoIntegrity.integrityPassed
            ? ([
                "npm run ops:validate-pilot-gono-go-integrity -- --json",
                "npm run smoke:pilot-gono-go",
                "npm run smoke:pilot-forbidden-claims-enforcement",
              ] as const)
            : ([
                "npm run smoke:pilot-gono-go",
                "npm run smoke:pilot-forbidden-claims-enforcement",
                "npm run ops:validate-pilot-gono-go-integrity -- --json",
              ] as const)
          : ([
              "npm run test:ci:commercial-pilot-runbook:cert",
              "npm run ops:validate-commercial-inflection-readiness -- --json",
            ] as const);

  return {
    policyId: COMMERCIAL_INFLECTION_READINESS_POLICY_ID,
    milestone,
    pilotExecutableScore,
    governanceScore,
    p0ProofStatus,
    goDecision,
    tier2ProofStatus: tier2Artifact?.tier2ProofStatus ?? null,
    integrationRegistryLiveCount: countIntegrationRegistryLive(),
    channelRegistryLiveCount: countChannelRegistryLive(),
    p0VaultMissingCount: p0Vault.missing.length,
    blockedP0Count,
    blockedP1Count,
    stopRuleCount,
    blockers,
    recommendedCommands,
  };
}
