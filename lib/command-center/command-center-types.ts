import type { COMMAND_CENTER_POLICY_ID } from "@/lib/command-center/command-center-policy";

export type CommandCenterLaneId =
  | "market"
  | "operations"
  | "live"
  | "forecast"
  | "roles";

export type CommandCenterTickerTone = "neutral" | "positive" | "negative" | "warning";

export type CommandCenterTicker = {
  id: string;
  symbol: string;
  label: string;
  value: string;
  hint: string | null;
  tone: CommandCenterTickerTone;
  href: string | null;
};

export type CommandCenterLane = {
  id: CommandCenterLaneId;
  label: string;
  tickers: CommandCenterTicker[];
};

export type CommandCenterAlert = {
  id: string;
  title: string;
  detail: string;
  href: string;
  severity: "info" | "warning" | "critical";
};

export type CommandCenterSnapshot = {
  policyId: typeof COMMAND_CENTER_POLICY_ID;
  generatedAtIso: string;
  workspaceLabel: string;
  rangeLabel: string;
  lanes: CommandCenterLane[];
  alerts: CommandCenterAlert[];
  summary: {
    laneCount: number;
    tickerCount: number;
    alertCount: number;
    blockerCount: number;
  };
  basePath: string;
};
