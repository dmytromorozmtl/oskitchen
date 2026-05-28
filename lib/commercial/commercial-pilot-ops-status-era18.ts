import {
  COMMERCIAL_PILOT_GONOGO_ANCHOR,
  COMMERCIAL_PILOT_OPS_STATUS_PLATFORM_ROUTE,
  COMMERCIAL_PILOT_P0_STAGING_ANCHOR,
} from "@/lib/commercial/commercial-pilot-ops-status-era18-policy";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type {
  PilotGoNoGoEvidenceGate,
  PilotGoNoGoSummary,
} from "@/lib/commercial/pilot-gono-go-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export type CommercialPilotOpsGoNoGoSlice = {
  artifactPresent: boolean;
  summary: PilotGoNoGoSummary | null;
};

export type CommercialPilotOpsP0StagingSlice = {
  artifactPresent: boolean;
  summary: P0StagingProofUnblockSummary | null;
};

export type CommercialPilotOpsStatusModel = {
  loadedAt: string;
  goNoGo: CommercialPilotOpsGoNoGoSlice;
  p0Staging: CommercialPilotOpsP0StagingSlice;
  tier2Staging: {
    artifactPresent: boolean;
    summary: Tier2StagingGoldenPathSummary | null;
  };
};

export type CommercialPilotOpsDecision =
  | "GO"
  | "NO-GO"
  | "UNKNOWN";

export type CommercialPilotOpsAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type CommercialPilotOpsGateRow = {
  id: string;
  label: string;
  pass: boolean;
  reason: string;
  nextAction: { label: string; href: string; tone: "urgent" | "normal" } | null;
};

export function resolveCommercialPilotOpsDecision(
  goNoGo: CommercialPilotOpsGoNoGoSlice,
): CommercialPilotOpsDecision {
  if (!goNoGo.artifactPresent || !goNoGo.summary) {
    return "UNKNOWN";
  }
  return goNoGo.summary.decision === "GO" ? "GO" : "NO-GO";
}

export function formatCommercialPilotOpsDecisionLabel(
  decision: CommercialPilotOpsDecision,
): string {
  switch (decision) {
    case "GO":
      return "GO — evidence gates passed";
    case "NO-GO":
      return "NO-GO — blockers remain";
    default:
      return "Unknown — run smoke:pilot-gono-go";
  }
}

export function buildCommercialPilotOpsStatusModel(input: {
  goNoGo: CommercialPilotOpsGoNoGoSlice;
  p0Staging: CommercialPilotOpsP0StagingSlice;
  tier2Staging?: {
    artifactPresent: boolean;
    summary: import("@/lib/commercial/tier2-staging-golden-path-summary").Tier2StagingGoldenPathSummary | null;
  };
  loadedAt?: string;
}): CommercialPilotOpsStatusModel {
  return {
    loadedAt: input.loadedAt ?? new Date().toISOString(),
    goNoGo: input.goNoGo,
    p0Staging: input.p0Staging,
    tier2Staging: input.tier2Staging ?? { artifactPresent: false, summary: null },
  };
}

function platformHref(anchor: string): string {
  return `${COMMERCIAL_PILOT_OPS_STATUS_PLATFORM_ROUTE}${anchor}`;
}

export function resolveCommercialPilotOpsGateNextAction(
  gate: PilotGoNoGoEvidenceGate,
): CommercialPilotOpsGateRow["nextAction"] {
  if (gate.pass) return null;

  if (gate.id.startsWith("p0_") || gate.id === "p0_staging_proof") {
    return {
      label: "Review P0 staging proof",
      href: platformHref(COMMERCIAL_PILOT_P0_STAGING_ANCHOR),
      tone: "urgent",
    };
  }

  if (gate.id === "sso_pilot_ready") {
    return {
      label: "Review SSO pilot gate",
      href: "/dashboard/settings/security/sso#sso-pilot-activation",
      tone: "urgent",
    };
  }

  if (gate.id === "tier2") {
    return {
      label: "Open Launch Wizard Tier 2",
      href: "/dashboard/launch-wizard",
      tone: "normal",
    };
  }

  return {
    label: "Review GO/NO-GO gate",
    href: platformHref(COMMERCIAL_PILOT_GONOGO_ANCHOR),
    tone: gate.id === "tier0" ? "urgent" : "normal",
  };
}

export function buildCommercialPilotOpsGateRows(
  model: CommercialPilotOpsStatusModel,
): CommercialPilotOpsGateRow[] {
  const gates = model.goNoGo.summary?.evidenceGates ?? [];
  return gates.map((gate) => ({
    id: gate.id,
    label: gate.label,
    pass: gate.pass,
    reason: gate.reason,
    nextAction: resolveCommercialPilotOpsGateNextAction(gate),
  }));
}

