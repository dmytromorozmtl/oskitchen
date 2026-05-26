/**
 * Step 5 — Staff template tuning helper (RBAC Phase D).
 *
 *   npm run beta:tune-templates
 *   npm run beta:tune-templates -- --diff
 *   npm run beta:tune-templates -- --role=PACKER
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { CAPABILITY, STAFF_TEMPLATE_CAPABILITIES } from "@/lib/permissions/permission-matrix";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";
import { renderExecutiveSummary } from "@/lib/beta-ops/executive-summary";
import { loadBetaEnv } from "@/lib/beta-ops/load-beta-env";
import { loadProgramState, markStep, saveProgramState } from "@/lib/beta-ops/program-state";

function main() {
  loadBetaEnv();
  const roleFilter = process.argv.find((a) => a.startsWith("--role="))?.split("=")[1]?.trim();
  const showDiff = process.argv.includes("--diff");

  console.log("=== Step 5: Staff template tuning ===\n");
  console.log("Edit: lib/permissions/permission-matrix.ts → STAFF_TEMPLATE_CAPABILITIES\n");

  const lines: string[] = [
    "# Staff Template Tuning Guide",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Current templates → workspace permissions",
    "",
    "| Role | Capabilities | Workspace keys |",
    "|------|--------------|----------------|",
  ];

  for (const [role, caps] of Object.entries(STAFF_TEMPLATE_CAPABILITIES)) {
    if (roleFilter && role !== roleFilter) continue;
    const perms = workspacePermissionsFromStaffTemplate(role as never, "STAFF");
    lines.push(`| ${role} | ${caps.join(", ")} | ${[...perms].sort().join(", ")} |`);
    console.log(`${role}:`);
    console.log(`  capabilities: ${caps.join(", ")}`);
    console.log(`  workspace:    ${[...perms].sort().join(", ")}`);
    console.log("");
  }

  if (showDiff) {
    lines.push("## Common pilot adjustments", "", "```diff");
    lines.push("// Example: allow PACKER to read orders but not write");
    lines.push("// KITCHEN_LEAD: add CAPABILITY.ordersWrite if leads need status changes");
    lines.push("```", "");
    console.log("Suggested diff areas:");
    console.log("  - PACKER / VIEWER: limit to operational caps only");
    console.log("  - CUSTOMER_SERVICE: ordersRead + ordersWrite");
    console.log("  - ACCOUNTING: exportsSensitive only");
    console.log("");
    console.log("All capabilities:", Object.values(CAPABILITY).join(", "));
  }

  lines.push("", "## Verification after edit", "", "```bash");
  lines.push("npm test -- tests/unit/staff-template-workspace-permissions.test.ts");
  lines.push("npm run verify:staff-parity -- --owner-email=OWNER@EMAIL");
  lines.push("npm run test:security");
  lines.push("```", "");

  const out = join(process.cwd(), "docs", "artifacts", "BETA_TEMPLATE_TUNING.md");
  mkdirSync(join(process.cwd(), "docs", "artifacts"), { recursive: true });
  writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`Wrote ${out}`);

  const state = loadProgramState();
  markStep(state, 5, { ok: true, notes: "Review matrix edits + run tests", artifact: out });
  saveProgramState(state);
  writeFileSync(join(process.cwd(), "docs", "artifacts", "BETA_EXECUTIVE_SUMMARY.md"), renderExecutiveSummary(state), "utf8");
  console.log("\nStep 5 artifact saved. Re-run tests after editing permission-matrix.ts.");
}

main();
