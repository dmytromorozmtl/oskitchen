/**
 * CI guard: pilot dashboard pages must not pass session user id to owner-scoped loaders.
 *
 *   npx tsx scripts/validate-dashboard-owner-scope.ts
 */
import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { readdirSync, statSync } from "node:fs";

const ROOT = process.cwd();
const SCAN = "app/dashboard";

const OWNER_LOADER =
  /(listMappings|detectConflicts|loadMatchableCandidates|listAliases|listEvents|listImportBatches|listProjects|getProject|workbenchSnapshot|loadCostingOverviewData|loadAvtReport|loadMealPlanOverviewKpis|backfillLegacySubscriptions|loadDataOperationsOverview|listImportJobsForUser|getImportJobForUser|listExportJobsForUser|listValidationErrorPreviewRows|listIntegrationHealthCards|listRecentScans|listOpenSessions|loadPosTerminalBootstrap|listPosRegisters|buildDeterministicSnapshot|loadPurchasingDashboard|trainingKpis|listPrograms|listAssignments|listSops|listSimulations|listCertifications|loadDemandCommandCenterPayload|loadIngredientDemandSettingsForUser|loadOperationHealth|loadWorkspaceObservabilityPanel|evaluateInventoryShortageReadiness|loadCateringQuoteKpis|getLastDemoScenarioSeedAt|listStorefrontMediaForOwner|loadTodayCommandCenter|loadPackingTasksForDate|loadPackingWavesForDate|getLabelCommandCenterStats|listProductsNeedingReview|loadStorefrontMediaAssetsForUser|listActivityForEntity|HomeOverview)\(/;

const FORBIDDEN: Array<{ id: string; pattern: RegExp }> = [
  { id: "home-overview-session", pattern: /HomeOverview\s+userId=\{sessionUser\.id\}/ },
  { id: "today-loader-session", pattern: /loadTodayCommandCenter\(sessionUser\.id\)/ },
  { id: "today-view-session", pattern: /TodayCommandCenterView[\s\S]{0,120}userId=\{sessionUser\.id\}/ },
  { id: "packing-tasks-session", pattern: /loadPackingTasksForDate\(sessionUser\.id/ },
  { id: "packing-waves-session", pattern: /loadPackingWavesForDate\(sessionUser\.id/ },
  { id: "media-assets-session", pattern: /loadStorefrontMediaAssetsForUser\(sessionUser\.id\)/ },
  { id: "nutrition-stats-session", pattern: /getLabelCommandCenterStats\(user\.id\)/ },
  {
    id: "owner-loader-user-id",
    pattern: new RegExp(`${OWNER_LOADER.source}user\\.id`),
  },
];

function walk(dir: string, out: string[] = []): string[] {
  const abs = join(ROOT, dir);
  if (!statSync(abs, { throwIfNoEntry: false })) return out;
  for (const ent of readdirSync(abs, { withFileTypes: true })) {
    if (ent.name.startsWith(".")) continue;
    const p = join(abs, ent.name);
    const rel = join(dir, ent.name);
    if (ent.isDirectory()) walk(rel, out);
    else if (ent.name.endsWith(".tsx") || ent.name.endsWith(".ts")) out.push(rel);
  }
  return out;
}

function main() {
  const files = walk(SCAN);
  const violations: string[] = [];

  for (const rel of files) {
    const content = readFileSync(join(ROOT, rel), "utf8");
    if (!content.includes("dataUserId")) continue;
    for (const rule of FORBIDDEN) {
      if (rule.pattern.test(content)) {
        violations.push(`${rel}: ${rule.id}`);
      }
    }
    if (
      content.includes("sessionUser: user") &&
      OWNER_LOADER.test(content) &&
      /\buser\.id\b/.test(content) &&
      !/findAdminStorefront\(user\.id/.test(content) &&
      !/resolveStorefrontAdminAccess\(user\.id/.test(content) &&
      !/resolveOwnerStorefront\(user\.id/.test(content) &&
      !/listOwnerStorefronts\(user\.id/.test(content)
    ) {
      violations.push(`${rel}: session-user-alias-with-user.id`);
    }
  }

  if (violations.length === 0) {
    console.log(`✓ Dashboard owner scope guard: ${files.length} files, no session-user data loaders.`);
    return;
  }

  console.error(`Dashboard owner scope guard: ${violations.length} violation(s)\n`);
  for (const v of violations) console.error(`  ${v}`);
  console.error("\nUse dataUserId (tenant owner) for kitchen data, not sessionUser.id.");
  process.exitCode = 1;
}

main();
