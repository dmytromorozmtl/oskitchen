import {
  formatCommercialPilotOpsDecisionLabel,
  resolveCommercialPilotOpsDecision,
  type CommercialPilotOpsDecision,
  type CommercialPilotOpsStatusModel,
} from "@/lib/commercial/commercial-pilot-ops-status-era18";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  formatP0OpsVaultPhaseBlockerDetail,
} from "@/lib/commercial/p0-ops-vault-phases-era21";
import { buildP0OpsVaultUiSlice } from "@/lib/commercial/p0-ops-vault-ui-era21";
import type { PilotGoNoGoCustomerStatus } from "@/lib/commercial/pilot-gono-go-summary";
import {
  buildTier2GoldenPathPhaseStatuses,
  formatTier2GoldenPathPhaseBlockerDetail,
  resolveNextIncompleteTier2GoldenPathPhase,
} from "@/lib/commercial/tier2-staging-golden-path-phases-era21";
import { buildTier2GoldenPathUiSlice } from "@/lib/commercial/tier2-staging-golden-path-ui-era21";
import { INTEGRATION_HEALTH_RECOVERY_ANCHOR } from "@/lib/integrations/integration-health-recovery-era19-policy";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ERA19_POLICY_ID =
  "era19-launch-wizard-commercial-blockers-v1" as const;

export type LaunchWizardCommercialBlockerRow = {
  id: string;
  label: string;
  detail: string;
  tone: "urgent" | "normal";
  href: string;
};

export type LaunchWizardCommercialBlockersSlice = {
  decision: CommercialPilotOpsDecision;
  decisionLabel: string;
  artifactPresent: boolean;
  customerExecutionStatus: PilotGoNoGoCustomerStatus | null;
  blockers: LaunchWizardCommercialBlockerRow[];
  headline: string;
};

export function resolveLaunchWizardSsoProofBlocked(
  p0: P0StagingProofUnblockSummary | null | undefined,
): boolean {
  if (!p0) return false;
  return p0.children.ssoIdpStaging.proofStatus !== "proof_passed";
}

export function resolveLaunchWizardChannelLiveProofBlocked(
  p0: P0StagingProofUnblockSummary | null | undefined,
): boolean {
  if (!p0) return false;
  const proof = p0.children.channelLive.proofStatus;
  if (!proof) return true;
  if (proof.includes("proof_failed")) return true;
  return (
    proof !== "proof_passed/proof_passed" &&
    !(proof.includes("proof_passed") && !proof.includes("proof_skipped"))
  );
}

export function resolveLaunchWizardTier2ProofBlocked(
  commercialOps: CommercialPilotOpsStatusModel | null | undefined,
): boolean {
  const p0 = commercialOps?.p0Staging.summary;
  if (p0?.p0ProofStatus !== "proof_passed") return false;
  const tier2 = commercialOps?.tier2Staging.summary;
  if (!tier2) return true;
  return tier2.tier2ProofStatus !== "proof_passed";
}

