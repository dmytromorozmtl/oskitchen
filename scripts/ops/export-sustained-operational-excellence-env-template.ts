#!/usr/bin/env npx tsx
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { SUSTAINED_OPERATIONAL_EXCELLENCE_TRACKED_ENV_KEYS } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const SUSTAINED_OPERATIONAL_EXCELLENCE_ENV_TEMPLATE_PATH =
  ".env.staging.sustained-operational-excellence.template" as const;

function buildTemplate(): string {
  const lines = [
    "# Sustained operational excellence — safe template (Step 9, post Market leader complete)",
    "# Prerequisite: npm run ops:validate-market-leader-positioning-env → marketLeaderComplete: true",
    "",
    "# Cadence A — Daily operational excellence",
    "export SCALE_PER_CUSTOMER_GO_ISOLATION=1",
    "export SUSTAINED_OPS_DAILY_CADENCE_ATTESTED=1",
    "",
    "# Cadence B — Weekly integration health",
    "npm run smoke:woo-shopify-live",
    "npm run smoke:commerce-webhook-drill",
    "export SUSTAINED_OPS_WEEKLY_INTEGRATION_REVIEWED=1",
    "",
    "# Cadence C — Monthly metrics refresh",
    "npm run smoke:pilot-metrics-baseline",
    "export SUSTAINED_OPS_MONTHLY_METRICS_REFRESHED=1",
    "",
    "# Cadence D — Quarterly governance audit",
    "npm run smoke:pilot-forbidden-claims-enforcement",
    "npm run smoke:competitor-feature-gap-matrix",
    "export SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED=1",
    "export SUSTAINED_OPS_QUARTERLY_GOVERNANCE_AUDITED=1",
    "",
    "# Tracked keys:",
  ];
  for (const key of SUSTAINED_OPERATIONAL_EXCELLENCE_TRACKED_ENV_KEYS) {
    lines.push(`# - ${key}`);
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const content = buildTemplate();
  if (write) {
    writeFileSync(join(process.cwd(), SUSTAINED_OPERATIONAL_EXCELLENCE_ENV_TEMPLATE_PATH), content, "utf8");
    console.log(`Wrote ${SUSTAINED_OPERATIONAL_EXCELLENCE_ENV_TEMPLATE_PATH}`);
  } else {
    console.log(content);
  }
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
