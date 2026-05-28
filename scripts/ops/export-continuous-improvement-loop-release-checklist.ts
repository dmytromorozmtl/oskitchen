#!/usr/bin/env npx tsx
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC } from "@/lib/commercial/continuous-improvement-loop-phases-era22";

function buildReleaseChecklist(): string {
  return `# KitchenOS — Continuous improvement loop release checklist

**Policy:** \`era22-continuous-improvement-loop-v1\` · **Backlog:** \`KOS-E22-010\`

Use this checklist on **every release** after pure operational mode (Step 9 complete).

---

## Pre-release

- [ ] \`npm run test:ci:commercial-pilot-runbook:cert\` — full commercial pilot cert chain
- [ ] No hand-edited PASS in \`artifacts/*.json\` — SKIPPED ≠ PASS
- [ ] Staging smoke chain green for touched integration surfaces

## Post-release (within 24h)

- [ ] \`npm run ops:validate-continuous-improvement-loop -- --json\` — sync loop health
- [ ] \`npm run ops:sync-continuous-improvement-loop-progress-report -- --write\`
- [ ] Integration Health dashboard reviewed if channel credentials rotated

## Recurring (not per release)

| Cadence | Command |
|---------|---------|
| Weekly | \`npm run smoke:woo-shopify-live\`, \`npm run smoke:commerce-webhook-drill\` |
| Monthly | \`npm run smoke:pilot-metrics-baseline\` (per customer, Gate 1 isolation) |
| Quarterly | \`npm run smoke:pilot-forbidden-claims-enforcement\`, \`npm run smoke:competitor-feature-gap-matrix\` |
| Quarterly product | Review \`docs/feature-maturity-matrix.md\` + \`docs/competitor-leapfrog-roadmap-2026-05-28.md\` |

## New pilot onboarding

- [ ] \`SCALE_PER_CUSTOMER_GO_ISOLATION=1\` before \`npm run smoke:pilot-gono-go\`
- [ ] Separate GO artifacts per customer — never merge baselines

---

**Step 10 doc:** \`docs/next-step-10-continuous-improvement-loop-2026-05-28.md\`
`;
}

function main() {
  const write = process.argv.includes("--write");
  const content = buildReleaseChecklist();
  if (write) {
    writeFileSync(join(process.cwd(), CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC), content, "utf8");
    console.log(`Wrote ${CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC}`);
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
