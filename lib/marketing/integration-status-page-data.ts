import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { LiveIntegrationsStagingSmokeSummary } from "@/lib/integrations/live-integrations-staging-smoke-summary";
import {
  INTEGRATION_STATUS_PAGE_UPSTREAM_ARTIFACT,
  mapSmokeStatusToDisplay,
  type PublicIntegrationDisplayStatus,
} from "@/lib/marketing/integration-status-page-content";

export type PublicIntegrationFleetRow = {
  integrationId: string;
  name: string;
  displayStatus: PublicIntegrationDisplayStatus;
  uptimeLabel: string;
  reason?: string;
  lastCheckedAt?: string;
};

export type PublicIntegrationFleetSnapshot = {
  loaded: boolean;
  runAt: string | null;
  overall: string | null;
  passedCount: number;
  skippedCount: number;
  failedCount: number;
  expectedCount: number;
  honestyNote: string;
  rows: PublicIntegrationFleetRow[];
};

function fallbackSnapshot(): PublicIntegrationFleetSnapshot {
  return {
    loaded: false,
    runAt: null,
    overall: null,
    passedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    expectedCount: 18,
    honestyNote:
      "Integration fleet artifact not found — run smoke:live-integrations-staging to populate.",
    rows: [],
  };
}

export function loadPublicIntegrationFleetSnapshot(
  root = process.cwd(),
): PublicIntegrationFleetSnapshot {
  const artifactPath = join(root, INTEGRATION_STATUS_PAGE_UPSTREAM_ARTIFACT);
  if (!existsSync(artifactPath)) {
    return fallbackSnapshot();
  }

  try {
    const summary = JSON.parse(
      readFileSync(artifactPath, "utf8"),
    ) as LiveIntegrationsStagingSmokeSummary;

    const rows: PublicIntegrationFleetRow[] = summary.steps.map((step) => {
      const displayStatus = mapSmokeStatusToDisplay(step.status);
      return {
        integrationId: step.integrationId,
        name: step.name,
        displayStatus,
        uptimeLabel:
          displayStatus === "verified"
            ? "Staging smoke passed"
            : displayStatus === "smoke_failed"
              ? "Investigate — smoke failed"
              : "Uptime pending credentials",
        reason: step.reason,
        lastCheckedAt: summary.runAt,
      };
    });

    return {
      loaded: true,
      runAt: summary.runAt,
      overall: summary.overall,
      passedCount: summary.passedCount,
      skippedCount: summary.skippedCount,
      failedCount: summary.failedCount,
      expectedCount: summary.expectedCount,
      honestyNote: summary.honestyNote,
      rows,
    };
  } catch {
    return fallbackSnapshot();
  }
}
