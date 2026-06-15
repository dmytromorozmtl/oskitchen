/**
 * Pilot GO/NO-GO summary — Evolution Era 17 Cycle 18.
 */

import {
  evaluateCommercialPilotGoNoGo,
  type CommercialPilotGoNoGoInput,
  type CommercialPilotGoNoGoResult,
} from "@/lib/commercial/commercial-pilot-evidence-pack";
import {
  evaluatePilotIcpQualification,
  type PilotIcpQualificationInput,
  type PilotIcpQualificationResult,
} from "@/lib/commercial/pilot-icp-contract-era17";
import { buildEra20ProspectPlaceholder } from "@/lib/commercial/era20-first-paid-pilot-package";
import {
  buildEra20PilotIcpQualificationBridgeSlice,
  buildPilotIcpQualificationGoNoGoWarning,
  derivePilotIcpQualificationGate,
} from "@/lib/commercial/era20-pilot-icp-qualification-bridge-era20";
import {
  mergeGoldenPathArtifactsForGoNoGo,
  formatTier2GoldenPathGateReason,
} from "@/lib/commercial/tier2-golden-path-gono-go-bridge-era20";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  buildEra20PilotExecutionReadinessSlice,
  buildPilotExecutionReadinessGoNoGoWarnings,
  derivePilotMetricsBaselineGate,
  derivePilotRollbackDrillGate,
  type Era20PilotExecutionReadinessSlice,
  type PilotMetricsBaselineGoNoGoArtifact,
  type PilotRollbackDrillGoNoGoArtifact,
} from "@/lib/commercial/era20-pilot-execution-readiness";
import {
  buildPilotGoNoGoBlockerTaxonomy,
  formatPilotGoNoGoBlockerTaxonomyLines,
  type PilotGoNoGoCategorizedBlocker,
} from "@/lib/commercial/pilot-gono-go-blocker-taxonomy-era20";

export const PILOT_GONOGO_SUMMARY_VERSION = "era17-pilot-gono-go-v1" as const;

export type PilotGoNoGoCustomerStatus = "recorded" | "skipped_missing_customer";

export type PilotGoNoGoProspectStatus = "none" | "prospect_placeholder";

export type PilotGoNoGoEvidenceGate = {
  id: string;
  label: string;
  pass: boolean;
  reason: string;
};

export type PilotGoNoGoSummary = {
  version: typeof PILOT_GONOGO_SUMMARY_VERSION;
  runAt: string;
  decision: CommercialPilotGoNoGoResult["decision"];
  blockers: string[];
  warnings: string[];
  customerExecutionStatus: PilotGoNoGoCustomerStatus;
  customerName: string | null;
  loiSignedDate: string | null;
  prospectExecutionStatus: PilotGoNoGoProspectStatus;
  prospectName: string | null;
  icpQualification: PilotIcpQualificationResult;
  evidenceGates: PilotGoNoGoEvidenceGate[];
  evaluatorInput: CommercialPilotGoNoGoInput;
  blockerTaxonomy?: {
    policyId: string;
    categorizedBlockers: PilotGoNoGoCategorizedBlocker[];
    categorizedWarnings: PilotGoNoGoCategorizedBlocker[];
  };
  executionReadiness?: Era20PilotExecutionReadinessSlice;
};

export type PilotTierPreflightArtifact = {
  overall?: string;
  tier0ProofStatus?: string;
  tier1ProofStatus?: string;
  commitSha?: string | null;
};

export type PilotGoldenPathArtifact = {
  overall?: string;
  phaseProofStatus?: string;
  signOffTemplate?: {
    stagingUrl?: string | null;
    commitSha?: string | null;
    operatorEmail?: string | null;
  };
};

export type PilotForbiddenClaimsEnforcementArtifact = {
  overall?: string;
  claimsEnforcementProofStatus?: string;
  commitSha?: string | null;
};

export type PilotP0StagingProofChildArtifact = {
  overall?: string | null;
  proofStatus?: string | null;
  missingEnvVars?: string[];
};

export type PilotP0StagingProofArtifact = {
  overall?: string;
  p0ProofStatus?: string;
  allMissingEnvVars?: string[];
  children?: {
    ssoIdpStaging?: PilotP0StagingProofChildArtifact;
    stagingWorkflowsFirstGreen?: PilotP0StagingProofChildArtifact;
    channelLive?: PilotP0StagingProofChildArtifact;
  };
};