export function buildLaunchWizardCommercialBlockersSlice(input: {
  commercialOps: CommercialPilotOpsStatusModel | null;
  p0Blocked: boolean;
  ssoProofBlocked: boolean;
  channelLiveProofBlocked: boolean;
}): LaunchWizardCommercialBlockersSlice {
  const decision = input.commercialOps
    ? resolveCommercialPilotOpsDecision(input.commercialOps.goNoGo)
    : "UNKNOWN";
  const decisionLabel = formatCommercialPilotOpsDecisionLabel(decision);
  const artifactPresent = input.commercialOps?.goNoGo.artifactPresent ?? false;
  const goNoGo = input.commercialOps?.goNoGo.summary;
  const customerExecutionStatus = goNoGo?.customerExecutionStatus ?? null;

  const blockers: LaunchWizardCommercialBlockerRow[] = [];

  if (!artifactPresent) {
    blockers.push({
      id: "gono-go-artifact-missing",
      label: "Pilot GO/NO-GO artifact missing",
      detail: "Run npm run smoke:pilot-gono-go — never assume GO without the summary artifact.",
      tone: "urgent",
      href: LAUNCH_WIZARD_ROUTE,
    });
  } else if (decision === "NO-GO") {
    blockers.push({
      id: "gono-go-no-go",
      label: decisionLabel,
      detail:
        goNoGo && goNoGo.blockers.length > 0
          ? goNoGo.blockers.slice(0, 3).join(" · ")
          : "Resolve commercial evidence gates before paid pilot cutover.",
      tone: "urgent",
      href: LAUNCH_WIZARD_ROUTE,
    });
  }

  if (customerExecutionStatus === "skipped_missing_customer") {
    blockers.push({
      id: "pilot-customer-missing",
      label: "Paid pilot customer not recorded",
      detail:
        "No LOI/customer record in GO/NO-GO artifact — do not fake a paid pilot customer.",
      tone: "urgent",
      href: LAUNCH_WIZARD_ROUTE,
    });
  }

  if (input.p0Blocked) {
    const p0 = input.commercialOps?.p0Staging.summary;
    const opsVault = buildP0OpsVaultUiSlice(
      p0,
      input.commercialOps?.vaultReadiness.report ?? null,
    );
    const nextPhase = opsVault?.nextPhase ?? null;
    const phaseDetail = nextPhase
      ? `${formatP0OpsVaultPhaseBlockerDetail(nextPhase)} · ${nextPhase.docPath}`
      : p0 && p0.allMissingEnvVars.length > 0
        ? `${p0.allMissingEnvVars.length} ops env var(s) missing.`
        : "SSO IdP, GitHub first-green, or channel live smoke incomplete.";
    blockers.push({
      id: "p0-staging-blocked",
      label: nextPhase
        ? `P0 ops vault — ${nextPhase.label.replace(/^Phase \d+ — /, "")}`
        : `P0 staging proof — ${p0?.p0ProofStatus.replaceAll("_", " ") ?? "blocked"}`,
      detail: phaseDetail,
      tone: "urgent",
      href:
        opsVault?.platformOpsHref ??
        `/dashboard/integration-health${INTEGRATION_HEALTH_RECOVERY_ANCHOR}`,
    });
  }

  if (resolveLaunchWizardTier2ProofBlocked(input.commercialOps)) {
    const tier2 = input.commercialOps?.tier2Staging.summary;
    const goldenPath = buildTier2GoldenPathUiSlice({
      p0ProofStatus: "proof_passed",
      tier2Summary: tier2 ?? null,
    });
    const phases = goldenPath?.phases ?? buildTier2GoldenPathPhaseStatuses({ tier2Summary: tier2 ?? null });
    const nextPhase = resolveNextIncompleteTier2GoldenPathPhase(phases);
    const phaseDetail = nextPhase
      ? formatTier2GoldenPathPhaseBlockerDetail(nextPhase)
      : tier2?.tier2ProofStatus === "awaiting_manual_phases"
        ? `${tier2.missingManualEnvVars.length} manual phase env var(s) missing.`
        : "Run npm run smoke:tier2-staging-golden-path after P0 PASS.";
    blockers.push({
      id: "tier2-staging-blocked",
      label: nextPhase
        ? `Tier 2 golden path — ${nextPhase.label.replace(/^Phase \d+ — /, "")}`
        : `Tier 2 golden path — ${tier2?.tier2ProofStatus.replaceAll("_", " ") ?? "not started"}`,
      detail: phaseDetail,
      tone: "urgent",
      href: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`,
    });
  }

  if (input.ssoProofBlocked) {
    blockers.push({
      id: "sso-proof-blocked",
      label: "SSO IdP staging proof incomplete",
      detail: "Enterprise SSO pilot wiring — not production SSO for all tenants.",
      tone: "urgent",
      href: "/dashboard/settings/security/sso",
    });
  }

  if (input.channelLiveProofBlocked) {
    blockers.push({
      id: "channel-live-proof-blocked",
      label: "Channel live smoke not passed",
      detail: "Woo/Shopify engineering live smoke SKIPPED or FAILED — not a LIVE marketplace claim.",
      tone: "urgent",
      href: `/dashboard/integration-health${INTEGRATION_HEALTH_RECOVERY_ANCHOR}`,
    });
  }

  for (const gate of goNoGo?.evidenceGates.filter((row) => !row.pass).slice(0, 3) ?? []) {
    if (blockers.some((row) => row.id === `gate-${gate.id}`)) continue;
    blockers.push({
      id: `gate-${gate.id}`,
      label: gate.label,
      detail: gate.reason.slice(0, 140),
      tone: gate.id.startsWith("p0_") || gate.id === "tier0" ? "urgent" : "normal",
      href: LAUNCH_WIZARD_ROUTE,
    });
  }

  let headline: string;
  if (decision === "GO" && blockers.length === 0) {
    headline = "Commercial evidence gates passed — confirm workspace setup steps before cutover.";
  } else if (blockers.length > 0) {
    headline = `${blockers.length} commercial blocker(s) — resolve before paid pilot traffic.`;
  } else if (decision === "UNKNOWN") {
    headline = "Commercial GO/NO-GO unknown — run smoke:pilot-gono-go after workspace setup.";
  } else {
    headline = "Review commercial pilot evidence before contract cutover.";
  }

  return {
    decision,
    decisionLabel,
    artifactPresent,
    customerExecutionStatus,
    blockers: blockers.slice(0, 6),
    headline,
  };
}

export function launchWizardTodayStripHref(nextStepId?: string | null): string {
  const base = LAUNCH_WIZARD_ROUTE;
  if (!nextStepId) return `${base}?mode=compact`;
  return `${base}?mode=compact#launch-wizard-step-${nextStepId}`;
}
