import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { loadCohortRegistry } from "@/lib/beta-ops/cohort-registry";
import { resolveNextAction } from "@/lib/beta-ops/next-action";
import { healthyStreak } from "@/lib/beta-ops/daily-ops-streak";
import { computeProgramReadiness } from "@/lib/beta-ops/readiness";
import { PROGRAM_STEPS } from "@/lib/beta-ops/program-catalog";
import type { ProgramState } from "@/lib/beta-ops/program-state";
import type { DailyOpsReport } from "@/lib/beta-ops/types";

const ARTIFACTS = join(process.cwd(), "docs", "artifacts");

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function latestDailyOps(): DailyOpsReport | null {
  if (!existsSync(ARTIFACTS)) return null;
  const files = readdirSync(ARTIFACTS)
    .filter((f) => f.startsWith("BETA_DAILY_OPS_") && f.endsWith(".json"))
    .sort()
    .reverse();
  if (!files[0]) return null;
  return readJson<DailyOpsReport>(join(ARTIFACTS, files[0]));
}

export function renderExecutiveSummary(state: ProgramState): string {
  const next = resolveNextAction(state);
  const readiness = computeProgramReadiness(state);
  const lines: string[] = [
    "# OS Kitchen Beta Program — Executive Summary",
    "",
    `Updated: ${state.updatedAt}`,
    `**Program readiness: ${readiness.score}/100**`,
    "",
    "## Progress",
    "",
    "| Step | Title | Status | Last run |",
    "|------|-------|--------|----------|",
  ];

  for (const meta of PROGRAM_STEPS) {
    const rec = state.steps[String(meta.id)];
    const status = rec?.ok === true ? "DONE" : rec?.ok === false ? "FAILED" : "PENDING";
    const when = rec?.completedAt?.slice(0, 19).replace("T", " ") ?? "—";
    lines.push(`| ${meta.id} | ${meta.title} | ${status} | ${when} |`);
  }

  const registry = loadCohortRegistry();
  if (registry) {
    const live = registry.kitchens.filter((k) => k.status === "live").length;
    lines.push(
      "",
      "## Cohort",
      "",
      `Registry: \`${registry.cohortName}\` — ${registry.kitchens.length} kitchen(s), **${live} live**`,
      "",
    );
    for (const k of registry.kitchens) {
      lines.push(`- ${k.email} — \`${k.status}\`${k.businessName ? ` (${k.businessName})` : ""}`);
    }
  }

  const daily = latestDailyOps();
  const streak = healthyStreak();
  if (daily) {
    lines.push(
      "",
      "## Latest daily ops",
      "",
      `Day **${daily.day}**: live=${daily.summary.live}, unhealthy=${daily.summary.unhealthy}, check-in ready=${daily.summary.readyForCheckIn ? "yes" : "no"}`,
      streak.totalDays > 0 ? `- Healthy streak: **${streak.streak}** day(s) (${streak.totalDays} reports)` : "",
      "",
    );
  }

  const launch = readJson<{ summary?: { readyForBeta?: boolean; readinessScore?: number; manual?: number; fail?: number } }>(
    join(ARTIFACTS, "BETA_LAUNCH_REPORT.json"),
  );
  if (launch?.summary) {
    lines.push(
      "## Day 1 launch",
      "",
      `- readyForBeta: **${launch.summary.readyForBeta ?? "?"}**`,
      `- launch score: **${launch.summary.readinessScore ?? "?"}/100**`,
      `- gates: fail=${launch.summary.fail ?? 0} manual=${launch.summary.manual ?? 0}`,
      "",
    );
  }

  if (existsSync(join(ARTIFACTS, "BETA_STAGING_PREP.json"))) {
    const prep = readJson<{ ok?: boolean; mode?: string }>(join(ARTIFACTS, "BETA_STAGING_PREP.json"));
    lines.push(`## Staging prep`, "", `- status: **${prep?.ok ? "OK" : "incomplete"}** (${prep?.mode ?? "?"})`, "");
  }

  const goNoGo = readJson<{ recommendation?: string; decision?: string | null }>(
    join(ARTIFACTS, "BETA_GO_NO_GO.json"),
  );
  if (goNoGo) {
    lines.push(
      "## Post-beta epic gate",
      "",
      `- recommendation: **${goNoGo.recommendation ?? "?"}**`,
      `- recorded decision: **${goNoGo.decision ?? "pending"}**`,
      "",
    );
  }

  lines.push(
    "## Next action",
    "",
    `**Step ${next.step ?? "—"}:** ${next.title}`,
    "",
    "```bash",
    next.command,
    "```",
    "",
    `_${next.reason}_`,
    "",
    "## Quick commands",
    "",
    "| Action | Command |",
    "|--------|---------|",
    "| Env check | `npm run beta:env-check -- --step=0` |",
    "| Run next step | `npm run beta:program -- --next` |",
    "| Full status | `npm run beta:program` |",
    "| Day 1 only | `npm run beta:day1-complete` |",
    "",
    "Runbook: `docs/BETA_PROGRAM_RUNBOOK.md`",
    "",
  );

  return lines.join("\n");
}
