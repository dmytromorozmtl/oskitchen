import { existsSync, readFileSync } from "fs";
import { join } from "path";

import {
  buildCommercialPilotOpsStatusModel,
  type CommercialPilotOpsStatusModel,
} from "@/lib/commercial/commercial-pilot-ops-status-era18";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-gono-go-era17-policy";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";

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

export async function loadCommercialPilotOpsStatusModel(): Promise<CommercialPilotOpsStatusModel> {
  const goNoGoPath = PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT;
  const p0Path = P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT;

  const goNoGoSummary = readJsonArtifact<PilotGoNoGoSummary>(goNoGoPath);
  const p0Summary = readJsonArtifact<P0StagingProofUnblockSummary>(p0Path);

  return buildCommercialPilotOpsStatusModel({
    goNoGo: {
      artifactPresent: goNoGoSummary !== null,
      summary: goNoGoSummary,
    },
    p0Staging: {
      artifactPresent: p0Summary !== null,
      summary: p0Summary,
    },
  });
}
