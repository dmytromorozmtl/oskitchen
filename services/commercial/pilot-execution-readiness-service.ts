import { existsSync, readFileSync } from "fs";
import { join } from "path";

import {
  buildEra20PilotExecutionReadinessSlice,
  type Era20PilotExecutionReadinessSlice,
} from "@/lib/commercial/era20-pilot-execution-readiness";
import { PILOT_METRICS_BASELINE_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-metrics-baseline-era17-policy";
import { PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-gono-go-era17-policy";
import { PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-forbidden-claims-enforcement-era17-policy";
import { PILOT_ROLLBACK_DRILL_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-rollback-drill-era17-policy";
import type {
  PilotMetricsBaselineGoNoGoArtifact,
  PilotRollbackDrillGoNoGoArtifact,
} from "@/lib/commercial/era20-pilot-execution-readiness";
import type {
  PilotForbiddenClaimsEnforcementArtifact,
  PilotP0StagingProofArtifact,
} from "@/lib/commercial/pilot-gono-go-summary";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";

function readJsonArtifact<T>(relativePath: string): T | null {
  try {
    const absolutePath = join(process.cwd(), relativePath);
    if (!existsSync(absolutePath)) {
      return null;
    }
    return JSON.parse(readFileSync(absolutePath, "utf8")) as T;
  } catch {
    return null;
  }
}

export async function loadPilotExecutionReadinessSlice(): Promise<Era20PilotExecutionReadinessSlice> {
  const [
    metricsBaseline,
    rollbackDrill,
    goNoGoPresent,
    forbiddenClaims,
    p0Staging,
  ] = await Promise.all([
    Promise.resolve(
      readJsonArtifact<PilotMetricsBaselineGoNoGoArtifact>(
        PILOT_METRICS_BASELINE_ERA17_SUMMARY_ARTIFACT,
      ),
    ),
    Promise.resolve(
      readJsonArtifact<PilotRollbackDrillGoNoGoArtifact>(
        PILOT_ROLLBACK_DRILL_ERA17_SUMMARY_ARTIFACT,
      ),
    ),
    Promise.resolve(existsSync(join(process.cwd(), PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT))),
    Promise.resolve(
      readJsonArtifact<PilotForbiddenClaimsEnforcementArtifact>(
        PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_SUMMARY_ARTIFACT,
      ),
    ),
    Promise.resolve(
      readJsonArtifact<PilotP0StagingProofArtifact>(
        P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT,
      ),
    ),
  ]);

  const forbiddenClaimsPassed =
    forbiddenClaims?.claimsEnforcementProofStatus === "proof_passed" ||
    forbiddenClaims?.overall === "PASSED";

  return buildEra20PilotExecutionReadinessSlice({
    metricsBaseline,
    rollbackDrill,
    goNoGoArtifactPresent: goNoGoPresent,
    forbiddenClaimsPassed,
    p0ProofPassed: p0Staging?.p0ProofStatus === "proof_passed",
  });
}
