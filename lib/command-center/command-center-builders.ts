import { ratePercentLabel } from "@/lib/analytics/operational-metrics";
import {
  COMMAND_CENTER_PATH,
  COMMAND_CENTER_POLICY_ID,
} from "@/lib/command-center/command-center-policy";
import type {
  CommandCenterAlert,
  CommandCenterLane,
  CommandCenterLaneId,
  CommandCenterSnapshot,
  CommandCenterTicker,
  CommandCenterTickerTone,
} from "@/lib/command-center/command-center-types";
import type { TodayBlocker } from "@/services/today/today-command-center-service";
import { formatCurrency } from "@/lib/utils";

const LANE_LABELS: Record<CommandCenterLaneId, string> = {
  market: "MARKET",
  operations: "OPS",
  live: "LIVE",
  forecast: "FCST",
  roles: "ROLES",
};

export function buildCommandCenterTicker(input: {
  id: string;
  symbol: string;
  label: string;
  value: string;
  hint?: string | null;
  tone?: CommandCenterTickerTone;
  href?: string | null;
}): CommandCenterTicker {
  return {
    id: input.id,
    symbol: input.symbol,
    label: input.label,
    value: input.value,
    hint: input.hint ?? null,
    tone: input.tone ?? "neutral",
    href: input.href ?? null,
  };
}

export function buildCommandCenterLane(input: {
  id: CommandCenterLaneId;
  tickers: CommandCenterTicker[];
}): CommandCenterLane {
  return {
    id: input.id,
    label: LANE_LABELS[input.id],
    tickers: input.tickers,
  };
}

export function buildCommandCenterAlertsFromBlockers(
  blockers: readonly TodayBlocker[],
): CommandCenterAlert[] {
  return blockers.slice(0, 6).map((blocker) => ({
    id: blocker.id,
    title: blocker.title,
    detail: blocker.detail,
    href: blocker.href,
    severity: blocker.priority <= 1 ? "critical" : blocker.priority <= 3 ? "warning" : "info",
  }));
}

export function buildCommandCenterSnapshot(input: {
  workspaceLabel: string;
  rangeLabel: string;
  lanes: CommandCenterLane[];
  alerts: CommandCenterAlert[];
  blockerCount: number;
  analyzedAt?: Date;
}): CommandCenterSnapshot {
  const tickerCount = input.lanes.reduce((sum, lane) => sum + lane.tickers.length, 0);

  return {
    policyId: COMMAND_CENTER_POLICY_ID,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    workspaceLabel: input.workspaceLabel,
    rangeLabel: input.rangeLabel,
    lanes: input.lanes,
    alerts: input.alerts,
    summary: {
      laneCount: input.lanes.length,
      tickerCount,
      alertCount: input.alerts.length,
      blockerCount: input.blockerCount,
    },
    basePath: COMMAND_CENTER_PATH,
  };
}

export function formatMoney(value: number | null | undefined): string {
  if (value == null) return "—";
  return formatCurrency(value);
}

export function formatRate(value: number | null): string {
  return ratePercentLabel(value);
}
