/**
 * Generate NOT NULL migration for workspace_id (run ONLY after post-backfill verify passes).
 *
 *   npx tsx scripts/generate-workspace-not-null-migration.ts
 */
import fs from "node:fs";
import path from "node:path";

import { buildWorkspaceAuditReport } from "./lib/prisma-workspace-audit";
import { listScopedUserTables } from "./lib/workspace-table-map";

const OUT_DIR = path.join(
  process.cwd(),
  "prisma/migrations/20260525000000_workspace_id_not_null",
);

function main() {
  const report = buildWorkspaceAuditReport();
  if (report.needsMigration > 0) {
    console.error(`Abort: ${report.needsMigration} models still lack workspaceId in schema.`);
    process.exit(1);
  }

  const tables = listScopedUserTables();
  const lines: string[] = [
    "-- RUN ONLY AFTER: npm run workspace:post-backfill:verify",
    "-- Sets workspace_id NOT NULL on all user-scoped tables.",
    "",
    "BEGIN;",
    "",
  ];

  for (const t of tables) {
    lines.push(`-- ${t.model}`);
    lines.push(`ALTER TABLE "${t.table}" ALTER COLUMN "workspace_id" SET NOT NULL;`);
    lines.push("");
  }

  lines.push("COMMIT;");
  lines.push("");

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, "migration.sql");
  fs.writeFileSync(outPath, lines.join("\n"));
  console.log(`Wrote ${tables.length} ALTERs → ${outPath}`);
  console.log("Do not apply until workspace:post-backfill:verify is clean.");
}

main();
