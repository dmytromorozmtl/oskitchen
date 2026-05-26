/**
 * Human-readable summary of paid-pilot completion (code vs staging).
 *
 *   npx tsx scripts/print-pilot-remaining-work.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

function readJson<T>(rel: string): T | null {
  const p = join(ROOT, rel);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")) as T;
}

function main() {
  const allowlist = readJson<{ paths?: string[] }>("config/tenant-scope-pilot-allowlist.json");
  const allowPaths = allowlist?.paths?.length ?? 0;

  console.log("KitchenOS — Paid pilot remaining work\n");
  console.log("CODE (repository) — expected complete");
  console.log("  • Phases 1–12 migrations + scope helpers");
  console.log("  • npm run verify:pilot-readiness");
  console.log("  • Tenant allowlist paths:", allowPaths === 0 ? "empty (clean)" : String(allowPaths));
  console.log("");
  console.log("STAGING / PROD — operator checklist");
  console.log("  1. Backup database");
  console.log("  2. npm run staging:secrets:generate  (+ Upstash in .env.staging.local)");
  console.log("  3. npm run staging:pilot:db          (migrate + backfill + report)");
  console.log("  4. npm run verify:pilot-readiness    (code + optional DB checks)");
  console.log("  5. npm run verify:staging-env        (full gate on Vercel staging)");
  console.log("  6. SMOKE_BASE_URL=... npm run smoke:golden-path-http");
  console.log("  7. npm run test:e2e:pilot");
  console.log("  8. Manual: docs/PILOT_GOLDEN_PATH_CHECKLIST.md");
  console.log("  9. Sign-off: docs/PAID_PILOT_GO_NO_GO_CHECKLIST.md");
  console.log("");
  console.log("POST-PILOT (not blocking first customer)");
  console.log("  • RBAC Phase B (docs/RBAC_MIGRATION_PLAN.md)");
  console.log("  • Report pagination, import worker, cron archive");
  console.log("  • ProductionWorkItem.workspaceId column (deferred)");
  console.log("");
  console.log("100% runbook: docs/PILOT_100_PERCENT_RUNBOOK.md");
  console.log("GO/NO-GO report: npm run pilot:go-no-go-report");
  console.log("Docs: docs/PAID_PILOT_GO_NO_GO_CHECKLIST.md");
}

main();
