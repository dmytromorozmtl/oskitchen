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

export const PILOT_GONOGO_SUMMARY_VERSION = "era17-pilot-gono-go-v1" as const;

export type PilotGoNoGoCustomerStatus = "recorded" | "skipped_missing_customer";

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
  icpQualification: PilotIcpQualificationResult;
  evidenceGates: PilotGoNoGoEvidenceGate[];
  evaluatorInput: CommercialPilotGoNoGoInput;
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
  const pass =
    preflight.overall === "PASSED" && preflight.tier0ProofStatus === "proof_passed";
  return {
    id: "tier0",
    label: "Tier 0 engineering gate",
    pass,
    reason: pass
      ? "tier0ProofStatus proof_passed"
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

export function deriveTier2Pass(goldenPath: PilotGoldenPathArtifact | null): PilotGoNoGoEvidenceGate {
  if (!goldenPath) {
    return {
      id: "tier2",
      label: "Tier 2 operator golden path",
      pass: false,
      reason:
        "artifacts/pilot-operator-golden-path-summary.json missing — run smoke:pilot-operator-golden-path on staging",
    };
  }
  const pass = goldenPath.phaseProofStatus === "proof_passed";
  return {
    id: "tier2",
    label: "Tier 2 operator golden path",
    pass,
    reason: pass
      ? "phaseProofStatus proof_passed"
      : `phaseProofStatus=${goldenPath.phaseProofStatus ?? "unknown"}`,
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
  icpInput: PilotIcpQualificationInput;
  roleChecklistsComplete?: boolean;
  forbiddenClaimsInContract?: boolean;
  tier3Pass?: boolean;
}): {
  evaluatorInput: CommercialPilotGoNoGoInput;
  icpQualification: PilotIcpQualificationResult;
  evidenceGates: PilotGoNoGoEvidenceGate[];
} {
  const tier0 = deriveTier0Pass(input.preflight);
  const tier1 = deriveTier1Pass(input.preflight);
  const tier2 = deriveTier2Pass(input.goldenPath);
  const forbiddenClaimsEnforcement = deriveForbiddenClaimsEnforcementPass(
    input.forbiddenClaimsEnforcement,
  );
  const icpQualification = evaluatePilotIcpQualification(input.icpInput);

  const stagingUrl = input.goldenPath?.signOffTemplate?.stagingUrl?.trim() || null;
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
    icpQualified: icpQualification.qualified,
    stagingUrl,
    commitSha,
  };

  return {
    evaluatorInput,
    icpQualification,
    evidenceGates: [tier0, tier1, tier2, forbiddenClaimsEnforcement],
  };
}

export function buildPilotGoNoGoSummary(input: {
  preflight: PilotTierPreflightArtifact | null;
  goldenPath: PilotGoldenPathArtifact | null;
  forbiddenClaimsEnforcement: PilotForbiddenClaimsEnforcementArtifact | null;
  icpInput: PilotIcpQualificationInput;
  customerName?: string | null;
  loiSignedDate?: string | null;
  roleChecklistsComplete?: boolean;
  forbiddenClaimsInContract?: boolean;
  tier3Pass?: boolean;
  runAt?: Date;
}): PilotGoNoGoSummary {
  const customer = deriveCustomerExecution({
    customerName: input.customerName,
    loiSignedDate: input.loiSignedDate,
  });
  const built = buildPilotGoNoGoEvaluatorInput(input);
  const evaluation = evaluateCommercialPilotGoNoGo(built.evaluatorInput);

  const blockers = [...evaluation.blockers];
  const warnings = [...evaluation.warnings];

  if (customer.status === "skipped_missing_customer") {
    blockers.push("No signed LOI / customer on record (era17-pilot-gono-go-v1)");
  }

  const forbiddenClaimsGate = built.evidenceGates.find(
    (gate) => gate.id === "forbidden_claims_enforcement",
  );
  if (forbiddenClaimsGate && !forbiddenClaimsGate.pass) {
    blockers.push(
      "Pre-sales forbidden-claims enforcement not passed (era17-pilot-forbidden-claims-enforcement-v1)",
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

  return {
    version: PILOT_GONOGO_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    decision,
    blockers,
    warnings,
    customerExecutionStatus: customer.status,
    customerName: customer.customerName,
    loiSignedDate: customer.loiSignedDate,
    icpQualification: built.icpQualification,
    evidenceGates: built.evidenceGates,
    evaluatorInput: built.evaluatorInput,
  };
}

export function formatPilotGoNoGoReportLines(summary: PilotGoNoGoSummary): string[] {
  return [
    `Pilot GO/NO-GO (${summary.version}) — decision: ${summary.decision}`,
    `Run at: ${summary.runAt}`,
    `Customer execution: ${summary.customerExecutionStatus}`,
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
  ];
}