export function summarizeCommercialPilotOpsStatus(
  model: CommercialPilotOpsStatusModel,
): { totalSignals: number; hasUrgent: boolean; decision: CommercialPilotOpsDecision } {
  const decision = resolveCommercialPilotOpsDecision(model.goNoGo);
  const failedGates = model.goNoGo.summary?.evidenceGates.filter((gate) => !gate.pass).length ?? 0;
  const blockers = model.goNoGo.summary?.blockers.length ?? 0;
  const p0Failed =
    model.p0Staging.summary?.p0ProofStatus === "proof_failed" ||
    model.p0Staging.summary?.p0ProofStatus === "awaiting_ops_credentials";

  const totalSignals =
    (decision === "UNKNOWN" ? 1 : 0) +
    failedGates +
    (p0Failed && model.p0Staging.artifactPresent ? 1 : 0);

  return {
    totalSignals,
    hasUrgent: decision !== "GO" || p0Failed || failedGates > 0,
    decision,
  };
}

/** Platform ops — failed evidence gates and missing artifacts first. */
export function pickCommercialPilotOpsAttentionItems(
  model: CommercialPilotOpsStatusModel,
): CommercialPilotOpsAttentionItem[] {
  const items: CommercialPilotOpsAttentionItem[] = [];
  const decision = resolveCommercialPilotOpsDecision(model.goNoGo);

  if (decision === "UNKNOWN") {
    items.push({
      id: "gono-go-artifact-missing",
      title: "Pilot GO/NO-GO artifact missing",
      detail: "Run npm run smoke:pilot-gono-go locally or in CI — never assume GO without the summary artifact.",
      href: platformHref(COMMERCIAL_PILOT_GONOGO_ANCHOR),
      priority: 1,
      tone: "urgent",
    });
  } else if (decision === "NO-GO") {
    items.push({
      id: "gono-go-no-go",
      title: "Paid pilot GO/NO-GO is NO-GO",
      detail: `${model.goNoGo.summary?.blockers.length ?? 0} blocker(s) — resolve evidence gates before contract cutover.`,
      href: platformHref(COMMERCIAL_PILOT_GONOGO_ANCHOR),
      priority: 2,
      tone: "urgent",
    });
  }

  const p0 = model.p0Staging.summary;
  if (!model.p0Staging.artifactPresent) {
    items.push({
      id: "p0-artifact-missing",
      title: "P0 staging proof artifact missing",
      detail: "Run npm run smoke:p0-staging-proof-unblock after configuring ops vault credentials.",
      href: platformHref(COMMERCIAL_PILOT_P0_STAGING_ANCHOR),
      priority: 3,
      tone: "urgent",
    });
  } else if (p0 && p0.p0ProofStatus !== "proof_passed") {
    items.push({
      id: "p0-staging-blocked",
      title: `P0 staging proof — ${p0.p0ProofStatus.replaceAll("_", " ")}`,
      detail:
        p0.allMissingEnvVars.length > 0
          ? `${p0.allMissingEnvVars.length} env var(s) still missing — see ops checklist.`
          : "SSO IdP, GitHub first-green, or channel live smoke incomplete.",
      href: platformHref(COMMERCIAL_PILOT_P0_STAGING_ANCHOR),
      priority: 4,
      tone: "urgent",
    });
  }

  const tier2 = model.tier2Staging.summary;
  if (tier2 && tier2.tier2ProofStatus !== "proof_passed") {
    const p0Passed = p0?.p0ProofStatus === "proof_passed";
    items.push({
      id: "tier2-golden-path-blocked",
      title: `Tier 2 golden path — ${tier2.tier2ProofStatus.replaceAll("_", " ")}`,
      detail: p0Passed
        ? "Run smoke:tier2-staging-golden-path — manual Woo → KDS → Packing on staging."
        : "Blocked until P0 proof_passed.",
      href: "/dashboard/launch-wizard",
      priority: p0Passed ? 5 : 6,
      tone: p0Passed ? "urgent" : "normal",
    });
  }

  for (const gate of model.goNoGo.summary?.evidenceGates.filter((g) => !g.pass) ?? []) {
    if (items.length >= 5) break;
    if (items.some((item) => item.id === `gate-${gate.id}`)) continue;

    items.push({
      id: `gate-${gate.id}`,
      title: gate.label,
      detail: gate.reason.slice(0, 160),
      href: resolveCommercialPilotOpsGateNextAction(gate)?.href ?? platformHref(COMMERCIAL_PILOT_GONOGO_ANCHOR),
      priority: gate.id.startsWith("p0_") ? 5 : 10,
      tone: gate.id === "tier0" || gate.id.startsWith("p0_") ? "urgent" : "normal",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 5);
}
