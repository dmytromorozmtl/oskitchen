import { existsSync, readFileSync } from "fs";
import { join } from "path";

import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { StagingWorkflowFirstGreenSummary } from "@/lib/ci/staging-workflows-first-green-summary";
import {
  buildIntegrationHealthSmokeArtifactsModel,
  type IntegrationHealthSmokeArtifactsModel,
} from "@/lib/integrations/integration-health-smoke-artifacts-era19";
import {
  INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS,
} from "@/lib/integrations/integration-health-smoke-artifacts-era19-policy";
import type { ChannelLiveSmokeSummary } from "@/lib/integrations/channel-live-smoke-summary";

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

export async function loadIntegrationHealthSmokeArtifactsModel(): Promise<IntegrationHealthSmokeArtifactsModel> {
  const [channelLive, p0Staging, stagingWorkflows] = await Promise.all([
    Promise.resolve(
      readJsonArtifact<ChannelLiveSmokeSummary>(
        INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS.channelLive,
      ),
    ),
    Promise.resolve(
      readJsonArtifact<P0StagingProofUnblockSummary>(
        INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS.p0Staging,
      ),
    ),
    Promise.resolve(
      readJsonArtifact<StagingWorkflowFirstGreenSummary>(
        INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS.stagingWorkflows,
      ),
    ),
  ]);

  return buildIntegrationHealthSmokeArtifactsModel({
    channelLive,
    p0Staging,
    stagingWorkflows,
  });
}