export type PilotSsoPilotReadyGateArtifact = {
  ssoDeliveryStatus?: string;
  promotionAllowed?: boolean;
  gateOutcome?: string;
  reason?: string;
};

export function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

export function parsePilotIcpInputFromJson(raw: string | undefined): PilotIcpQualificationInput {
  if (!raw?.trim()) return {};
  try {
    return JSON.parse(raw) as PilotIcpQualificationInput;
  } catch {
    return {};
  }
}

export function deriveTier0Pass(preflight: PilotTierPreflightArtifact | null): PilotGoNoGoEvidenceGate {
  if (!preflight) {
    return {
      id: "tier0",
      label: "Tier 0 engineering gate",
      pass: false,
      reason: "artifacts/pilot-tier-preflight-summary.json missing — run smoke:pilot-tier-preflight",
    };
  }
  const pass = preflight.tier0ProofStatus === "proof_passed";
  return {
    id: "tier0",
    label: "Tier 0 engineering gate",
    pass,
    reason: pass
      ? "tier0ProofStatus proof_passed (Tier 0 evaluated independently of Tier 1 staging env)"
      : `tier0ProofStatus=${preflight.tier0ProofStatus ?? "unknown"} overall=${preflight.overall ?? "unknown"}`,
  };
}

export function deriveTier1Pass(preflight: PilotTierPreflightArtifact | null): PilotGoNoGoEvidenceGate {
  if (!preflight) {
    return {
      id: "tier1",
      label: "Tier 1 staging readiness",
      pass: false,
      reason: "artifacts/pilot-tier-preflight-summary.json missing",
    };
  }
  const pass = preflight.tier1ProofStatus === "proof_passed";
  return {
    id: "tier1",
    label: "Tier 1 staging readiness",
    pass,
    reason: pass
      ? "tier1ProofStatus proof_passed"
      : `tier1ProofStatus=${preflight.tier1ProofStatus ?? "unknown"}`,
  };
}

export function deriveTier2Pass(
  goldenPath: PilotGoldenPathArtifact | null,
  tier2StagingGoldenPath?: Pick<
    Tier2StagingGoldenPathSummary,
    "overall" | "tier2ProofStatus" | "p0ProofStatus"
  > | null,
): PilotGoNoGoEvidenceGate {
  const effective = mergeGoldenPathArtifactsForGoNoGo({
    operatorGoldenPath: goldenPath,
    tier2StagingGoldenPath: tier2StagingGoldenPath ?? null,
  });

  if (!effective) {
    return {
      id: "tier2",
      label: "Tier 2 operator golden path",
      pass: false,
      reason:
        "artifacts/pilot-operator-golden-path-summary.json and tier2-staging-golden-path-summary.json missing — run smoke:tier2-staging-golden-path on staging",
    };
  }

  const pass = effective.phaseProofStatus === "proof_passed";
  const tier2Reason = formatTier2GoldenPathGateReason(goldenPath, tier2StagingGoldenPath ?? null);

  return {
    id: "tier2",
    label: "Tier 2 operator golden path",
    pass,
    reason: pass
      ? (tier2Reason ?? "phaseProofStatus proof_passed")
      : tier2Reason ??
        `phaseProofStatus=${effective.phaseProofStatus ?? "unknown"} — run smoke:pilot-operator-golden-path or smoke:tier2-staging-golden-path`,
  };
}

export function deriveP0StagingProofPass(
  artifact: PilotP0StagingProofArtifact | null,
): PilotGoNoGoEvidenceGate {
  if (!artifact) {
    return {
      id: "p0_staging_proof",
      label: "P0 staging proof (SSO + GitHub + channel)",
      pass: false,
      reason:
        "artifacts/p0-staging-proof-unblock-summary.json missing — run smoke:p0-staging-proof-unblock",
    };
  }
  const pass = artifact.p0ProofStatus === "proof_passed";
  const missing =
    artifact.allMissingEnvVars?.length ?
      ` missing: ${artifact.allMissingEnvVars.join(", ")}`
    : "";
  return {
    id: "p0_staging_proof",
    label: "P0 staging proof (SSO + GitHub + channel)",
    pass,
    reason: pass
      ? "p0ProofStatus proof_passed"
      : `p0ProofStatus=${artifact.p0ProofStatus ?? "unknown"} overall=${artifact.overall ?? "unknown"} — SKIPPED WITH REASON${missing}`,
  };
}

