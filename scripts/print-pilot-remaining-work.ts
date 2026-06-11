/**
 * Human-readable summary of paid-pilot completion (code vs staging).
 *
 *   npx tsx scripts/print-pilot-remaining-work.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { logger } from "@/lib/logger";

const ROOT = process.cwd();

function readJson<T>(rel: string): T | null {
  const p = join(ROOT, rel);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")) as T;
}

function main() {
  const allowlist = readJson<{ paths?: string[] }>("config/tenant-scope-pilot-allowlist.json");
  const allowPaths = allowlist?.paths?.length ?? 0;

  logger.cli("OS Kitchen — Paid pilot remaining work\n");
  logger.cli("CODE (repository) — expected complete");
  logger.cli("  • Phases 1–12 migrations + scope helpers");
  logger.cli("  • npm run verify:pilot-readiness");
  logger.cli("  • Tenant allowlist paths:", allowPaths === 0 ? "empty (clean)" : String(allowPaths));
  logger.cli("");
  logger.cli("STAGING / PROD — operator checklist");
  logger.cli("  1. Backup database");
  logger.cli("  2. npm run staging:secrets:generate  (+ Upstash in .env.staging.local)");
  logger.cli("  3. npm run staging:pilot:db          (migrate + backfill + report)");
  logger.cli("  4. npm run verify:pilot-readiness    (code + optional DB checks)");
  logger.cli("  5. npm run verify:staging-env        (full gate on Vercel staging)");
  logger.cli("  6. SMOKE_BASE_URL=... npm run smoke:golden-path-http");
  logger.cli("  7. npm run test:e2e:pilot");
  logger.cli("  8. Manual: docs/PILOT_GOLDEN_PATH_CHECKLIST.md");
  logger.cli("  9. Sign-off: docs/PAID_PILOT_GO_NO_GO_CHECKLIST.md");
  logger.cli("");
  logger.cli("POST-PILOT (not blocking first customer)");
  logger.cli("  • RBAC Phase B (docs/RBAC_MIGRATION_PLAN.md)");
  logger.cli("  • Report pagination, import worker, cron archive");
  logger.cli("  • ProductionWorkItem.workspaceId column (deferred)");
  logger.cli("");
  logger.cli("100% runbook: docs/PILOT_100_PERCENT_RUNBOOK.md");
  logger.cli("GO/NO-GO report: npm run pilot:go-no-go-report");
  logger.cli("Docs: docs/PAID_PILOT_GO_NO_GO_CHECKLIST.md");
}

main();
