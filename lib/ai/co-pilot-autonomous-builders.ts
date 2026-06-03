import { format, startOfDay } from "date-fns";

import type { CoPilotRecommendation } from "@/lib/ai/co-pilot-types";
import type {
  CoPilotDailyDigest,
  CoPilotExceptionEntry,
  CoPilotExceptionSeverity,
} from "@/lib/ai/co-pilot-autonomous-types";

export const AUTO_SAFE_ACTION_TYPES = new Set([
  "suggest_report_export",
  "suggest_ingredient_demand_run",
]);

export function isAutoSafeRecommendation(rec: CoPilotRecommendation): boolean {
  return rec.severity === "info" && AUTO_SAFE_ACTION_TYPES.has(rec.actionType);
}

export function recommendationToException(
  rec: CoPilotRecommendation,
  source: CoPilotExceptionEntry["source"] = "recommendation",
): CoPilotExceptionEntry {
  return {
    id: `exc-${rec.id}`,
    at: new Date().toISOString(),
    severity: rec.severity as CoPilotExceptionSeverity,
    category: rec.category,
    title: rec.title,
    detail: rec.summary,
    resolved: false,
    source,
  };
}

export function buildDailyDigest(input: {
  recommendations: CoPilotRecommendation[];
  pendingApproval: number;
  autoExecuted: number;
  exceptionsLogged: number;
  generatedAt?: Date;
}): CoPilotDailyDigest {
  const now = input.generatedAt ?? new Date();
  const date = format(startOfDay(now), "yyyy-MM-dd");
  const critical = input.recommendations.filter((r) => r.severity === "critical");
  const warning = input.recommendations.filter((r) => r.severity === "warning");
  const procurement = input.recommendations.filter((r) => r.category === "procurement");
  const scheduling = input.recommendations.filter((r) => r.category === "scheduling");
  const pricing = input.recommendations.filter((r) => r.category === "pricing");

  const headline =
    critical.length > 0
      ? `${critical.length} critical exception${critical.length === 1 ? "" : "s"} need your review`
      : warning.length > 0
        ? `${warning.length} warning${warning.length === 1 ? "" : "s"} — autonomous mode handled safe items`
        : "Operations steady — Co-Pilot 2.0 found no critical exceptions";

  const sections = [
    {
      id: "procurement",
      title: "Procurement",
      body:
        procurement.length === 0
          ? "No purchase gaps flagged in the latest demand scan."
          : `${procurement.length} reorder or demand signal(s) — review before next vendor cutoff.`,
      itemCount: procurement.length,
    },
    {
      id: "scheduling",
      title: "Labor & scheduling",
      body:
        scheduling.length === 0
          ? "Coverage looks balanced for the next 7 days."
          : `${scheduling.length} coverage gap(s) or ratio warnings detected.`,
      itemCount: scheduling.length,
    },
    {
      id: "pricing",
      title: "Pricing & margin",
      body:
        pricing.length === 0
          ? "Food cost alerts are clear."
          : `${pricing.length} margin or menu adjustment signal(s).`,
      itemCount: pricing.length,
    },
    {
      id: "autonomous",
      title: "Autonomous actions",
      body:
        input.autoExecuted > 0
          ? `Executed ${input.autoExecuted} safe info-level action(s) without manual approval.`
          : "No safe auto-actions ran this cycle — enable autonomous mode or promote drafts manually.",
      itemCount: input.autoExecuted,
    },
  ];

  return {
    date,
    headline,
    generatedAt: now.toISOString(),
    sections,
    stats: {
      recommendationsScanned: input.recommendations.length,
      criticalCount: critical.length,
      warningCount: warning.length,
      autoExecuted: input.autoExecuted,
      pendingApproval: input.pendingApproval,
      exceptionsLogged: input.exceptionsLogged,
    },
  };
}

export function buildExceptionLogFromRecommendations(
  recommendations: CoPilotRecommendation[],
  existing: CoPilotExceptionEntry[],
): CoPilotExceptionEntry[] {
  const needsAttention = recommendations.filter((r) => r.severity !== "info");
  const fresh = needsAttention.map((r) => recommendationToException(r));
  const existingIds = new Set(existing.map((e) => e.id));
  const merged = [...fresh.filter((e) => !existingIds.has(e.id)), ...existing];
  return merged.slice(0, 48);
}