export function deriveP0ChildProofPass(input: {
  id: string;
  label: string;
  child: PilotP0StagingProofChildArtifact | null | undefined;
  p0Artifact: PilotP0StagingProofArtifact | null;
}): PilotGoNoGoEvidenceGate {
  if (!input.p0Artifact) {
    return {
      id: input.id,
      label: input.label,
      pass: false,
      reason: "P0 unblock artifact missing — run smoke:p0-staging-proof-unblock",
    };
  }
  const proofStatus = input.child?.proofStatus ?? null;
  const pass = proofStatus === "proof_passed";
  const missing =
    input.child?.missingEnvVars?.length ?
      ` missing: ${input.child.missingEnvVars.join(", ")}`
    : "";
  return {
    id: input.id,
    label: input.label,
    pass,
    reason: pass
      ? "proof_passed"
      : `proofStatus=${proofStatus ?? "unknown"} overall=${input.child?.overall ?? "unknown"} — SKIPPED WITH REASON${missing}`,
  };
}

export function deriveSsoPilotReadyGatePass(
  artifact: PilotSsoPilotReadyGateArtifact | null,
): PilotGoNoGoEvidenceGate {
  if (!artifact) {
    return {
      id: "sso_pilot_ready",
      label: "SSO pilot_ready gate (Cycle 3)",
      pass: false,
      reason:
        "artifacts/enterprise-sso-pilot-ready-gate-summary.json missing — run smoke:enterprise-sso-pilot-ready-gate",
    };
  }
  const pass =
    artifact.promotionAllowed === true && artifact.ssoDeliveryStatus === "pilot_ready";
  return {
    id: "sso_pilot_ready",
    label: "SSO pilot_ready gate (Cycle 3)",
    pass,
    reason: pass
      ? "promotionAllowed true — qualified pilot_ready SSO delivery"
      : artifact.reason ??
        `gateOutcome=${artifact.gateOutcome ?? "unknown"} ssoDeliveryStatus=${artifact.ssoDeliveryStatus ?? "unknown"} — SKIPPED WITH REASON until Cycle 2 proof_passed`,
  };
}

export function deriveForbiddenClaimsEnforcementPass(
  artifact: PilotForbiddenClaimsEnforcementArtifact | null,
): PilotGoNoGoEvidenceGate {
  if (!artifact) {
    return {
      id: "forbidden_claims_enforcement",
      label: "Pre-sales forbidden-claims enforcement",
      pass: false,
      reason:
        "artifacts/pilot-forbidden-claims-enforcement-summary.json missing — run smoke:pilot-forbidden-claims-enforcement",
    };
  }
  const pass = artifact.claimsEnforcementProofStatus === "proof_passed";
  return {
    id: "forbidden_claims_enforcement",
    label: "Pre-sales forbidden-claims enforcement",
    pass,
    reason: pass
      ? "claimsEnforcementProofStatus proof_passed"
      : `claimsEnforcementProofStatus=${artifact.claimsEnforcementProofStatus ?? "unknown"} overall=${artifact.overall ?? "unknown"}`,
  };
}

export function deriveCustomerExecution(input: {
  customerName?: string | null;
  loiSignedDate?: string | null;
}): {
  status: PilotGoNoGoCustomerStatus;
  customerName: string | null;
  loiSignedDate: string | null;
  reason: string;
} {
  const customerName = input.customerName?.trim() || null;
  const loiSignedDate = input.loiSignedDate?.trim() || null;
  if (customerName && loiSignedDate) {
    return {
      status: "recorded",
      customerName,
      loiSignedDate,
      reason: "Customer name and LOI signed date recorded",
    };
  }
  const missing: string[] = [];
  if (!customerName) missing.push("PILOT_GONOGO_CUSTOMER_NAME");
  if (!loiSignedDate) missing.push("PILOT_GONOGO_LOI_SIGNED_DATE");
  return {
    status: "skipped_missing_customer",
    customerName,
    loiSignedDate,
    reason: `SKIPPED WITH REASON — missing ${missing.join(", ")}; no fake paid pilot customer`,
  };
}

