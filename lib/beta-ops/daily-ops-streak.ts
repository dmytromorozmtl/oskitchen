import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { DailyOpsReport } from "@/lib/beta-ops/types";

const ARTIFACTS = join(process.cwd(), "docs", "artifacts");

export function loadAllDailyOps(): DailyOpsReport[] {
  if (!existsSync(ARTIFACTS)) return [];
  return readdirSync(ARTIFACTS)
    .filter((f) => f.startsWith("BETA_DAILY_OPS_") && f.endsWith(".json"))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(ARTIFACTS, f), "utf8")) as DailyOpsReport;
      } catch {
        return null;
      }
    })
    .filter((r): r is DailyOpsReport => r != null)
    .sort((a, b) => a.day.localeCompare(b.day));
}

/** Consecutive healthy days (unhealthy === 0) ending today or latest report day. */
export function healthyStreak(reports = loadAllDailyOps()): { streak: number; totalDays: number } {
  if (reports.length === 0) return { streak: 0, totalDays: 0 };
  let streak = 0;
  const sorted = [...reports].reverse();
  for (const r of sorted) {
    if (r.summary.unhealthy === 0) streak++;
    else break;
  }
  return { streak, totalDays: reports.length };
}
