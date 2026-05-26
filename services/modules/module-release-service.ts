import { filterNavGroupsForPilotRelease } from "@/lib/navigation/release-navigation";
import type { NavGroupDef } from "@/lib/navigation/nav-types";

export type NavReleaseProfile = "full" | "pilot";

export function applyNavReleaseProfile(
  groups: NavGroupDef[],
  profile: NavReleaseProfile,
): NavGroupDef[] {
  if (profile === "pilot") return filterNavGroupsForPilotRelease(groups);
  return groups;
}

export function navReleaseProfileFromEnv(): NavReleaseProfile {
  const v = process.env.NEXT_PUBLIC_NAV_RELEASE_PROFILE?.trim().toLowerCase();
  return v === "pilot" ? "pilot" : "full";
}