export function buildPilotGoNoGoEvaluatorInput(input: {
  preflight: PilotTierPreflightArtifact | null;
  goldenPath: PilotGoldenPathArtifact | null;
  forbiddenClaimsEnforcement: PilotForbiddenClaimsEnforcementArtifact | null;
  p0StagingProof: PilotP0StagingProofArtifact | null;
  ssoPilotReadyGate: PilotSsoPilotReadyGateArtifact | null;
  metricsBaseline?: PilotMetricsBaselineGoNoGoArtifact | null;
  rollbackDrill?: PilotRollbackDrillGoNoGoArtifact | null;
  icpInput: PilotIcpQualificationInput;
  icpEnvRaw?: string | undefined;
  roleChecklistsComplete?: boolean;
  forbiddenClaimsInContract?: boolean;
  tier3Pass?: boolean;
  tier2StagingGoldenPath?: Pick<
    Tier2StagingGoldenPathSummary,
    "overall" | "tier2ProofStatus" | "p0ProofStatus"
  > | null;
}): {
  evaluatorInput: CommercialPilotGoNoGoInput;
  icpQualification: PilotIcpQualificationResult;
  evidenceGates: PilotGoNoGoEvidenceGate[];
} {
  const tier0 = deriveTier0Pass(input.preflight);
  const tier1 = deriveTier1Pass(input.preflight);
  const tier2 = deriveTier2Pass(input.goldenPath, input.tier2StagingGoldenPath);
  const effectiveGoldenPath = mergeGoldenPathArtifactsForGoNoGo({
    operatorGoldenPath: input.goldenPath,
    tier2StagingGoldenPath: input.tier2StagingGoldenPath ?? null,
  });
  const forbiddenClaimsEnforcement = deriveForbiddenClaimsEnforcementPass(
    input.forbiddenClaimsEnforcement,
  );
  const p0StagingProof = deriveP0StagingProofPass(input.p0StagingProof);
  const p0SsoIdp = deriveP0ChildProofPass({
    id: "p0_sso_idp",
    label: "P0 #1 SSO IdP staging login",
    child: input.p0StagingProof?.children?.ssoIdpStaging,
    p0Artifact: input.p0StagingProof,
  });
  const p0StagingWorkflows = deriveP0ChildProofPass({
    id: "p0_staging_workflows",
    label: "P0 #2 GitHub staging workflows first green",
    child: input.p0StagingProof?.children?.stagingWorkflowsFirstGreen,
    p0Artifact: input.p0StagingProof,
  });
  const p0ChannelLive = deriveP0ChildProofPass({
    id: "p0_channel_live",
    label: "P0 #3 Woo/Shopify live channel smoke",
    child: input.p0StagingProof?.children?.channelLive,
    p0Artifact: input.p0StagingProof,
  });
  const ssoPilotReady = deriveSsoPilotReadyGatePass(input.ssoPilotReadyGate);
  const pilotMetricsBaseline = derivePilotMetricsBaselineGate(input.metricsBaseline);
  const pilotRollbackDrill = derivePilotRollbackDrillGate(input.rollbackDrill);
  const icpQualification = evaluatePilotIcpQualification(input.icpInput);
  const icpQualificationGate = derivePilotIcpQualificationGate({
    icpEnvRaw: input.icpEnvRaw,
  });

  const stagingUrl = effectiveGoldenPath?.signOffTemplate?.stagingUrl?.trim() || null;
  const commitSha =
    input.goldenPath?.signOffTemplate?.commitSha?.trim() ||
    input.preflight?.commitSha?.trim() ||
    null;

  const evaluatorInput: CommercialPilotGoNoGoInput = {
    tier0Pass: tier0.pass,
    tier1Pass: tier1.pass,
    tier2Pass: tier2.pass,
    tier3Pass: input.tier3Pass,
    roleChecklistsComplete: input.roleChecklistsComplete ?? false,
    forbiddenClaimsInContract: input.forbiddenClaimsInContract ?? false,
    icpQualified: icpQualificationGate.pass,
    stagingUrl,
    commitSha,
  };

  return {
    evaluatorInput,
    icpQualification,
    evidenceGates: [
      tier0,
      tier1,
      tier2,
      icpQualificationGate,
      forbiddenClaimsEnforcement,
      p0StagingProof,
      p0SsoIdp,
      p0StagingWorkflows,
      p0ChannelLive,
      ssoPilotReady,
      pilotMetricsBaseline,
      pilotRollbackDrill,
    ],
  };
}

