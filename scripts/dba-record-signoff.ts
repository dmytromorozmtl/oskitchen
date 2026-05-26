/**
 * Record DBA written approval (step 1 gate).
 *
 *   npm run dba:record-signoff -- --by="Jane DBA" --ticket=INFRA-4821
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit?.slice(prefix.length).trim();
}

function main() {
  const by = arg("by");
  const ticket = arg("ticket") ?? "";
  if (!by) {
    console.error("Usage: npm run dba:record-signoff -- --by=\"DBA Name\" [--ticket=JIRA-123]");
    process.exit(1);
  }

  const payload = {
    approved: true,
    approvedBy: by,
    approvedAt: new Date().toISOString(),
    ticket,
    migrations: [
      "20260517120000_workspace_phase1_order_menu_product",
      "20260517140000_workspace_phase2_integration_webhook",
    ],
  };

  const dir = join(process.cwd(), "docs", "artifacts");
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "DBA_SIGNOFF.json");
  writeFileSync(path, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Recorded DBA sign-off → ${path}`);
  console.log("Re-run: npm run beta:launch -- --step=1");
}

main();
