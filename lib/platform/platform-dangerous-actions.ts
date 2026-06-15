/** Actions that require extra confirmation + audit (UI should use dialogs). */
export const PLATFORM_DANGEROUS_ACTION_IDS = [
  "workspace.archive",
  "workspace.lock",
  "billing.force_plan",
  "entitlements.override",
  "webhook.replay",
  "automation.retry_bulk",
  "tools.clear_cache",
] as const;

export type PlatformDangerousActionId = (typeof PLATFORM_DANGEROUS_ACTION_IDS)[number];