export function buildPilotGoNoGoSummary(input: {
  preflight: PilotTierPreflightArtifact | null;
  goldenPath: PilotGoldenPathArtifact | null;
  forbiddenClaimsEnforcement: PilotForbiddenClaimsEnforcementArtifact | null;
  p0StagingProof: PilotP0StagingProofArtifact | null;
  ssoPilotReadyGate: PilotSsoPilotReadyGateArtifact | null;
  metricsBaseline?: PilotMetricsBaselineGoNoGoArtifact | null;
  rollbackDrill?: PilotRollbackDrillGoNoGoArtifact | null;
  icpInput: PilotIcpQualificationInput;
  icpEnvRaw?: string | undefined;
  customerName?: string | null;
  loiSignedDate?: string | null;
  prospectName?: string | null;
  roleChecklistsComplete?: boolean;
  forbiddenClaimsInContract?: boolean;
  tier3Pass?: boolean;
  tier2StagingGoldenPath?: Pick<
    Tier2StagingGoldenPathSummary,
    "overall" | "tier2ProofStatus" | "p0ProofStatus"
  > | null;
  ssoPilotRequired?: boolean;
  runAt?: Date;
}): PilotGoNoGoSummary {
  const customer = deriveCustomerExecution({
    customerName: input.customerName,
    loiSignedDate: input.loiSignedDate,
  });
  const prospectPlaceholder = buildEra20ProspectPlaceholder(input.prospectName);
  const icpBridge = buildEra20PilotIcpQualificationBridgeSlice({ icpEnvRaw: input.icpEnvRaw });
  const built = buildPilotGoNoGoEvaluatorInput(input);
  const evaluation = evaluateCommercialPilotGoNoGo(built.evaluatorInput);
  const forbiddenClaimsGatePass =
    built.evidenceGates.find((gate) => gate.id === "forbidden_claims_enforcement")?.pass ??
    false;
  const executionReadiness = buildEra20PilotExecutionReadinessSlice({
    metricsBaseline: input.metricsBaseline,
    rollbackDrill: input.rollbackDrill,
    goNoGoArtifactPresent: true,
    forbiddenClaimsPassed: forbiddenClaimsGatePass,
    p0ProofPassed: input.p0StagingProof?.p0ProofStatus === "proof_passed",
  });

  const blockers = [...evaluation.blockers];
  const warnings = [
    ...evaluation.warnings,
    ...buildPilotExecutionReadinessGoNoGoWarnings(executionReadiness),
  ];
  const icpWarning = buildPilotIcpQualificationGoNoGoWarning(icpBridge);
  if (icpWarning) {
    warnings.push(icpWarning);
  }

  if (customer.status === "skipped_missing_customer") {
    blockers.push("No signed LOI / customer on record (era17-pilot-gono-go-v1)");
  }

  if (prospectPlaceholder) {
    warnings.push(
      `Prospect placeholder: ${prospectPlaceholder.prospectName} — ${prospectPlaceholder.disclaimer}`,
    );
  }

  const forbiddenClaimsGate = built.evidenceGates.find(
    (gate) => gate.id === "forbidden_claims_enforcement",
  );
  if (forbiddenClaimsGate && !forbiddenClaimsGate.pass) {
    blockers.push(
      "Pre-sales forbidden-claims enforcement not passed (era17-pilot-forbidden-claims-enforcement-v1)",
    );
  }

  const p0StagingProofGate = built.evidenceGates.find((gate) => gate.id === "p0_staging_proof");
  if (p0StagingProofGate && !p0StagingProofGate.pass) {
    blockers.push(
      "P0 staging proof not passed (era17-p0-staging-proof-unblock-v1) — SSO IdP, GitHub first-green, or channel live smoke incomplete",
    );
  }

  const ssoPilotReadyGate = built.evidenceGates.find((gate) => gate.id === "sso_pilot_ready");
  if (input.ssoPilotRequired && ssoPilotReadyGate && !ssoPilotReadyGate.pass) {
    blockers.push(
      "SSO pilot_ready gate not passed (era17-enterprise-sso-pilot-ready-v1) — contract includes SSO pilot scope",
    );
  } else if (ssoPilotReadyGate && !ssoPilotReadyGate.pass) {
    warnings.push(
      "SSO pilot_ready gate not passed — OK for non-SSO pilots; set PILOT_GONOGO_SSO_PILOT_REQUIRED=1 when contract includes SSO",
    );
  }

  let decision = evaluation.decision;
  if (blockers.length > 0) {
    decision = "NO-GO";
  } else if (warnings.length > 0) {
    decision = "CONDITIONAL";
  } else {
    decision = "GO";
  }

  const summaryCore = {
    version: PILOT_GONOGO_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    decision,
    blockers,
    warnings,
    customerExecutionStatus: customer.status,
    customerName: customer.customerName,
    loiSignedDate: customer.loiSignedDate,
    prospectExecutionStatus: prospectPlaceholder ? "prospect_placeholder" : "none",
    prospectName: prospectPlaceholder?.prospectName ?? null,
    icpQualification: built.icpQualification,
    evidenceGates: built.evidenceGates,
    evaluatorInput: built.evaluatorInput,
  } satisfies Omit<PilotGoNoGoSummary, "blockerTaxonomy">;

  const taxonomy = buildPilotGoNoGoBlockerTaxonomy(summaryCore);
  return {
    ...summaryCore,
    blockerTaxonomy: {
      policyId: taxonomy.policyId,
      categorizedBlockers: taxonomy.categorizedBlockers,
      categorizedWarnings: taxonomy.categorizedWarnings,
    },
    executionReadiness,
  };
}

