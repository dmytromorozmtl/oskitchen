/**
 * Generates SQL to add nullable workspace_id + index for all Prisma models
 * that have userId but no workspaceId field yet.
 *
 *   npx tsx scripts/codegen-workspace-id-migration-sql.ts > artifacts/workspace-id-columns.sql
 *
 * Apply on staging first. Then run backfill phases. Then NOT NULL (separate migration).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { buildWorkspaceAuditReport } from "./lib/prisma-workspace-audit";

/** Prisma model name → snake_case table (heuristic; verify against @@map). */
function modelToTable(model: string): string {
  const special: Record<string, string> = {
    UserProfile: "user_profiles",
    KitchenCustomer: "kitchen_customers",
    IntegrationConnection: "integration_connections",
    WebhookEvent: "webhook_events",
    CateringQuote: "catering_quotes",
  };
  if (special[model]) return special[model];

  const snake = model
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");
  return snake.endsWith("s") ? snake : `${snake}s`;
}

function main() {
  const report = buildWorkspaceAuditReport();
  const lines: string[] = [
    "-- AUTO-GENERATED — review before apply",
    `-- Models: ${report.needsMigration}`,
    `-- Generated: ${new Date().toISOString()}`,
    "BEGIN;",
    "",
  ];

  for (const model of report.needsMigrationModels) {
    const table = modelToTable(model);
    lines.push(`-- ${model}`);
    lines.push(
      `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS workspace_id UUID;`,
    );
    lines.push(
      `CREATE INDEX IF NOT EXISTS "${table}_workspace_id_idx" ON "${table}" (workspace_id);`,
    );
    lines.push("");
  }

  lines.push("COMMIT;");
  const sql = lines.join("\n");
  const outDir = join(process.cwd(), "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "workspace-id-columns.sql");
  writeFileSync(outPath, sql, "utf8");
  console.log(`Wrote ${report.needsMigration} table ALTERs → ${outPath}`);
  console.log("Review @@map names in prisma/schema.prisma before running on DB.");
}

main();
