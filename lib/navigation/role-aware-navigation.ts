/**
 * Groups that start collapsed for first-time focus mode (reduces sidebar noise).
 * Advanced / analytics-heavy sections stay one click away.
 */
export const DEFAULT_COLLAPSED_NAV_GROUP_IDS = new Set<string>(["insights", "setup", "internal"]);

export function shouldStartCollapsed(groupId: string): boolean {
  return DEFAULT_COLLAPSED_NAV_GROUP_IDS.has(groupId);
}
