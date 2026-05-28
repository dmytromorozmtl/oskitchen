/**
 * Commercial GO closure phases — ICP + LOI + GO/NO-GO (Step 3 after Tier 2 PASS).
 */
import {
  evaluatePilotIcpQualification,
  type PilotIcpQualificationInput,
} from "@/lib/commercial/pilot-icp-contract-era17";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";

export const PILOT_GONOGO_SUMMARY_ARTIFACT_PATH = "artifacts/pilot-gono-go-summary.json" as const;

export const P0_STAGING_PROOF_ARTIFACT_PATH =
  "artifacts/p0-staging-proof-unblock-summary.json" as const;

export const TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH =
  "artifacts/tier2-staging-golden-path-summary.json" as const;

export const COMMERCIAL_GO_CLOSURE_PHASES_ERA21_POLICY_ID =
  "era21-commercial-go-closure-phases-v1" as const;

export const COMMERCIAL_GO_CLOSURE_STEP3_DOC =
  "docs/next-step-3-after-tier2-pass-2026-05-28.md" as const;

export const COMMERCIAL_GO_CLOSURE_BLOCKER_PLAYBOOK_DOC =
  "docs/era20-pilot-gono-go-blocker-playbook-2026-05-28.md" as const;

export const COMMERCIAL_GO_CLOSURE_PROSPECT_DRAFT_TEMPLATE =
  "config/commercial/pilot-icp-prospect-draft.template.json" as const;

export type CommercialGoClosurePhaseDef = {
  id: string;
  label: string;
  keys: readonly string[];
  docPath: string;
  routes: readonly string[];
  smokeScripts: readonly string[];
};

export const COMMERCIAL_GO_CLOSURE_PHASES: readonly CommercialGoClosurePhaseDef[] = [
  {
    id: "engineering_prerequisites",
    label: "Phase 1 — P0 + Tier 2 proof (artifacts)",
    keys: [],
    docPath: "docs/next-step-2-after-p0-pass-2026-05-28.md",
    routes: ["/dashboard/launch-wizard"],
    smokeScripts: ["smoke:p0-staging-proof-unblock", "smoke:tier2-staging-golden-path"],
  },
  {
    id: "icp_qualification",
    label: "Phase 2 — ICP qualification (real prospect)",
    keys: ["PILOT_GONOGO_ICP_INPUT_JSON"],
    docPath: COMMERCIAL_GO_CLOSURE_PROSPECT_DRAFT_TEMPLATE,
    routes: ["/dashboard/implementation"],
    smokeScripts: [],
  },
  {
    id: "sales_compliance",
    label: "Phase 3 — Forbidden claims + role checklists",
    keys: ["PILOT_GONOGO_FORBIDDEN_CLAIMS_IN_CONTRACT", "PILOT_GONOGO_ROLE_CHECKLISTS_COMPLETE"],
    docPath: "docs/sales-forbidden-claims-training-era20.md",
    routes: ["/dashboard/implementation"],
    smokeScripts: ["smoke:pilot-forbidden-claims-enforcement"],
  },
  {
    id: "loi_customer",
    label: "Phase 4 — Signed LOI / customer record",
    keys: ["PILOT_GONOGO_CUSTOMER_NAME", "PILOT_GONOGO_LOI_SIGNED_DATE"],
    docPath: "docs/pilot-icp-contract-template-era17.md",
    routes: ["/dashboard/launch-wizard"],
    smokeScripts: [],
  },
  {
    id: "go_orchestrator",
    label: "Phase 5 — GO/NO-GO orchestrator",
    keys: [],
    docPath: COMMERCIAL_GO_CLOSURE_STEP3_DOC,
    routes: ["/dashboard/launch-wizard"],
    smokeScripts: ["smoke:pilot-gono-go"],
  },
] as const;

export const COMMERCIAL_GO_CLOSURE_TRACKED_ENV_KEYS = [
  "PILOT_GONOGO_CUSTOMER_NAME",
  "PILOT_GONOGO_LOI_SIGNED_DATE",
  "PILOT_GONOGO_ICP_INPUT_JSON",
  "PILOT_GONOGO_ROLE_CHECKLISTS_COMPLETE",
  "PILOT_GONOGO_FORBIDDEN_CLAIMS_IN_CONTRACT",
] as const;

export type CommercialGoClosurePhaseStatus = {
  id: string;
  label: string;
  complete: boolean;
  presentKeys: string[];
  missingKeys: string[];
  docPath: string;
  routes: readonly string[];
  smokeScripts: readonly string[];
  detail: string;
};

export type CommercialGoClosurePrerequisiteStatus = {
  p0ProofStatus: string | null;
  tier2ProofStatus: string | null;
  prerequisitesComplete: boolean;
};

