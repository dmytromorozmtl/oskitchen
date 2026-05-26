import type { MessageKey } from "@/lib/i18n";
import { FINAL_NAVIGATION_GROUPS } from "@/lib/navigation/final-navigation-groups";
import type { NavGroupDef, NavLinkItem } from "@/lib/navigation/nav-types";

export type { NavGroupDef, NavLinkItem } from "@/lib/navigation/nav-types";

/** Canonical navigation — see `lib/navigation/final-navigation-groups.ts`. */
export const NAV_GROUPS = FINAL_NAVIGATION_GROUPS;

export function flattenNavLinks(
  groups: NavGroupDef[],
  ownerExtras: NavLinkItem[],
): { href: string; labelKey: MessageKey }[] {
  const base = groups.flatMap((g) => g.links);
  return [...base, ...ownerExtras];
}
