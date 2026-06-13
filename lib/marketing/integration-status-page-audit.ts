import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  INTEGRATION_STATUS_PAGE_EXPECTED_COUNT,
  INTEGRATION_STATUS_PAGE_PATH,
  INTEGRATION_STATUS_PAGE_REQUIRED_SECTIONS,
  INTEGRATION_STATUS_PAGE_TEST_ID,
  INTEGRATION_STATUS_PAGE_UPSTREAM_ARTIFACT,
} from "@/lib/marketing/integration-status-page-content";

export type IntegrationStatusPageAudit = {
  ok: boolean;
  failures: string[];
};

export function auditIntegrationStatusPageWiring(root = process.cwd()): IntegrationStatusPageAudit {
  const failures: string[] = [];
  const paths = [
    "app/status/page.tsx",
    "components/marketing/integration-status-fleet-panel.tsx",
    "lib/marketing/integration-status-page-content.ts",
    "lib/marketing/integration-status-page-data.ts",
    INTEGRATION_STATUS_PAGE_UPSTREAM_ARTIFACT,
  ];

  for (const rel of paths) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const pageSource = readFileSync(join(root, "app/status/page.tsx"), "utf8");
  const panelSource = readFileSync(
    join(root, "components/marketing/integration-status-fleet-panel.tsx"),
    "utf8",
  );
  const contentSource = readFileSync(
    join(root, "lib/marketing/integration-status-page-content.ts"),
    "utf8",
  );
  const combinedSource = `${pageSource}\n${panelSource}\n${contentSource}`;

  for (const section of INTEGRATION_STATUS_PAGE_REQUIRED_SECTIONS) {
    if (!combinedSource.includes(section)) {
      failures.push(`integration status wiring missing section marker: ${section}`);
    }
  }

  if (!pageSource.includes("IntegrationStatusFleetPanel")) {
    failures.push("status page must render IntegrationStatusFleetPanel");
  }

  if (
    !pageSource.includes(INTEGRATION_STATUS_PAGE_TEST_ID) &&
    !pageSource.includes('data-testid="integration-status-page"')
  ) {
    failures.push(`status page missing test id: ${INTEGRATION_STATUS_PAGE_TEST_ID}`);
  }

  if (!pageSource.includes("loadPublicIntegrationFleetSnapshot")) {
    failures.push("status page must load integration fleet snapshot");
  }

  if (!contentSource.includes(INTEGRATION_STATUS_PAGE_PATH)) {
    failures.push("content missing status page path constant");
  }

  if (!panelSource.includes("INTEGRATION_STATUS_PAGE_EXPECTED_COUNT")) {
    failures.push("fleet panel must reference INTEGRATION_STATUS_PAGE_EXPECTED_COUNT");
  }

  return { ok: failures.length === 0, failures };
}