export function resolveCommercialGoClosurePrerequisites(input: {
  p0ProofStatus: string | null;
  tier2ProofStatus: string | null;
}): CommercialGoClosurePrerequisiteStatus {
  return {
    p0ProofStatus: input.p0ProofStatus,
    tier2ProofStatus: input.tier2ProofStatus,
    prerequisitesComplete:
      input.p0ProofStatus === "proof_passed" && input.tier2ProofStatus === "proof_passed",
  };
}

function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

function parsePilotIcpInputFromJson(raw: string | undefined): PilotIcpQualificationInput {
  if (!raw?.trim()) return {};
  try {
    return JSON.parse(raw) as PilotIcpQualificationInput;
  } catch {
    return {};
  }
}

export function buildCommercialGoClosurePhaseStatuses(input: {
  prerequisites: CommercialGoClosurePrerequisiteStatus;
  goNoGoSummary: PilotGoNoGoSummary | null;
  env?: NodeJS.ProcessEnv;
}): CommercialGoClosurePhaseStatus[] {
  const env = input.env ?? process.env;
  const go = input.goNoGoSummary;

  return COMMERCIAL_GO_CLOSURE_PHASES.map((phase) => {
    let complete = false;
    let detail = "";

    if (phase.id === "engineering_prerequisites") {
      complete = input.prerequisites.prerequisitesComplete;
      detail = complete
        ? `${P0_STAGING_PROOF_ARTIFACT_PATH} + ${TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH} → proof_passed`
        : `P0=${input.prerequisites.p0ProofStatus ?? "missing"} · Tier2=${input.prerequisites.tier2ProofStatus ?? "missing"}`;
    } else if (phase.id === "icp_qualification") {
      const icpRaw = env.PILOT_GONOGO_ICP_INPUT_JSON;
      const icpInput = parsePilotIcpInputFromJson(icpRaw);
      const result = evaluatePilotIcpQualification(icpInput);
      const icpGate = go?.evidenceGates.find((g) => g.id === "icp_qualification");
      complete = Boolean(icpRaw?.trim()) && result.qualified && (icpGate?.pass ?? result.qualified);
      detail = !icpRaw?.trim()
        ? `Export prospect JSON from ${COMMERCIAL_GO_CLOSURE_PROSPECT_DRAFT_TEMPLATE}`
        : result.qualified
          ? "ICP qualifies — no forbidden requirement flags"
          : `Disqualifiers: ${result.disqualifiers.join(", ") || result.missingCriteria.join(", ") || "review ICP input"}`;
    } else if (phase.id === "sales_compliance") {
      const claims = parseEnvBoolean(env.PILOT_GONOGO_FORBIDDEN_CLAIMS_IN_CONTRACT) === true;
      const roles = parseEnvBoolean(env.PILOT_GONOGO_ROLE_CHECKLISTS_COMPLETE) === true;
      const claimsGate = go?.evidenceGates.find((g) => g.id === "forbidden_claims_enforcement");
      complete = claims && roles && (claimsGate?.pass ?? false);
      detail =
        claims && roles
          ? claimsGate?.pass
            ? "Forbidden claims enforcement PASSED"
            : "Run npm run smoke:pilot-forbidden-claims-enforcement"
          : `Set PILOT_GONOGO_FORBIDDEN_CLAIMS_IN_CONTRACT=1 and PILOT_GONOGO_ROLE_CHECKLISTS_COMPLETE=1 after sales/legal review`;
    } else if (phase.id === "loi_customer") {
      const name = env.PILOT_GONOGO_CUSTOMER_NAME?.trim();
      const date = env.PILOT_GONOGO_LOI_SIGNED_DATE?.trim();
      complete =
        go?.customerExecutionStatus === "recorded" || Boolean(name && date);
      detail = complete
        ? `Customer recorded${name ? `: ${name}` : ""}`
        : "Sign LOI, then set PILOT_GONOGO_CUSTOMER_NAME + PILOT_GONOGO_LOI_SIGNED_DATE — never fake";
    } else {
      complete = go?.decision === "GO";
      detail = complete
        ? `${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} → decision: GO`
        : go
          ? `Current decision: ${go.decision} — ${go.blockers.length} blocker(s)`
          : "Run npm run smoke:pilot-gono-go after phases 2–4";
    }

    const missingKeys = phase.keys.filter((key) => !env[key]?.trim());
    const presentKeys = phase.keys.filter((key) => env[key]?.trim());

    return {
      id: phase.id,
      label: phase.label,
      complete,
      presentKeys: [...presentKeys],
      missingKeys: [...missingKeys],
      docPath: phase.docPath,
      routes: phase.routes,
      smokeScripts: phase.smokeScripts,
      detail,
    };
  });
}

export function resolveNextIncompleteCommercialGoClosurePhase(
  phases: readonly CommercialGoClosurePhaseStatus[],
): CommercialGoClosurePhaseStatus | null {
  return phases.find((phase) => !phase.complete) ?? null;
}

export function formatCommercialGoClosurePhaseBlockerDetail(
  phase: CommercialGoClosurePhaseStatus,
): string {
  return `${phase.label}: ${phase.detail}`;
}
