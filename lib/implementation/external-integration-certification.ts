import type {
  IntegrationHealthStatus,
  IntegrationProvider,
  IntegrationStatus,
} from "@prisma/client";

import { providerCountsTowardLiveReadiness } from "@/lib/channels/channel-registry";
import {
  IMPLEMENTATION_INTEGRATIONS,
  type ReadinessCheckResult,
} from "@/lib/implementation/implementation-types";

export type ImplementationIntegrationEvidence = {
  provider: IntegrationProvider;
  status: IntegrationStatus;
  lastSyncAt?: Date | null;
  lastHealthStatus?: IntegrationHealthStatus | null;
  processedWebhookCount?: number;
};

export type ImplementationExternalCertificationSummary = {
  certificationCheck: ReadinessCheckResult;
  placeholderCheck: ReadinessCheckResult | null;
  targetProviders: IntegrationProvider[];
  certifiedProviders: IntegrationProvider[];
  missingProviders: IntegrationProvider[];
  missingProviderLabels: string[];
  placeholderLabels: string[];
};

function uniqueProviders(values: IntegrationProvider[]): IntegrationProvider[] {
  return Array.from(new Set(values));
}

function labelForProvider(provider: IntegrationProvider): string {
  const match = IMPLEMENTATION_INTEGRATIONS.find((entry) => entry.provider === provider);
  return match?.label ?? provider;
}

function isCertifiedEvidence(input: ImplementationIntegrationEvidence): boolean {
  if (!providerCountsTowardLiveReadiness(input.provider)) return false;
  if (input.status !== "CONNECTED") return false;
  if (input.lastHealthStatus !== "OK") return false;
  return Boolean(input.lastSyncAt) || (input.processedWebhookCount ?? 0) > 0;
}

export function summariseImplementationExternalCertification(input: {
  plannedIntegrationKeys: string[];
  connections: ImplementationIntegrationEvidence[];
}): ImplementationExternalCertificationSummary {
  const plannedEntries = input.plannedIntegrationKeys
    .map((key) => IMPLEMENTATION_INTEGRATIONS.find((entry) => entry.key === key))
    .filter((entry): entry is (typeof IMPLEMENTATION_INTEGRATIONS)[number] => Boolean(entry));

  const placeholderLabels = plannedEntries
    .filter((entry) => entry.placeholder)
    .map((entry) => entry.label);

  const plannedLiveCapableProviders = uniqueProviders(
    plannedEntries.flatMap((entry) =>
      entry.provider && providerCountsTowardLiveReadiness(entry.provider as IntegrationProvider)
        ? [entry.provider as IntegrationProvider]
        : [],
    ),
  );

  const connectedLiveCapableProviders = uniqueProviders(
    input.connections
      .filter((connection) => providerCountsTowardLiveReadiness(connection.provider))
      .map((connection) => connection.provider),
  );

  const targetProviders =
    plannedLiveCapableProviders.length > 0
      ? plannedLiveCapableProviders
      : connectedLiveCapableProviders;

  const certifiedProviders = uniqueProviders(
    input.connections
      .filter((connection) => targetProviders.includes(connection.provider))
      .filter(isCertifiedEvidence)
      .map((connection) => connection.provider),
  );

  const missingProviders = targetProviders.filter(
    (provider) => !certifiedProviders.includes(provider),
  );
  const missingProviderLabels = missingProviders.map(labelForProvider);

  const certificationCheck: ReadinessCheckResult =
    targetProviders.length === 0
      ? {
          category: "sales_channels" as const,
          title: "External integrations certified for go-live",
          required: false,
          status: "PASS",
          explanation:
            "No live-capable external integrations are currently in go-live scope. Native Storefront-only launches remain allowed.",
          actionRoute: "/dashboard/integrations",
          resultJson: {
            targetProviders: [],
            certifiedProviders: [],
            missingProviders: [],
          },
        }
      : {
          category: "sales_channels" as const,
          title: "External integrations certified for go-live",
          required: true,
          status: missingProviders.length === 0 ? "PASS" : "FAIL",
          explanation:
            missingProviders.length === 0
              ? `Certified provider${certifiedProviders.length === 1 ? "" : "s"}: ${certifiedProviders
                  .map(labelForProvider)
                  .join(", ")}. Certification requires a successful health check plus sync or webhook evidence.`
              : `Missing certification for ${missingProviders
                  .map(labelForProvider)
                  .join(", ")}. Live-capable external channels require a successful health check plus sync or webhook evidence before go-live.`,
          actionRoute: "/dashboard/integrations/health",
          resultJson: {
            targetProviders,
            certifiedProviders,
            missingProviders,
          },
        };

  const placeholderCheck =
    placeholderLabels.length === 0
      ? null
      : {
          category: "sales_channels" as const,
          title: "Placeholder integrations do not count toward go-live",
          required: false,
          status: "WARN" as const,
          explanation: `Discovery scope includes placeholder or partner-gated integrations: ${placeholderLabels.join(
            ", ",
          )}. They do not contribute certification credit and must not be treated as live-ready.`,
          actionRoute: "/dashboard/integrations",
          resultJson: { placeholderLabels },
        };

  return {
    certificationCheck,
    placeholderCheck,
    targetProviders,
    certifiedProviders,
    missingProviders,
    missingProviderLabels,
    placeholderLabels,
  };
}
