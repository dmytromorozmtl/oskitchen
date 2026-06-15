#!/usr/bin/env node
/**
 * Static audit: golden demo scenario **plans** vs required record kinds.
 * No database access. Exit 1 if any scenario FAILs.
 */
import { auditGoldenDemoScenarioPlans, summarizeDemoScenarioPlanAudit } from "../services/demo/demo-scenario-audit-service";

const rows = auditGoldenDemoScenarioPlans();
const summary = summarizeDemoScenarioPlanAudit(rows);

for (const r of rows) {
  const parts = [`[${r.status}]`, r.scenarioId, "—", r.title];
  if (r.missingMust.length) parts.push(`MISSING must: ${r.missingMust.join(", ")}`);
  if (r.missingShould.length) parts.push(`missing should: ${r.missingShould.join(", ")}`);
  console.log(parts.join(" "));
}

console.log(`\nSummary: PASS ${summary.passCount} · WARN ${summary.warnCount} · FAIL ${summary.failCount}`);

if (summary.failCount > 0) {
  process.exit(1);
}
