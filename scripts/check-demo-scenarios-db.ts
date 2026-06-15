#!/usr/bin/env node
/**
 * Optional DB-backed golden demo audit. Read-only unless a future --seed path is added.
 *
 * Requires DEMO_AUDIT_WORKSPACE_ID or --workspace=<uuid>
 * Refuses NODE_ENV=production unless DEMO_DB_AUDIT_ALLOW_PRODUCTION=true
 */
import { auditDemoWorkspaceAgainstGoldenScenarios, summarizeDemoDbAudit } from "../services/demo/demo-scenario-db-audit-service";

function argWorkspace(): string {
  const fromEnv = process.env.DEMO_AUDIT_WORKSPACE_ID?.trim() ?? "";
  const argv = process.argv.find((a) => a.startsWith("--workspace="));
  const fromArg = argv?.slice("--workspace=".length).trim() ?? "";
  return fromArg || fromEnv;
}

async function main() {
  if (process.argv.includes("--seed")) {
    console.warn("[WARN] --seed is not implemented for this script — no data was written.");
  }

  if (process.env.NODE_ENV === "production" && process.env.DEMO_DB_AUDIT_ALLOW_PRODUCTION !== "true") {
    console.error("Refusing DB demo audit in production without DEMO_DB_AUDIT_ALLOW_PRODUCTION=true");
    process.exit(2);
  }

  const workspaceId = argWorkspace();
  if (!workspaceId) {
    console.error("Set DEMO_AUDIT_WORKSPACE_ID or pass --workspace=<workspace-uuid>");
    process.exit(2);
  }

  const { ownerUserId, demoMode, rows } = await auditDemoWorkspaceAgainstGoldenScenarios(workspaceId);
  const summary = summarizeDemoDbAudit(rows);

  console.log(`Workspace: ${workspaceId}`);
  console.log(`Owner profile: ${ownerUserId || "—"} · demoMode: ${demoMode ? "on" : "off"}\n`);

  for (const r of rows) {
    console.log(`[${r.status}] ${r.scenarioId} — ${r.title}`);
    for (const c of r.checks) {
      console.log(`   [${c.status}] ${c.id}: ${c.message}`);
    }
  }

  console.log(`\nSummary: PASS ${summary.passCount} · WARN ${summary.warnCount} · FAIL ${summary.failCount}`);

  if (summary.failCount > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
