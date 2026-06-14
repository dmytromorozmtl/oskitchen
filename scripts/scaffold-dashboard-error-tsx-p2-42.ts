/**
 * Ensure P2-42 operator routes use templated error.tsx.
 *
 * Usage: npx tsx scripts/scaffold-dashboard-error-tsx-p2-42.ts
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { auditDashboardErrorTsxP242 } from "@/lib/frontend/dashboard-error-tsx-p2-42-audit";
import {
  DASHBOARD_ERROR_TSX_P2_42_ROUTES,
  errorUsesBoundaryTemplate,
} from "@/lib/frontend/dashboard-error-tsx-p2-42-policy";
import { DASHBOARD_ERROR_BOUNDARY_TEMPLATE_SOURCE } from "@/lib/qa/dashboard-error-boundary-template-source";

const ROOT = process.cwd();
let created = 0;
let migrated = 0;

for (const route of DASHBOARD_ERROR_TSX_P2_42_ROUTES) {
  const errorPath = join(ROOT, route.errorPath);
  if (!existsSync(errorPath)) {
    writeFileSync(errorPath, DASHBOARD_ERROR_BOUNDARY_TEMPLATE_SOURCE, "utf8");
    created += 1;
    continue;
  }

  const source = readFileSync(errorPath, "utf8");
  if (!errorUsesBoundaryTemplate(source)) {
    writeFileSync(errorPath, DASHBOARD_ERROR_BOUNDARY_TEMPLATE_SOURCE, "utf8");
    migrated += 1;
  }
}

const after = auditDashboardErrorTsxP242(ROOT);
console.log(
  JSON.stringify(
    {
      created,
      migrated,
      routeCount: after.routeCount,
      templateCount: after.templateCount,
      missing: after.missing.length,
      nonTemplate: after.nonTemplate.length,
      passed: after.passed,
    },
    null,
    2,
  ),
);

if (!after.passed) {
  console.error("[scaffold-dashboard-error-tsx-p2-42] FAIL", after);
  process.exit(1);
}

console.log("[scaffold-dashboard-error-tsx-p2-42] PASS — 45 routes use ErrorBoundaryTemplate");
