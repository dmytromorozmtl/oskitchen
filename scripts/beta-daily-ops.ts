/**
 * Week 1 daily operations — preflight all live cohort kitchens + support check.
 *
 *   npm run beta:daily-ops
 *   npm run beta:daily-ops -- --registry
 *   BETA_COHORT_EMAILS=a@,b@ npm run beta:daily-ops
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  DEFAULT_REGISTRY_PATH,
  loadCohortRegistry,
  parseEmailList,
  saveCohortRegistry,
  upsertKitchen,
} from "@/lib/beta-ops/cohort-registry";
import type { DailyOpsReport } from "@/lib/beta-ops/types";
import { healthyStreak } from "@/lib/beta-ops/daily-ops-streak";
import { renderExecutiveSummary } from "@/lib/beta-ops/executive-summary";
import { guardStep } from "@/lib/beta-ops/step-guards";
import { loadBetaEnv } from "@/lib/beta-ops/load-beta-env";
import { formatDailyOpsSlackMessage, postSlackWebhook } from "@/lib/beta-ops/slack-notify";
import { loadProgramState, markStep, saveProgramState } from "@/lib/beta-ops/program-state";
import { runKitchenPreflight } from "@/services/beta-ops/kitchen-preflight-service";

function supportCheck() {
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  const slack = process.env.BETA_SLACK_WEBHOOK_URL?.trim();
  return {
    emailConfigured: Boolean(email),
    slackWebhookConfigured: Boolean(slack),
  };
}

async function main() {
  loadBetaEnv();
  const state = loadProgramState();
  const guard = guardStep(2, state);
  if (!guard.ok) {
    for (const b of guard.blockers) console.error(`BLOCK ${b}`);
    process.exit(1);
  }
  for (const w of guard.warnings) console.warn(`WARN ${w}`);

  const registry = loadCohortRegistry();
  const emails =
    registry?.kitchens.filter((k) => k.status === "live" || k.status === "preflight_ok").map((k) => k.email) ??
    parseEmailList(process.env.BETA_COHORT_EMAILS) ??
    parseEmailList(process.argv.find((a) => a.startsWith("--emails="))?.split("=").slice(1).join("="));

  if (emails.length === 0) {
    console.error("No kitchens — run beta:go-live first or set BETA_COHORT_EMAILS");
    process.exit(1);
  }

  const day = new Date().toISOString().slice(0, 10);
  console.log(`=== Beta daily ops — ${day} ===\n`);

  const support = supportCheck();
  console.log(`Support email: ${support.emailConfigured ? "OK" : "MISSING (NEXT_PUBLIC_SUPPORT_EMAIL)"}`);
  console.log(`Slack webhook: ${support.slackWebhookConfigured ? "OK" : "optional (BETA_SLACK_WEBHOOK_URL)"}\n`);

  let reg = registry ?? { version: 1 as const, cohortName: "adhoc", createdAt: day, updatedAt: day, kitchens: [] };
  const rows: DailyOpsReport["kitchens"] = [];
  let unhealthy = 0;

  for (const email of emails) {
    const result = await runKitchenPreflight(email);
    const alerts: string[] = [];
    if (!result) {
      alerts.push("user not found");
      unhealthy++;
      rows.push({
        email,
        status: "paused",
        preflightOk: false,
        metrics: { orderCount: 0, ordersLast7d: 0, staffMembers: 0, integrations: 0 },
        alerts,
      });
      continue;
    }

    if (!result.ready) alerts.push("preflight blocking gate failed");
    if (result.gates.some((g) => g.label === "Demo mode off" && !g.ok)) {
      alerts.push("demo mode still on");
    }
    if (result.metrics.ordersLast7d === 0) alerts.push("no orders in last 7 days");
    if (result.metrics.staffMembers === 0) alerts.push("no staff members");

    const preflightOk = result.ready;
    if (!preflightOk || alerts.length > 1) unhealthy++;

    upsertKitchen(reg, {
      email,
      status: preflightOk ? "live" : "paused",
      lastPreflightAt: new Date().toISOString(),
      lastPreflightOk: preflightOk,
      businessName: result.businessName ?? undefined,
    });

    const tag = preflightOk && alerts.length <= 1 ? "OK" : "WARN";
    console.log(
      `${tag.padEnd(5)} ${email} — orders=${result.metrics.orderCount} (7d=${result.metrics.ordersLast7d}) alerts=[${alerts.join("; ") || "none"}]`,
    );

    rows.push({
      email,
      status: preflightOk ? "live" : "paused",
      preflightOk,
      metrics: result.metrics,
      alerts,
    });
  }

  saveCohortRegistry(reg);

  const report: DailyOpsReport = {
    generatedAt: new Date().toISOString(),
    day,
    cohortName: reg.cohortName,
    kitchens: rows,
    support,
    summary: {
      live: rows.filter((r) => r.status === "live").length,
      unhealthy,
      readyForCheckIn: unhealthy === 0,
    },
  };

  const outDir = join(process.cwd(), "docs", "artifacts");
  mkdirSync(outDir, { recursive: true });
  const jsonPath = join(outDir, `BETA_DAILY_OPS_${day}.json`);
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`\nWrote ${jsonPath}`);
  console.log(`Summary: live=${report.summary.live} unhealthy=${report.summary.unhealthy}`);
  const streak = healthyStreak();
  console.log(`Healthy streak: ${streak.streak} day(s) (${streak.totalDays} total reports)`);

  const slackUrl = process.env.BETA_SLACK_WEBHOOK_URL?.trim();
  if (slackUrl) {
    const text = formatDailyOpsSlackMessage(report);
    const posted = await postSlackWebhook({ webhookUrl: slackUrl, text });
    console.log(posted.ok ? "OK Slack digest posted" : `WARN Slack post HTTP ${posted.status}`);
  }

  markStep(state, 2, {
    ok: unhealthy === 0,
    notes: `daily ${day}`,
    artifact: jsonPath,
  });
  saveProgramState(state);
  writeFileSync(join(outDir, "BETA_EXECUTIVE_SUMMARY.md"), renderExecutiveSummary(state), "utf8");

  if (!support.emailConfigured) {
    console.warn("\nWARN: Configure NEXT_PUBLIC_SUPPORT_EMAIL for in-app support links.");
  }

  if (unhealthy > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
