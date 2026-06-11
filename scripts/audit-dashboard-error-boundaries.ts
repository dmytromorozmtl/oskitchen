/**
 * Audit dashboard page routes for error.tsx coverage.
 *
 * Usage:
 *   npm run audit:dashboard-error-boundaries
 *   npm run audit:dashboard-error-boundaries -- --write
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  assertDashboardErrorBoundariesAuditPasses,
  auditDashboardErrorBoundaries,
} from "@/lib/qa/dashboard-error-boundaries-audit";
import { DASHBOARD_ERROR_BOUNDARIES_AUDIT_ARTIFACT } from "@/lib/qa/dashboard-error-boundaries-policy";

const root = process.cwd();
const report = auditDashboardErrorBoundaries(root);

console.log(
  JSON.stringify(
    {
      pageRoutes: report.pageRoutes,
      errorBoundaries: report.errorBoundaries,
      missing: report.missing.length,
      passed: report.passed,
    },
    null,
    2,
  ),
);

if (process.argv.includes("--write")) {
  const artifactPath = join(root, DASHBOARD_ERROR_BOUNDARIES_AUDIT_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(
    artifactPath,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), ...report }, null, 2)}\n`,
    "utf8",
  );
  console.log(`[dashboard-error-boundaries] artifact → ${DASHBOARD_ERROR_BOUNDARIES_AUDIT_ARTIFACT}`);
}

assertDashboardErrorBoundariesAuditPasses(report);
