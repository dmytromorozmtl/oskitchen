/**
 * Read-only staging / paid-pilot preflight (no DB writes).
 *
 *   npx tsx scripts/preflight-staging-pilot.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { cronArchiveStatus } from "../services/cron/cron-archive";
import { partitionCronRouteSlugs } from "../services/cron/cron-route-inventory";
import { listCronRouteSlugsFromDisk } from "../services/cron/cron-route-inventory";
import { reconcileProductionCronState } from "../services/cron/cron-reconciliation";
import { ALLOWED_PRODUCTION_CRON_SLUGS } from "../services/cron/production-manifest";

type Check = { id: string; ok: boolean; detail: string };

function checkEnv(name: string, required = false): Check {
  const v = process.env[name]?.trim();
  return {
    id: `env:${name}`,
    ok: required ? Boolean(v) : true,
    detail: required
      ? v
        ? "set"
        : "MISSING (required for this check group)"
      : v
        ? "set"
        : "not set (optional)",
  };
}

function main() {
  const checks: Check[] = [];

  checks.push(checkEnv("PLAYWRIGHT_BASE_URL"));
  checks.push(checkEnv("E2E_PILOT_EMAIL"));
  checks.push(checkEnv("E2E_PILOT_PASSWORD"));
  checks.push(checkEnv("DATABASE_URL", false));

  const slugs = listCronRouteSlugsFromDisk();
  const partition = partitionCronRouteSlugs(slugs);
  const reconciliation = reconcileProductionCronState({
    activeRouteSlugs: slugs,
  });
  checks.push({
    id: "cron:production-routes",
    ok: partition.missingRoutes.length === 0,
    detail:
      partition.missingRoutes.length === 0
        ? `${partition.production.length}/${ALLOWED_PRODUCTION_CRON_SLUGS.length} on disk`
        : `missing: ${partition.missingRoutes.join(", ")}`,
  });

  checks.push({
    id: "cron:experimental-cap",
    ok: partition.experimental.length <= 200,
    detail: `${partition.experimental.length} active experimental (cap 200; archive via PR-D)`,
  });

  const archive = cronArchiveStatus();
  checks.push({
    id: "cron:archive-status",
    ok: true,
    detail: `${archive.archivedTotal} archived, ${archive.activeExperimental} active experimental`,
  });

  const runbook = join(process.cwd(), "docs/WORKSPACE_MIGRATION_RUNBOOK_STAGING.md");
  checks.push({
    id: "docs:workspace-runbook",
    ok: existsSync(runbook),
    detail: existsSync(runbook) ? "present" : "missing",
  });

  const vercel = join(process.cwd(), "vercel.json");
  if (existsSync(vercel)) {
    const parsed = JSON.parse(readFileSync(vercel, "utf8")) as { crons?: { path: string }[] };
    const paths = (parsed.crons ?? []).map((c) => c.path);
    const rogue = paths.filter((p) => !ALLOWED_PRODUCTION_CRON_SLUGS.some((s) => p === `/api/cron/${s}`));
    checks.push({
    id: "vercel:crons-allowlist",
    ok: rogue.length === 0 && reconciliation.vercelJson.missingPaths.length === 0,
    detail:
      rogue.length || reconciliation.vercelJson.missingPaths.length
        ? [
            rogue.length ? `non-allowlist: ${rogue.join(", ")}` : null,
            reconciliation.vercelJson.missingPaths.length
              ? `missing: ${reconciliation.vercelJson.missingPaths.join(", ")}`
              : null,
          ]
            .filter(Boolean)
            .join("; ")
        : `${paths.length} scheduled (production only)`,
    });
  }

  checks.push({
    id: "cron:archive-reconciliation",
    ok:
      reconciliation.archive.archivedProductionSlugs.length === 0 &&
      reconciliation.archive.manifestMissingOnDisk.length === 0 &&
      reconciliation.archive.diskMissingFromManifest.length === 0,
    detail:
      reconciliation.archive.archivedProductionSlugs.length ||
      reconciliation.archive.manifestMissingOnDisk.length ||
      reconciliation.archive.diskMissingFromManifest.length
        ? [
            reconciliation.archive.archivedProductionSlugs.length
              ? `archived production: ${reconciliation.archive.archivedProductionSlugs.join(", ")}`
              : null,
            reconciliation.archive.manifestMissingOnDisk.length
              ? `manifest missing on disk: ${reconciliation.archive.manifestMissingOnDisk.join(", ")}`
              : null,
            reconciliation.archive.diskMissingFromManifest.length
              ? `disk missing from manifest: ${reconciliation.archive.diskMissingFromManifest.join(", ")}`
              : null,
          ]
            .filter(Boolean)
            .join("; ")
        : `${reconciliation.archive.archivedSlugs.length} archived routes reconciled`,
  });

  console.log("=== Staging / paid-pilot preflight (read-only) ===\n");
  let failed = 0;
  for (const c of checks) {
    const mark = c.ok ? "✓" : "✗";
    if (!c.ok) failed++;
    console.log(`${mark} ${c.id}: ${c.detail}`);
  }

  console.log("\n--- Recommended ops order ---");
  console.log("1. prisma migrate deploy (staging)");
  console.log("2. npm run workspace:backfill:phase1 && npm run workspace:backfill:status");
  console.log("3. npm run workspace:backfill:phase2 (after phase1 green)");
  console.log("4. npm run workspace:backfill:phase3 (CRM customers)");
  console.log("5. npm run workspace:backfill:phase4 (channel orders/conflicts/sync)");
  console.log("6. Configure GitHub secrets → workflow e2e-pilot.yml");
  console.log("7. npm run test:e2e:pilot against PLAYWRIGHT_BASE_URL");
  console.log("8. After 2w zero prod 404s: CONFIRM_CRON_ARCHIVE=1 npm run cron:archive:experimental -- --execute");

  process.exit(failed ? 1 : 0);
}

main();
