/**
 * Launch Wizard — Tier 2 staging golden path status slice.
 */
import { TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import { buildTier2GoldenPathUiSlice, type Tier2GoldenPathUiSlice } from "@/lib/commercial/tier2-staging-golden-path-ui-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const LAUNCH_WIZARD_TIER2_STATUS_ERA21_POLICY_ID =
  "era21-launch-wizard-tier2-status-v1" as const;

export type LaunchWizardTier2StatusRow = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED" | "BLOCKED";
  detail: string;
};

export type LaunchWizardTier2StatusSlice = {
  policyId: typeof LAUNCH_WIZARD_TIER2_STATUS_ERA21_POLICY_ID;
  artifactPresent: boolean;
  tier2ProofStatus: string | null;
  overall: string | null;
  p0ProofStatus: string | null;
  headline: string;
  playbookDoc: string;
  orchestratorCommand: string;
  rows: LaunchWizardTier2StatusRow[];
  blockedOnP0: boolean;
  goldenPathUi: Tier2GoldenPathUiSlice | null;
};

export function buildLaunchWizardTier2StatusSlice(input: {
  tier2Summary: Tier2StagingGoldenPathSummary | null;
  p0ProofStatus: string | null;
}): LaunchWizardTier2StatusSlice {
  const { tier2Summary, p0ProofStatus } = input;
  const blockedOnP0 = p0ProofStatus !== "proof_passed";
  const artifactPresent = tier2Summary !== null;

  const rows: LaunchWizardTier2StatusRow[] = [];

  rows.push({
    id: "p0_gate",
    label: "P0 staging proof",
    status: blockedOnP0 ? "BLOCKED" : "PASSED",
    detail: blockedOnP0
      ? `p0ProofStatus=${p0ProofStatus ?? "unknown"} — configure 11 ops env vars first`
      : "proof_passed — Tier 2 execution unlocked",
  });

  if (tier2Summary) {
    for (const step of tier2Summary.steps) {
      rows.push({
        id: step.id,
        label: step.label,
        status: step.status,
        detail: step.reason,
      });
    }
  } else {
    rows.push({
      id: "tier2_orchestrator",
      label: "Tier 2 orchestrator",
      status: "SKIPPED",
      detail: "Run npm run smoke:tier2-staging-golden-path after P0 PASS",
    });
  }

  let headline =
    "Tier 2 golden path (Woo → Order Hub → KDS → Packing) awaits P0 proof_passed.";
  if (!blockedOnP0 && tier2Summary?.tier2ProofStatus === "proof_passed") {
    headline = "Tier 2 staging golden path proof_passed — eligible for pilot GO review.";
  } else if (!blockedOnP0 && tier2Summary?.tier2ProofStatus === "awaiting_manual_phases") {
    headline =
      "P0 passed — complete manual phases on staging and record TIER2_* env vars + GitHub KDS URL.";
  } else if (!blockedOnP0) {
    headline = "P0 passed — run Tier 2 orchestrator and execute staging checklist.";
  }

  return {
    policyId: LAUNCH_WIZARD_TIER2_STATUS_ERA21_POLICY_ID,
    artifactPresent,
    tier2ProofStatus: tier2Summary?.tier2ProofStatus ?? null,
    overall: tier2Summary?.overall ?? null,
    p0ProofStatus,
    headline,
    playbookDoc: TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC,
    orchestratorCommand: "npm run smoke:tier2-staging-golden-path",
    rows,
    blockedOnP0,
    goldenPathUi: buildTier2GoldenPathUiSlice({
      p0ProofStatus,
      tier2Summary,
    }),
  };
}
