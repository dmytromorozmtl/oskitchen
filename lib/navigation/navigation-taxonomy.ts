/**
 * Canonical nav group ids — keep aligned with `lib/nav-config.ts` `NavGroupDef.id`.
 */
export const NAV_GROUP_IDS = [
  "today",
  "commerce",
  "menus",
  "kitchen",
  "inventoryCost",
  "fulfillment",
  "customersEvents",
  "insights",
  "rollout",
  "admin",
  "internal",
] as const;
export type NavGroupId = (typeof NAV_GROUP_IDS)[number];
