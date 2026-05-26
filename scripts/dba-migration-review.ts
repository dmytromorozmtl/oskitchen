/**
 * DBA migration approval packet generator (read-only).
 *
 *   npx tsx scripts/dba-migration-review.ts
 *   npx tsx scripts/dba-migration-review.ts --write docs/artifacts/DBA_MIGRATION_PACKET.md
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const REMEDIATION_MIGRATIONS = [
  "20260517120000_workspace_phase1_order_menu_product",
  "20260517140000_workspace_phase2_integration_webhook",
] as const;

type MigrationRow = {
  name: string;
  sqlPath: string;
  sqlBytes: number;
  remediation: boolean;
  risk: "LOW" | "MEDIUM" | "HIGH";
  notes: string[];
};

function classifyRisk(sql: string, name: string): MigrationRow["risk"] {
  const upper = sql.toUpperCase();
  if (upper.includes("DROP TABLE") || upper.includes("DROP COLUMN") || upper.includes("TRUNCATE")) {
    return "HIGH";
  }
  if (upper.includes("ALTER TABLE") && upper.includes("NOT NULL") && !upper.includes("IF NOT EXISTS")) {
    return "MEDIUM";
  }
  if (name.includes("workspace_phase")) return "LOW";
  return "LOW";
}

function riskNotes(sql: string, name: string): string[] {
  const notes: string[] = [];
  if (sql.includes("ADD COLUMN IF NOT EXISTS")) {
    notes.push("Additive nullable columns — no table rewrite required on PG 11+.");
  }
  if (name.includes("workspace_phase1")) {
    notes.push("Backfill required after deploy: npm run backfill:workspace-id");
    notes.push("Runtime already sets workspaceId on new orders.");
  }
  if (name.includes("workspace_phase2")) {
    notes.push("Backfill required: npm run backfill:workspace-phase2");
  }
  if (sql.includes("CREATE INDEX IF NOT EXISTS")) {
    notes.push("Indexes created CONCURRENTLY-safe via IF NOT EXISTS (brief lock on first create).");
  }
  notes.push("Rollback: columns are nullable; app tolerates NULL workspace_id until backfill completes.");
  return notes;
}

function listMigrations(): MigrationRow[] {
  const dir = join(process.cwd(), "prisma", "migrations");
  const folders = readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name)
    .sort();

  return folders.map((name) => {
    const sqlPath = join(dir, name, "migration.sql");
    const sql = existsSync(sqlPath) ? readFileSync(sqlPath, "utf8") : "";
    const remediation = (REMEDIATION_MIGRATIONS as readonly string[]).includes(name);
    return {
      name,
      sqlPath,
      sqlBytes: Buffer.byteLength(sql, "utf8"),
      remediation,
      risk: classifyRisk(sql, name),
      notes: riskNotes(sql, name),
    };
  });
}

function migrateStatus(): string {
  if (!process.env.DATABASE_URL?.trim()) {
    return "DATABASE_URL not set — cannot query migrate status.";
  }
  try {
    return execSync("npx prisma migrate status 2>&1", { encoding: "utf8", maxBuffer: 4_000_000 });
  } catch (e) {
    const stdout =
      e && typeof e === "object" && "stdout" in e ? String((e as { stdout?: string }).stdout ?? "") : "";
    const stderr =
      e && typeof e === "object" && "stderr" in e ? String((e as { stderr?: string }).stderr ?? "") : "";
    return (stdout + stderr).slice(0, 8000) || String(e);
  }
}

function renderPacket(rows: MigrationRow[], status: string): string {
  const remediation = rows.filter((r) => r.remediation);
  const lines: string[] = [
    "# DBA Migration Approval Packet — KitchenOS",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Executive summary",
    "",
    "Remediation migrations add **nullable** `workspace_id` columns and indexes. They are **additive** and safe to deploy before backfill. Application code already writes `workspaceId` on new rows.",
    "",
    "| Migration | Risk | Backfill |",
    "|-----------|------|----------|",
  ];

  for (const r of remediation) {
    lines.push(`| \`${r.name}\` | ${r.risk} | Required after deploy |`);
  }

  lines.push(
    "",
    "## Pre-deploy checklist (DBA)",
    "",
    "1. [ ] Snapshot / PITR confirmed for staging DB",
    "2. [ ] Maintenance window communicated (index creation may lock briefly)",
    "3. [ ] `DIRECT_URL` points to session pooler `:5432` (not transaction pooler)",
    "4. [ ] Approve `npx prisma migrate deploy` on staging first, then production after smoke",
    "5. [ ] Post-deploy: `npm run staging:remediation-all` or backfill scripts manually",
    "6. [ ] Verify: `npm run check:backfill` → all OK",
    "",
    "## Remediation migration detail",
    "",
  );

  for (const r of remediation) {
    lines.push(`### ${r.name}`, "", `- **Risk:** ${r.risk}`, `- **SQL size:** ${r.sqlBytes} bytes`, "");
    for (const n of r.notes) lines.push(`- ${n}`);
    lines.push("");
  }

  lines.push("## Full migration inventory", "", "| Migration | Remediation | Risk | Bytes |", "|-----------|-------------|------|-------|");
  for (const r of rows) {
    lines.push(`| \`${r.name}\` | ${r.remediation ? "yes" : "—"} | ${r.risk} | ${r.sqlBytes} |`);
  }

  lines.push("", "## `prisma migrate status` (this host)", "", "```", status.trim(), "```", "");

  return lines.join("\n");
}

function main() {
  const writeArg = process.argv.find((a) => a.startsWith("--write"));
  const rows = listMigrations();
  const status = migrateStatus();
  const packet = renderPacket(rows, status);

  console.log(packet);

  if (writeArg) {
    const outPath = writeArg.includes("=") ? writeArg.split("=")[1]! : "docs/artifacts/DBA_MIGRATION_PACKET.md";
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, packet, "utf8");
    console.error(`\nWrote ${outPath}`);
  }

  const remediationPending = remediationRowsPending(status, rows);
  if (remediationPending.length > 0) {
    console.error("\nACTION: Remediation migrations may be pending apply:", remediationPending.join(", "));
  }
}

function remediationRowsPending(status: string, rows: MigrationRow[]): string[] {
  const pending: string[] = [];
  for (const r of rows.filter((x) => x.remediation)) {
    if (status.includes(r.name) && /not yet been applied|following migration have not/i.test(status)) {
      pending.push(r.name);
    }
  }
  return pending;
}

main();
