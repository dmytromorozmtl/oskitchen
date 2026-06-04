"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { BusinessType, UserRole } from "@prisma/client";

import { runGlobalSearch } from "@/actions/global-search";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NavMaturityBadge } from "@/components/ui/beta-badge";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import { flattenNavLinks, NAV_GROUPS } from "@/lib/nav-config";
import { navLabelForBusinessType } from "@/lib/terminology";
import type { ModuleKey } from "@/lib/module-visibility";
import { navigationHrefDisabled } from "@/lib/module-visibility";
import { getCommandPaletteRoutesFromRegistry } from "@/lib/modules/command-palette-routes";
import { isDashboardPathAllowedForRole } from "@/lib/nav-role-filter";
import {
  buildCommandPaletteItems,
  COMMAND_PALETTE_EMPTY_HINTS,
  COMMAND_PALETTE_FOOTER_HINTS,
  COMMAND_PALETTE_RECENT_STORAGE_KEY,
  commandPaletteItemId,
  moveCommandPaletteActiveIndex,
  parseCommandPaletteRecent,
  pushCommandPaletteRecent,
  rankCommandPaletteRoutes,
  type CommandPaletteItem,
} from "@/lib/navigation/command-palette-ux-policy";
import type { GlobalSearchHit } from "@/lib/search/search-types";

const hrefToLabelKey = new Map(flattenNavLinks(NAV_GROUPS, []).map((l) => [l.href, l.labelKey]));

export type CommandPaletteExtraRoute = { href: string; label: string; k?: string };

function displayLabel(
  locale: Locale,
  businessType: BusinessType | null,
  href: string,
  fallback: string,
): string {
  const key = hrefToLabelKey.get(href);
  if (key) return navLabelForBusinessType(locale, businessType, key);
  return fallback;
}

function routeAllowed(
  href: string,
  opts: {
    fullNavAccess: boolean;
    userRole: UserRole;
    isPlatformSuper: boolean;
    gtmSurfaceAccess?: boolean;
    disabled: ReadonlySet<ModuleKey>;
    internalOnly?: boolean;
    superAdminOnly?: boolean;
  },
): boolean {
  if (opts.internalOnly && !opts.fullNavAccess) return false;
  if (opts.superAdminOnly && !opts.fullNavAccess) return false;
  if (!opts.fullNavAccess && navigationHrefDisabled(href, opts.disabled)) return false;
  if (
    !isDashboardPathAllowedForRole(
      href,
      opts.userRole,
      opts.isPlatformSuper,
      Boolean(opts.gtmSurfaceAccess),
    )
  ) {
    return false;
  }
  return true;
}

