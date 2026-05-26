import { APP_VERSION } from "@/lib/version";
import { prisma } from "@/lib/prisma";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { countActiveApiKeys } from "@/services/developer/api-key-service";
import { getDeploymentHints } from "@/services/developer/deployment-service";
import { getEnvironmentDiagnostics } from "@/services/developer/environment-service";
import { countOpenIncidents, listPlatformIncidents } from "@/services/developer/incident-service";
import { getBackgroundJobSnapshot } from "@/services/developer/job-monitor-service";
import { listIntegrationHealthCards } from "@/services/developer/integration-health-service";
import { getPlatformAnalyticsStub } from "@/services/developer/platform-analytics-service";
import { getPlatformHealthChecks } from "@/services/developer/platform-health-service";
import { getQueueAndSyncJobCounts } from "@/services/developer/queue-monitor-service";
import { getReleaseNoteStats } from "@/services/developer/release-service";
import { getWebhookMonitorSummary } from "@/services/developer/webhook-monitor-service";

export type DeveloperCenterSnapshot = Awaited<ReturnType<typeof getDeveloperCenterSnapshot>>;

export async function getDeveloperCenterSnapshot(params: {
  userId: string;
  platformSuper: boolean;
}) {
  const { userId, platformSuper } = params;
  const integrationScope = await integrationConnectionListWhereForOwner(userId);

  const [
    health,
    webhooks,
    queues,
    jobs,
    platformHealth,
    releases,
    incidents,
    integrations,
    analyticsStub,
    deployment,
    activeIntegrations,
    apiKeysActive,
  ] = await Promise.all([
    Promise.resolve(getEnvironmentDiagnostics()),
    getWebhookMonitorSummary(userId),
    getQueueAndSyncJobCounts(userId),
    getBackgroundJobSnapshot(userId),
    getPlatformHealthChecks(),
    getReleaseNoteStats(),
    listPlatformIncidents(userId, platformSuper),
    listIntegrationHealthCards(userId),
    Promise.resolve(getPlatformAnalyticsStub()),
    Promise.resolve(getDeploymentHints()),
    prisma.integrationConnection.count({
      where: { AND: [integrationScope, { status: "CONNECTED" }] },
    }),
    countActiveApiKeys(userId),
  ]);

  const openIncidents = countOpenIncidents(incidents);

  const queuedJobs =
    queues.queuedTotal + jobs.importCenter.queued + jobs.exports.queued + queues.channelSync.pending;
  const failedJobs =
    queues.channelSync.failed + queues.channelImport.failed + jobs.importCenter.failed + jobs.exports.failed;

  const envLabel =
    deployment.vercelEnv ??
    process.env.NEXT_PUBLIC_APP_ENV ??
    deployment.nodeEnv;

  return {
    version: APP_VERSION,
    envLabel,
    platformHealth,
    kpis: {
      /** Metering for `/api/public/v1` is not persisted yet — show active keys as proxy. */
      apiRequestsToday: null as number | null,
      apiKeysActive,
      failedWebhooks24h: webhooks.failed24h,
      activeIntegrations,
      queuedJobs,
      failedJobs,
      deploymentOk: Boolean(deployment.vercelEnv || deployment.nodeEnv === "development"),
      environmentHealth: health.rows.every((r) => r.status === "ok" || r.status === "insecure")
        ? "operational"
        : health.productionGaps.length > 0
          ? "degraded"
          : "operational",
      openIncidents,
      cronHealth: "unknown" as const,
      platformUptime: null as number | null,
    },
    webhooks,
    queues,
    jobs,
    releases,
    incidents,
    integrations,
    analyticsStub,
    deployment,
    environment: health,
  };
}
