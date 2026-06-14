import { filterNavGroupsForPilotTier } from "@/lib/navigation/navigation-release-profile-policy";
import type { NavGroupDef } from "@/lib/navigation/nav-types";

/** `enterprise` and `full` both expose the complete sidebar IA. */
export type NavReleaseProfile = "full" | "pilot" | "enterprise";

export function applyNavReleaseProfile(
  groups: NavGroupDef[],
  profile: NavReleaseProfile,
): NavGroupDef[] {
  if (profile === "pilot") return filterNavGroupsForPilotTier(groups);
  return groups;
}

export function navReleaseProfileFromEnv(): NavReleaseProfile {
  const v = process.env.NEXT_PUBLIC_NAV_RELEASE_PROFILE?.trim().toLowerCase();
  if (v === "pilot") return "pilot";
  if (v === "enterprise" || v === "full") return "full";
  return "full";
}

export function isEnterpriseNavReleaseProfile(profile: NavReleaseProfile): boolean {
  return profile === "full" || profile === "enterprise";
}
