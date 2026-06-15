#!/usr/bin/env npx tsx
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { SERIES_A_PARTNER_EXPANSION_TRACKED_ENV_KEYS } from "@/lib/commercial/series-a-partner-expansion-phases-era21";

export const SERIES_A_PARTNER_EXPANSION_ENV_TEMPLATE_PATH =
  ".env.staging.series-a-partner-expansion.template" as const;

function buildTemplate(): string {
  const lines = [
    "# Series A / partner expansion — safe template (Step 7, post Scale complete)",
    "# Prerequisite: npm run ops:validate-scale-readiness-env → scaleComplete: true",
    "",
    "# Track A — Series A data room bundle",
    "npm run smoke:investor-narrative-onepager",
    "npm run smoke:competitor-feature-gap-matrix",
    "export SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED=1",
    "",
    "# Track B — Partner channel one-pager",
    "npm run smoke:woo-shopify-live",
    "export SERIES_A_PARTNER_ONEPAGER_REVIEWED=1",
    "",
    "# Track C — Multi-region pilot playbook",
    "export SCALE_PER_CUSTOMER_GO_ISOLATION=1",
    "export SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED=1",
    "export SERIES_A_MULTI_REGION_PLAYBOOK_DRAFTED=1",
    "",
    "# Track D — Customer success repeatability",
    "npm run smoke:pilot-metrics-baseline",
    "export PILOT_METRICS_OPERATOR_FEEDBACK_SCORE=4.2",
    "export PILOT_METRICS_SUPPORT_TICKETS_PER_WEEK=3",
    "export SERIES_A_CS_PLAYBOOK_REVIEWED=1",
    "",
    "# Tracked keys:",
  ];
  for (const key of SERIES_A_PARTNER_EXPANSION_TRACKED_ENV_KEYS) {
    lines.push(`# - ${key}`);
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  const write = process.argv.includes("--write");
  const content = buildTemplate();
  if (write) {
    writeFileSync(join(process.cwd(), SERIES_A_PARTNER_EXPANSION_ENV_TEMPLATE_PATH), content, "utf8");
    console.log(`Wrote ${SERIES_A_PARTNER_EXPANSION_ENV_TEMPLATE_PATH}`);
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