const PILOT_GONOGO_CRITICAL_EVIDENCE_GATE_IDS = [
  "tier0",
  "tier1",
  "tier2",
  "icp_qualification",
  "forbidden_claims_enforcement",
  "p0_staging_proof",
] as const;

export function recomputePilotGoNoGoDecisionFromSummary(
  summary: PilotGoNoGoSummary,
): PilotGoNoGoSummary["decision"] {
  const evaluation = evaluateCommercialPilotGoNoGo(summary.evaluatorInput);
  const blockers = [...evaluation.blockers];

  if (summary.customerExecutionStatus === "skipped_missing_customer") {
    blockers.push("No signed LOI / customer on record (era17-pilot-gono-go-v1)");
  }

  const forbiddenClaimsGate = summary.evidenceGates.find(
    (gate) => gate.id === "forbidden_claims_enforcement",
  );
  if (forbiddenClaimsGate && !forbiddenClaimsGate.pass) {
    blockers.push(
      "Pre-sales forbidden-claims enforcement not passed (era17-pilot-forbidden-claims-enforcement-v1)",
    );
  }

  const p0StagingProofGate = summary.evidenceGates.find((gate) => gate.id === "p0_staging_proof");
  if (p0StagingProofGate && !p0StagingProofGate.pass) {
    blockers.push(
      "P0 staging proof not passed (era17-p0-staging-proof-unblock-v1) — SSO IdP, GitHub first-green, or channel live smoke incomplete",
    );
  }

  for (const gateId of PILOT_GONOGO_CRITICAL_EVIDENCE_GATE_IDS) {
    const gate = summary.evidenceGates.find((row) => row.id === gateId);
    if (gate && !gate.pass) {
      blockers.push(`${gate.label} not passed (${gate.id})`);
    }
  }

  if (summary.blockers.length > 0) {
    for (const blocker of summary.blockers) {
      if (!blockers.includes(blocker)) {
        blockers.push(blocker);
      }
    }
  }

  if (blockers.length > 0) {
    return "NO-GO";
  }

  const warnings = [...evaluation.warnings, ...summary.warnings];
  if (warnings.length > 0) {
    return "CONDITIONAL";
  }

  return "GO";
}

export function formatPilotGoNoGoReportLines(summary: PilotGoNoGoSummary): string[] {
  return [
    `Pilot GO/NO-GO (${summary.version}) — decision: ${summary.decision}`,
    `Run at: ${summary.runAt}`,
    `Customer execution: ${summary.customerExecutionStatus}`,
    `Prospect execution: ${summary.prospectExecutionStatus}${
      summary.prospectName ? ` (${summary.prospectName})` : ""
    }`,
    `ICP qualified: ${summary.icpQualification.qualified ? "yes" : "no"}`,
    "",
    ...summary.evidenceGates.map(
      (gate) => `[${gate.pass ? "PASS" : "FAIL"}] ${gate.label}: ${gate.reason}`,
    ),
    "",
    ...(summary.blockers.length > 0
      ? ["Blockers:", ...summary.blockers.map((item) => `  - ${item}`)]
      : []),
    ...(summary.warnings.length > 0
      ? ["Warnings:", ...summary.warnings.map((item) => `  - ${item}`)]
      : []),
    "",
    ...formatPilotGoNoGoBlockerTaxonomyLines(
      buildPilotGoNoGoBlockerTaxonomy(summary),
    ),
  ];
}
