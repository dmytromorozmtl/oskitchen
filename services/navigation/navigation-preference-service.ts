/** Client-side navigation preferences (mirrors `DashboardSidebarNav` localStorage keys). */
export const NAV_SCOPE_STORAGE_KEY = "kitchenos.nav.scope";
export const NAV_PINS_STORAGE_KEY = "kitchenos.nav.pins";
export const NAV_RECENT_STORAGE_KEY = "kitchenos.nav.recent";
export const MAX_NAV_PINS = 6;
export const MAX_NAV_RECENT = 5;

export type NavScopePersistence = "focused" | "all";

export function parseNavScope(raw: string | null): boolean {
  return raw === "all";
}

export function navScopeToStorageValue(scopeAll: boolean): NavScopePersistence {
  return scopeAll ? "all" : "focused";
}
