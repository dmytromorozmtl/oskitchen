#!/usr/bin/env npx tsx
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { MAINTENANCE_MODE_RHYTHM_CALENDAR_DOC, MAINTENANCE_MODE_STEP12_DOC } from "@/lib/commercial/maintenance-mode-phases-era24";

function buildRhythmCalendar(): string {
  return `# KitchenOS — Maintenance mode rhythm calendar

**Policy:** \`era24-maintenance-mode-v1\` · **Backlog:** \`KOS-E24-012\`

Operator calendar after commercial pilot path complete (Steps 1–11).

---

## Weekly rhythm

| Day | Action | Route / command |
|-----|--------|-----------------|
| Monday | Owner Briefing → Order Hub handoffs | \`/dashboard/today\`, \`/dashboard/order-hub\` |
| Wednesday | Integration Health review | \`/dashboard/integration-health\`, \`smoke:woo-shopify-live\` |
| Friday | Progress sync | \`ops:sync-continuous-improvement-loop-progress-report -- --write\`, \`ops:sync-sustained-product-evolution-progress-report -- --write\` |

---

## Monthly rhythm

| Week | Action |
|------|--------|
| Week 1 | \`smoke:pilot-metrics-baseline\` per active customer |
| Week 2 | Triage \`operator_feedback_score\` → \`docs/implementation-backlog.md\` |
| Week 3 | Review Platform ops \`#continuous-improvement-loop\` |
| Week 4 | Review Platform ops \`#sustained-product-evolution\` |

---

## Quarterly rhythm

- Governance smokes: forbidden claims + competitor matrix
- Feature maturity matrix refresh
- Competitor leapfrog roadmap review
- GTM landing pages vs forbidden claims
- Ownership matrix review

---

## Per release

\`\`\`bash
npm run test:ci:commercial-pilot-runbook:cert
npm run ops:validate-continuous-improvement-loop -- --json
npm run ops:validate-sustained-product-evolution -- --json
npm run ops:validate-maintenance-mode -- --json
\`\`\`

---

## Per new pilot

1. \`SCALE_PER_CUSTOMER_GO_ISOLATION=1\`
2. Isolated GO artifacts per customer
3. Launch Wizard entry — not daily ops

---

**Step 12 doc:** \`${MAINTENANCE_MODE_STEP12_DOC}\`
`;
}

function main() {
  const write = process.argv.includes("--write");
  const content = buildRhythmCalendar();
  if (write) {
    writeFileSync(join(process.cwd(), MAINTENANCE_MODE_RHYTHM_CALENDAR_DOC), content, "utf8");
    console.log(`Wrote ${MAINTENANCE_MODE_RHYTHM_CALENDAR_DOC}`);
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
