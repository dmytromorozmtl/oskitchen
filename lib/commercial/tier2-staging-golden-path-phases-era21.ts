/**
 * Tier 2 golden path phases — shared between CLI validation and product UI.
 */
import {
  TIER2_STAGING_GOLDEN_PATH_ERA20_CHILD_SMOKES,
  TIER2_STAGING_GOLDEN_PATH_ERA20_GITHUB_EVIDENCE_VARS,
  TIER2_STAGING_GOLDEN_PATH_ERA20_MANUAL_PHASES,
  TIER2_STAGING_GOLDEN_PATH_ERA20_OPERATOR_ENV_VARS,
  TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC,
} from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const TIER2_GOLDEN_PATH_PHASES_ERA21_POLICY_ID =
  "era21-tier2-golden-path-phases-v1" as const;

export type Tier2GoldenPathPhaseDef = {
  id: string;
  label: string;
  keys: readonly string[];
  routes: readonly string[];
  smokeScripts: readonly string[];
  docPath: string;
};

export const TIER2_GOLDEN_PATH_PHASES: readonly Tier2GoldenPathPhaseDef[] = [
  {
    id: "automated_child_smokes",
    label: "Phase 1 — Automated child smokes",
    keys: [],
    routes: [],
    smokeScripts: TIER2_STAGING_GOLDEN_PATH_ERA20_CHILD_SMOKES,
    docPath: TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC,
  },
  {
    id: "manual_fulfillment",
    label: "Phase 2 — Manual golden path (staging)",
    keys: TIER2_STAGING_GOLDEN_PATH_ERA20_MANUAL_PHASES.map((p) => p.manualEnvKey),
    routes: TIER2_STAGING_GOLDEN_PATH_ERA20_MANUAL_PHASES.map((p) => p.route),
    smokeScripts: [],
    docPath: TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC,
  },
  {
    id: "github_kds_evidence",
    label: "Phase 3 — GitHub KDS Playwright evidence",
    keys: TIER2_STAGING_GOLDEN_PATH_ERA20_GITHUB_EVIDENCE_VARS.filter(
      (k) => k.startsWith("GITHUB_KDS"),
    ),
    routes: [],
    smokeScripts: ["playwright-kds-staging"],
    docPath: TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC,
  },
  {
    id: "operator_metadata",
    label: "Phase 4 — Operator sign-off metadata",
    keys: TIER2_STAGING_GOLDEN_PATH_ERA20_OPERATOR_ENV_VARS.filter(
      (k) => k !== "PILOT_GOLDEN_PATH_DURATION_MINUTES",
    ),
    routes: ["/dashboard/launch-wizard"],
    smokeScripts: [],
    docPath: TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC,
  },
] as const;

export const TIER2_GOLDEN_PATH_MANUAL_ENV_KEYS =
  TIER2_STAGING_GOLDEN_PATH_ERA20_MANUAL_PHASES.map((p) => p.manualEnvKey);

export const TIER2_GOLDEN_PATH_ALL_TRACKED_ENV_KEYS = [
  ...TIER2_GOLDEN_PATH_MANUAL_ENV_KEYS,
  "GITHUB_KDS_STAGING_RUN_URL",
  "GITHUB_KDS_STAGING_RUN_OUTCOME",
  ...TIER2_STAGING_GOLDEN_PATH_ERA20_OPERATOR_ENV_VARS,
] as const;

export type Tier2GoldenPathPhaseStatus = {
  id: string;
  label: string;
  complete: boolean;
  presentKeys: string[];
  missingKeys: string[];
  routes: readonly string[];
  smokeScripts: readonly string[];
  docPath: string;
  detail: string;
};

function childSmokesComplete(summary: Tier2StagingGoldenPathSummary | null): boolean {
  if (!summary) return false;
  const childSteps = summary.steps.filter((s) => s.kind === "child_smoke");
  return childSteps.length > 0 && childSteps.every((s) => s.status === "PASSED");
}

function manualPhasesComplete(summary: Tier2StagingGoldenPathSummary | null): boolean {
  if (!summary) return false;
  const manualSteps = summary.steps.filter((s) => s.kind === "manual_phase");
  return manualSteps.length > 0 && manualSteps.every((s) => s.status === "PASSED");
}

function githubEvidenceComplete(summary: Tier2StagingGoldenPathSummary | null): boolean {
  if (!summary) return false;
  const step = summary.steps.find((s) => s.id === "github_kds_playwright");
  return step?.status === "PASSED";
}

function operatorMetadataComplete(env: NodeJS.ProcessEnv): boolean {
  return TIER2_GOLDEN_PATH_PHASES[3]!.keys.every((key) => Boolean(env[key]?.trim()));
}

export function buildTier2GoldenPathPhaseStatuses(input: {
  tier2Summary: Tier2StagingGoldenPathSummary | null;
  env?: NodeJS.ProcessEnv;
}): Tier2GoldenPathPhaseStatus[] {
  const env = input.env ?? process.env;
  const summary = input.tier2Summary;

  return TIER2_GOLDEN_PATH_PHASES.map((phase) => {
    let complete = false;
    let detail = "";

    if (phase.id === "automated_child_smokes") {
      complete = childSmokesComplete(summary);
      detail = complete
        ? "All child smokes PASSED in artifact"
        : "Run npm run smoke:tier2-staging-golden-path after P0 PASS";
    } else if (phase.id === "manual_fulfillment") {
      complete = manualPhasesComplete(summary);
      const missing = summary?.missingManualEnvVars ?? TIER2_GOLDEN_PATH_MANUAL_ENV_KEYS;
      detail = complete
        ? "Order Hub → KDS → Packing manual sign-off recorded"
        : `Set ${missing.join(", ")}=PASSED after staging execution`;
    } else if (phase.id === "github_kds_evidence") {
      complete = githubEvidenceComplete(summary);
      detail = complete
        ? "GitHub KDS staging run URL recorded"
        : "Set GITHUB_KDS_STAGING_RUN_URL + GITHUB_KDS_STAGING_RUN_OUTCOME=PASSED";
    } else {
      complete = operatorMetadataComplete(env);
      const missingKeys = phase.keys.filter((key) => !env[key]?.trim());
      detail = complete
        ? "Operator metadata env vars present"
        : `Missing: ${missingKeys.join(", ") || phase.keys.join(", ")}`;
    }

    const missingKeys =
      phase.keys.length > 0 ? phase.keys.filter((key) => !env[key]?.trim()) : [];
    const presentKeys = phase.keys.filter((key) => env[key]?.trim());

    return {
      id: phase.id,
      label: phase.label,
      complete,
      presentKeys: [...presentKeys],
      missingKeys: [...missingKeys],
      routes: phase.routes,
      smokeScripts: phase.smokeScripts,
      docPath: phase.docPath,
      detail,
    };
  });
}

export function resolveNextIncompleteTier2GoldenPathPhase(
  phases: readonly Tier2GoldenPathPhaseStatus[],
): Tier2GoldenPathPhaseStatus | null {
  return phases.find((phase) => !phase.complete) ?? null;
}

export function formatTier2GoldenPathPhaseBlockerDetail(
  phase: Tier2GoldenPathPhaseStatus,
): string {
  return `${phase.label}: ${phase.detail}`;
}
