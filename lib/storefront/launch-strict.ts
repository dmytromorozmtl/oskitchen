/** When STOREFRONT_STRICT_LAUNCH=1, publish is blocked until commerce checklist items pass. */
export function isStorefrontStrictLaunchEnabled(): boolean {
  return process.env.STOREFRONT_STRICT_LAUNCH === "1";
}

export const STRICT_PUBLISH_BLOCKER_IDS = [
  "nav",
  "theme",
  "sections",
  "active_menu",
  "products",
  "fulfillment",
] as const;
