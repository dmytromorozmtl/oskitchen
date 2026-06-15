/**
 * Step 3 — Week 2 review: aggregate daily ops + staff/RBAC feedback.
 *
 *   npm run beta:week2-review
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadCohortRegistry, DEFAULT_REGISTRY_PATH } from "@/lib/beta-ops/cohort-registry";
import { renderExecutiveSummary } from "@/lib/beta-ops/executive-summary";
import { loadBetaEnv } from "@/lib/beta-ops/load-beta-env";
import type { DailyOpsReport } from "@/lib/beta-ops/types";
import { markStep, loadProgramState, saveProgramState } from "@/lib/beta-ops/program-state";
import { summarizeBetaFeedback } from "@/services/beta-ops/feedback-summary-service";
import { STAFF_TEMPLATE_CAPABILITIES } from "@/lib/permissions/permission-matrix";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

function loadDailyOpsReports(dir: string): DailyOpsReport[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.startsWith("BETA_DAILY_OPS_") && f.endsWith(".json"))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(dir, f), "utf8")) as DailyOpsReport;
      } catch {
        return null;
      }
    })
    .filter((r): r is DailyOpsReport => r != null)
    .sort((a, b) => a.day.localeCompare(b.day));
}

async function main() {
  loadBetaEnv();
  const artifacts = join(process.cwd(), "docs", "artifacts");
  const registry = loadCohortRegistry();
  const emails = registry?.kitchens.map((k) => k.email) ?? [];

  console.log("=== Step 3: Week 2 review ===\n");

  const reports = loadDailyOpsReports(artifacts);
  const feedback = emails.length > 0 ? await summarizeBetaFeedback({ ownerEmails: emails }) : null;

  const lines: string[] = [
    "# Beta Week 2 Review",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Daily ops trend",
    "",
  ];

  if (reports.length === 0) {
    lines.push("_No BETA_DAILY_OPS_*.json files — run `npm run beta:daily-ops` during Week 1._", "");
  } else {
    lines.push("| Day | Live | Unhealthy | Ready |");
    lines.push("|-----|------|-----------|-------|");
    for (const r of reports) {
      lines.push(
        `| ${r.day} | ${r.summary.live} | ${r.summary.unhealthy} | ${r.summary.readyForCheckIn ? "yes" : "no"} |`,
      );
    }
    lines.push("");
    for (const r of reports) {
      lines.push(`### ${r.day}`);
      for (const k of r.kitchens) {
        lines.push(
          `- **${k.email}**: 7d orders=${k.metrics.ordersLast7d}${k.alerts.length ? ` — alerts: ${k.alerts.join("; ")}` : ""}`,
        );
      }
      lines.push("");
    }
  }

  lines.push("## Staff template matrix (Phase D)", "", "| Template | Workspace permissions |");
  lines.push("|----------------|----------------------|");
  for (const [role, caps] of Object.entries(STAFF_TEMPLATE_CAPABILITIES)) {
    const perms = workspacePermissionsFromStaffTemplate(role as never, "STAFF");
    lines.push(`| ${role} | ${[...perms].sort().join(", ")} |`);
  }
  lines.push("");

  lines.push("## Feedback summary", "");
  if (feedback) {
    lines.push(`- Beta feedback rows (14d): ${feedback.betaFeedbackCount}`);
    lines.push(`- App feedback rows (14d): ${feedback.appFeedbackCount}`);
    if (feedback.topCategories.length) {
      lines.push("- Top categories:");
      for (const c of feedback.topCategories) {
        lines.push(`  - ${c.category}: ${c.count}`);
      }
    }
    if (feedback.recent.length) {
      lines.push("", "### Recent", "");
      for (const r of feedback.recent) {
        lines.push(`- [${r.source}] ${r.category} (${r.severity}) ${r.createdAt.slice(0, 10)}`);
      }
    }
  } else {
    lines.push("_No cohort emails in registry._");
  }

  lines.push(
    "",
    "## Recommended template tuning (step 5)",
    "",
    "Review pilot confusion and edit `lib/permissions/permission-matrix.ts`:",
    "",
    "1. PACKER — confirm no billing/integrations",
    "2. MANAGER — confirm integrations + staff.manage",
    "3. VIEWER — read-only (workspace.view only)",
    "",
    "Then: `npm run beta:tune-templates -- --diff` and `npm run verify:staff-parity`",
    "",
  );

  const mdPath = join(artifacts, "BETA_WEEK2_REVIEW.md");
  mkdirSync(artifacts, { recursive: true });
  writeFileSync(mdPath, lines.join("\n"), "utf8");

  const feedbackJson = join(artifacts, "BETA_STAFF_FEEDBACK.json");
  writeFileSync(
    feedbackJson,
    JSON.stringify({ feedback, staffTemplates: STAFF_TEMPLATE_CAPABILITIES }, null, 2),
    "utf8",
  );

  console.log(`Wrote ${mdPath}`);
  console.log(`Wrote ${feedbackJson}`);

  const state = loadProgramState();
  markStep(state, 3, { ok: true, artifact: mdPath });
  saveProgramState(state);
  writeFileSync(join(artifacts, "BETA_EXECUTIVE_SUMMARY.md"), renderExecutiveSummary(state), "utf8");

  console.log("\nStep 3 complete — proceed to week 3–4 go/no-go when ready.");
  console.log("  Next: npm run beta:go-no-go");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
