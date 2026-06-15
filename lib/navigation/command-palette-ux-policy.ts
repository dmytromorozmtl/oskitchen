import type { GlobalSearchHit } from "@/lib/search/search-types";
import { navMaturityBadgeForHref } from "@/lib/navigation/nav-maturity-governance";

/**
 * DES-12 — command palette UX policy (⌘K).
 *
 * @see components/dashboard/command-palette.tsx
 */

export const COMMAND_PALETTE_UX_POLICY_ID = "command-palette-ux-des12-v1" as const;

export const COMMAND_PALETTE_RECENT_STORAGE_KEY = "kitchenos.command-palette.recent" as const;

export const COMMAND_PALETTE_MAX_RECENT = 5 as const;

export const COMMAND_PALETTE_EMPTY_HINTS = [
  "today",
  "orders",
  "pos",
  "kitchen",
  "settings",
] as const;

export const COMMAND_PALETTE_FOOTER_HINTS = {
  navigate: "↑↓ navigate",
  select: "↵ open",
  close: "esc close",
} as const;

export type CommandPaletteRouteItem = {
  kind: "route";
  id: string;
  href: string;
  label: string;
  maturityBadge: string | null;
};

export type CommandPaletteHitItem = {
  kind: "hit";
  id: string;
  href: string;
  title: string;
  subtitle: string | null;
  hitKind: string;
};

export type CommandPaletteItem = CommandPaletteRouteItem | CommandPaletteHitItem;

export function commandPaletteItemId(item: CommandPaletteItem): string {
  return item.kind === "route" ? `route:${item.href}` : `hit:${item.id}`;
}

export function buildCommandPaletteItems(input: {
  routes: readonly { href: string; label: string }[];
  hits: readonly GlobalSearchHit[];
}): CommandPaletteItem[] {
  const items: CommandPaletteItem[] = [];

  for (const hit of input.hits) {
    items.push({
      kind: "hit",
      id: hit.id,
      href: hit.href,
      title: hit.title,
      subtitle: hit.subtitle ?? null,
      hitKind: hit.kind,
    });
  }

  for (const route of input.routes) {
    items.push({
      kind: "route",
      id: route.href,
      href: route.href,
      label: route.label,
      maturityBadge: navMaturityBadgeForHref(route.href),
    });
  }

  return items;
}

export function clampCommandPaletteActiveIndex(
  index: number,
  itemCount: number,
): number {
  if (itemCount <= 0) return 0;
  if (index < 0) return 0;
  if (index >= itemCount) return itemCount - 1;
  return index;
}

export function moveCommandPaletteActiveIndex(
  current: number,
  direction: "up" | "down",
  itemCount: number,
): number {
  if (itemCount <= 0) return 0;
  if (direction === "down") {
    return clampCommandPaletteActiveIndex(current + 1, itemCount);
  }
  return clampCommandPaletteActiveIndex(current - 1, itemCount);
}

export function parseCommandPaletteRecent(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string").slice(0, COMMAND_PALETTE_MAX_RECENT);
  } catch {
    return [];
  }
}

export function pushCommandPaletteRecent(current: readonly string[], href: string): string[] {
  return [href, ...current.filter((h) => h !== href)].slice(0, COMMAND_PALETTE_MAX_RECENT);
}

export function rankCommandPaletteRoutes<T extends { href: string; label: string; k?: string }>(
  query: string,
  routes: readonly T[],
): T[] {
  const s = query.trim().toLowerCase();
  if (!s) return [...routes];

  return routes
    .map((route) => {
      const label = route.label.toLowerCase();
      const href = route.href.toLowerCase();
      const key = route.k?.toLowerCase() ?? "";
      let score = 0;
      if (label === s || href === s) score += 100;
      else if (label.startsWith(s) || href.startsWith(s)) score += 50;
      else if (label.includes(s) || href.includes(s) || key.includes(s)) score += 10;
      return { route, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.route.label.localeCompare(b.route.label))
    .map(({ route }) => route);
}
