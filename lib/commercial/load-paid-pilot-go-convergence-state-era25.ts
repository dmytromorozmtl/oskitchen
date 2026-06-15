/**
 * Loads honest pilot GO/NO-GO artifact state for era25 convergence.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/commercial-go-closure-phases-era21";
import {
  deriveForbiddenClaimsEnforcementPass,
  type PilotForbiddenClaimsEnforcementArtifact,
  type PilotGoNoGoSummary,
} from "@/lib/commercial/pilot-gono-go-summary";

export const PAID_PILOT_FORBIDDEN_CLAIMS_ARTIFACT_PATH =
  "artifacts/pilot-forbidden-claims-enforcement-summary.json" as const;

export type PaidPilotGoConvergenceState = {
  artifactPresent: boolean;
  artifactPath: typeof PILOT_GONOGO_SUMMARY_ARTIFACT_PATH;
  decision: PilotGoNoGoSummary["decision"] | null;
  icpQualified: boolean;
  loiRecorded: boolean;
  customerName: string | null;
  forbiddenClaimsPassed: boolean;
  blockerCount: number;
  warningCount: number;
  topBlocker: string | null;
};

function loadJson<T>(root: string, relPath: string): T | null {
  const fullPath = join(root, relPath);
  if (!existsSync(fullPath)) return null;
  return JSON.parse(readFileSync(fullPath, "utf8")) as T;
}

export function loadPilotGoNoGoSummaryArtifact(
  root: string = process.cwd(),
): PilotGoNoGoSummary | null {
  return loadJson<PilotGoNoGoSummary>(root, PILOT_GONOGO_SUMMARY_ARTIFACT_PATH);
}

export function derivePaidPilotGoConvergenceState(
  root: string = process.cwd(),
): PaidPilotGoConvergenceState {
  const summary = loadPilotGoNoGoSummaryArtifact(root);
  const forbiddenClaimsArtifact = loadJson<PilotForbiddenClaimsEnforcementArtifact>(
    root,
    PAID_PILOT_FORBIDDEN_CLAIMS_ARTIFACT_PATH,
  );
  const forbiddenClaimsGate = deriveForbiddenClaimsEnforcementPass(forbiddenClaimsArtifact);

  if (!summary) {
    return {
      artifactPresent: false,
      artifactPath: PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
      decision: null,
      icpQualified: false,
      loiRecorded: false,
      customerName: null,
      forbiddenClaimsPassed: forbiddenClaimsGate.pass,
      blockerCount: 0,
      warningCount: 0,
      topBlocker: "artifacts/pilot-gono-go-summary.json missing",
    };
  }

  return {
    artifactPresent: true,
    artifactPath: PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
    decision: summary.decision,
    icpQualified: summary.icpQualification.qualified,
    loiRecorded: summary.customerExecutionStatus === "recorded",
    customerName: summary.customerName,
    forbiddenClaimsPassed: forbiddenClaimsGate.pass,
    blockerCount: summary.blockers.length,
    warningCount: summary.warnings.length,
    topBlocker: summary.blockers[0] ?? null,
  };
}
