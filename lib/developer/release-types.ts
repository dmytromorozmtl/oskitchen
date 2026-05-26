export const RELEASE_TYPES = ["patch", "minor", "major", "hotfix", "beta", "internal"] as const;
export type ReleaseType = (typeof RELEASE_TYPES)[number];

export const RELEASE_CATEGORIES = [
  "platform",
  "integrations",
  "billing",
  "security",
  "operations",
  "customer",
  "internal",
] as const;
export type ReleaseCategory = (typeof RELEASE_CATEGORIES)[number];