export function CommandPalette({
  locale = "en",
  businessType = null,
  disabledModuleKeys = [],
  fullNavAccess = false,
  userRole = "OWNER",
  isPlatformSuper = false,
  gtmSurfaceAccess = false,
  extraRoutes = [],
  searchWorkspaceUserId = null,
}: {
  locale?: Locale;
  businessType?: BusinessType | null;
  disabledModuleKeys?: readonly ModuleKey[];
  fullNavAccess?: boolean;
  userRole?: UserRole;
  isPlatformSuper?: boolean;
  gtmSurfaceAccess?: boolean;
  extraRoutes?: CommandPaletteExtraRoute[];
  /** When set, queries workspace entities (orders, customers, …) server-side. */
  searchWorkspaceUserId?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [recentHrefs, setRecentHrefs] = React.useState<string[]>([]);
  const [remoteHits, setRemoteHits] = React.useState<GlobalSearchHit[]>([]);
  const [searchPending, startSearchTransition] = React.useTransition();
  const disabled = React.useMemo(() => new Set<ModuleKey>(disabledModuleKeys), [disabledModuleKeys]);
  const listRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    try {
      setRecentHrefs(parseCommandPaletteRecent(localStorage.getItem(COMMAND_PALETTE_RECENT_STORAGE_KEY)));
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    if (!open || !searchWorkspaceUserId) {
      setRemoteHits([]);
      return;
    }
    const s = q.trim();
    if (s.length < 2) {
      setRemoteHits([]);
      return;
    }
    const handle = window.setTimeout(() => {
      startSearchTransition(() => {
        runGlobalSearch(s)
          .then((res) => setRemoteHits(res.hits))
          .catch(() => setRemoteHits([]));
      });
    }, 280);
    return () => window.clearTimeout(handle);
  }, [open, q, searchWorkspaceUserId]);

  const ROUTES = React.useMemo(() => {
    const quick: CommandPaletteExtraRoute[] = [
      { href: "/dashboard/today", label: "Open Today", k: "today-open" },
      { href: "/dashboard/orders/new", label: "Create order", k: "create-order" },
      { href: "/dashboard/storefront", label: "Open storefront", k: "store-open" },
      { href: "/dashboard/sales-channels", label: "Open sales channels", k: "channels-open" },
      { href: "/dashboard/settings", label: "Open settings", k: "settings-open" },
    ];
    const registry = getCommandPaletteRoutesFromRegistry();
    const seen = new Set<string>();
    const out: { href: string; label: string; k?: string }[] = [];
    const push = (r: {
      href: string;
      label: string;
      k?: string;
      internalOnly?: boolean;
      superAdminOnly?: boolean;
    }) => {
      if (seen.has(r.href)) return;
      if (
        !routeAllowed(r.href, {
          fullNavAccess,
          userRole,
          isPlatformSuper,
          gtmSurfaceAccess,
          disabled,
          internalOnly: r.internalOnly,
          superAdminOnly: r.superAdminOnly,
        })
      ) {
        return;
      }
      seen.add(r.href);
      out.push({
        href: r.href,
        label: displayLabel(locale, businessType, r.href, r.label),
        k: r.k,
      });
    };
    for (const r of quick) push({ ...r });
    for (const r of extraRoutes) push({ ...r });
    for (const r of registry) push(r);
    return out;
  }, [locale, businessType, disabled, extraRoutes, fullNavAccess, gtmSurfaceAccess, isPlatformSuper, userRole]);

  const routeByHref = React.useMemo(() => new Map(ROUTES.map((r) => [r.href, r])), [ROUTES]);

  const recentRoutes = React.useMemo(() => {
    const out: { href: string; label: string; k?: string }[] = [];
    for (const href of recentHrefs) {
      const route = routeByHref.get(href);
      if (route) out.push(route);
    }
    return out;
  }, [recentHrefs, routeByHref]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [q, open]);

  const filteredRoutes = React.useMemo(() => {
    const s = q.trim();
    if (!s) {
      if (recentRoutes.length > 0) {
        const recentSet = new Set(recentRoutes.map((r) => r.href));
        return [
          ...recentRoutes,
          ...ROUTES.filter((r) => !recentSet.has(r.href)),
        ];
      }
      return ROUTES;
    }
    return rankCommandPaletteRoutes(s, ROUTES);
  }, [q, ROUTES, recentRoutes]);

  const filteredHits = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return remoteHits;
    return remoteHits.filter(
      (h) =>
        h.title.toLowerCase().includes(s) ||
        (h.subtitle?.toLowerCase().includes(s) ?? false) ||
        h.href.toLowerCase().includes(s) ||
        h.kind.includes(s),
    );
  }, [q, remoteHits]);

  const selectableItems = React.useMemo(
    () =>
      buildCommandPaletteItems({
        hits: filteredHits,
        routes: filteredRoutes,
      }),
    [filteredHits, filteredRoutes],
  );

  const recordRecent = React.useCallback((href: string) => {
    setRecentHrefs((prev) => {
      const next = pushCommandPaletteRecent(prev, href);
      try {
        localStorage.setItem(COMMAND_PALETTE_RECENT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const navigateTo = React.useCallback(
    (href: string) => {
      recordRecent(href);
      setOpen(false);
      setQ("");
      router.push(href);
    },
    [recordRecent, router],
  );

  const openItem = React.useCallback(
    (item: CommandPaletteItem) => {
      navigateTo(item.href);
    },
    [navigateTo],
  );

  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-cmd-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => moveCommandPaletteActiveIndex(i, "down", selectableItems.length));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => moveCommandPaletteActiveIndex(i, "up", selectableItems.length));
      return;
    }
    if (e.key === "Enter" && selectableItems.length > 0) {
      e.preventDefault();
      const item = selectableItems[activeIndex];
      if (item) openItem(item);
    }
  };

  const showRecentHeader = !q.trim() && recentRoutes.length > 0;
  const hitItems = selectableItems.filter((i) => i.kind === "hit");
  const routeItems = selectableItems.filter((i) => i.kind === "route");

  const renderItemButton = (item: CommandPaletteItem, index: number) => {
    if (item.kind === "hit") {
      return (
        <li key={commandPaletteItemId(item)} role="option" aria-selected={index === activeIndex}>
          <button
            type="button"
            data-cmd-index={index}
            className={cn(
              "flex w-full px-4 py-2 text-left text-sm outline-none",
              index === activeIndex ? "bg-muted" : "hover:bg-muted",
            )}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => openItem(item)}
          >
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{item.title}</span>
              {item.subtitle ? (
                <span className="block text-xs text-muted-foreground">{item.subtitle}</span>
              ) : null}
            </span>
            <span className="ml-2 shrink-0 text-[10px] uppercase text-muted-foreground">
              {item.hitKind}
            </span>
          </button>
        </li>
      );
    }

    return (
      <li key={commandPaletteItemId(item)} role="option" aria-selected={index === activeIndex}>
        <button
          type="button"
          data-cmd-index={index}
          className={cn(
            "flex w-full items-center gap-2 px-4 py-2 text-left text-sm outline-none",
            index === activeIndex ? "bg-muted" : "hover:bg-muted",
          )}
          onMouseEnter={() => setActiveIndex(index)}
          onClick={() => openItem(item)}
        >
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {item.maturityBadge ? <NavMaturityBadge label={item.maturityBadge} /> : null}
          <span className="ml-auto hidden shrink-0 font-mono text-[10px] text-muted-foreground sm:inline">
            {item.href}
          </span>
        </button>
      </li>
    );
  };

  let itemIndex = 0;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full text-xs text-muted-foreground"
        onClick={() => setOpen(true)}
        data-testid="command-palette-trigger"
        aria-label="Open command palette"
      >
        <Search className="h-3.5 w-3.5 sm:mr-2" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="ml-0 hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] sm:ml-2 sm:inline">
          ⌘K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="gap-0 overflow-hidden p-0 sm:max-w-lg"
          data-testid="command-palette-dialog"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Command palette</DialogTitle>
            <DialogDescription>Jump to a module or run a quick action.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search modules, actions, orders, customers…"
              className="border-0 shadow-none focus-visible:ring-0"
              autoFocus
              data-testid="command-palette-input"
            />
          </div>
          <ul
            ref={listRef}
            className="max-h-72 overflow-y-auto py-2"
            aria-label="Command results"
            role="listbox"
          >
            {hitItems.length > 0 ? (
              <li className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Workspace matches
              </li>
            ) : null}
            {hitItems.map((item) => renderItemButton(item, itemIndex++))}
            {routeItems.length > 0 ? (
              <li
                className={cn(
                  "px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
                  hitItems.length > 0 ? "pt-2" : "",
                )}
              >
                {showRecentHeader ? "Recent & navigation" : "Navigation"}
              </li>
            ) : null}
            {routeItems.map((item) => renderItemButton(item, itemIndex++))}
            {searchPending ? (
              <li className="px-4 py-2 text-xs text-muted-foreground">Searching workspace…</li>
            ) : null}
            {selectableItems.length === 0 && !searchPending ? (
              <li className="space-y-2 px-4 py-6 text-center text-sm text-muted-foreground">
                <p>No matches</p>
                <p className="text-xs">
                  Try: {COMMAND_PALETTE_EMPTY_HINTS.map((hint) => `"${hint}"`).join(", ")}
                </p>
              </li>
            ) : null}
          </ul>
          <div className="flex flex-wrap gap-x-3 gap-y-1 border-t px-3 py-2 text-[10px] text-muted-foreground">
            <span>{COMMAND_PALETTE_FOOTER_HINTS.navigate}</span>
            <span>{COMMAND_PALETTE_FOOTER_HINTS.select}</span>
            <span>{COMMAND_PALETTE_FOOTER_HINTS.close}</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
