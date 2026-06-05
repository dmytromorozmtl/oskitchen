export const COMMAND_CENTER_POLICY_ID = "command-center-v1" as const;

export const COMMAND_CENTER_PATH = "/dashboard/command-center" as const;

export const COMMAND_CENTER_SERVICE = "services/command-center/command-center-service.ts" as const;

export const COMMAND_CENTER_LANE_IDS = [
  "market",
  "operations",
  "live",
  "forecast",
  "roles",
] as const;
