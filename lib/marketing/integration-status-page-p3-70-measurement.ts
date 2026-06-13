import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditIntegrationStatusPageWiring } from "@/lib/marketing/integration-status-page-audit";
import {
  INTEGRATION_STATUS_PAGE_EXPECTED_COUNT,
} from "@/lib/marketing/integration-status-page-content";
import { loadPublicIntegrationFleetSnapshot } from "@/lib/marketing/integration-status-page-data";
import {
  INTEGRATION_STATUS_PAGE_P3_70_CANONICAL_PATH,
  integrationStatusPagePathsAligned,
} from "@/lib/marketing/integration-status-page-p3-70-policy";

export type IntegrationStatusPageContractValidation = {
  passed: boolean;
  pathsAligned: boolean;
  sitemapWired: boolean;
  fleetLoaded: boolean;
  fleetCountOk: boolean;
  wiringOk: boolean;
  failures: string[];
};

export function validateIntegrationStatusPageContract(
  root = process.cwd(),
): IntegrationStatusPageContractValidation {
  const failures: string[] = [];

  if (!integrationStatusPagePathsAligned()) {
    failures.push("integration status page path constants are not aligned to /status");
  }

  let sitemapWired = false;
  const sitemapPath = join(root, "lib/marketing/sitemap-urls.ts");
  if (!existsSync(sitemapPath)) {
    failures.push("missing sitemap-urls.ts");
  } else {
    const source = readFileSync(sitemapPath, "utf8");
    sitemapWired = source.includes(INTEGRATION_STATUS_PAGE_P3_70_CANONICAL_PATH);
    if (!sitemapWired) {
      failures.push(`${INTEGRATION_STATUS_PAGE_P3_70_CANONICAL_PATH} missing from sitemap-urls.ts`);
    }
  }

  const wiring = auditIntegrationStatusPageWiring(root);
  if (!wiring.ok) {
    failures.push(...wiring.failures);
  }

  const snapshot = loadPublicIntegrationFleetSnapshot(root);
  const fleetLoaded = snapshot.loaded;
  const providerCount = snapshot.rows.filter((r) => r.integrationId !== "integration-health").length;
  const fleetCountOk = providerCount === INTEGRATION_STATUS_PAGE_EXPECTED_COUNT - 1;

  if (!fleetLoaded) {
    failures.push("integration fleet artifact failed to load");
  }
  if (!fleetCountOk) {
    failures.push(
      `fleet provider count ${providerCount} !== expected ${INTEGRATION_STATUS_PAGE_EXPECTED_COUNT - 1}`,
    );
  }

  return {
    passed: failures.length === 0 && integrationStatusPagePathsAligned() && wiring.ok && fleetLoaded && fleetCountOk,
    pathsAligned: integrationStatusPagePathsAligned(),
    sitemapWired,
    fleetLoaded,
    fleetCountOk,
    wiringOk: wiring.ok,
    failures,
  };
}
