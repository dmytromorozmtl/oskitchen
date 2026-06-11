/**
 * Scaffold missing dashboard route error.tsx from ErrorBoundaryTemplate.
 *
 * Usage:
 *   npm run scaffold:dashboard-error-boundaries
 *   npm run scaffold:dashboard-error-boundaries -- --dry-run
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  assertDashboardErrorBoundariesAuditPasses,
  auditDashboardErrorBoundaries,
} from "@/lib/qa/dashboard-error-boundaries-audit";
import { DASHBOARD_ERROR_BOUNDARY_TEMPLATE_SOURCE } from "@/lib/qa/dashboard-error-boundary-template-source";

const root = process.cwd();
const dryRun = process.argv.includes("--dry-run");

const before = auditDashboardErrorBoundaries(root);
let created = 0;

for (const routeDir of before.missing) {
  const errorPath = join(root, routeDir, "error.tsx");
  if (dryRun) {
    console.log(`[dry-run] would create ${routeDir}/error.tsx`);
    continue;
  }
  mkdirSync(join(root, routeDir), { recursive: true });
  writeFileSync(errorPath, DASHBOARD_ERROR_BOUNDARY_TEMPLATE_SOURCE, "utf8");
  created += 1;
}

const after = auditDashboardErrorBoundaries(root);

console.log(
  JSON.stringify(
    {
      dryRun,
      created,
      beforeMissing: before.missing.length,
      afterMissing: after.missing.length,
      pageRoutes: after.pageRoutes,
      errorBoundaries: after.errorBoundaries,
    },
    null,
    2,
  ),
);

if (!dryRun) {
  assertDashboardErrorBoundariesAuditPasses(after);
  console.log("[scaffold-dashboard-error-boundaries] PASS — all page routes have error.tsx");
}
