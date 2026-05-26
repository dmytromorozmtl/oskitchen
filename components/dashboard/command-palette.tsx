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
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import { flattenNavLinks, NAV_GROUPS } from "@/lib/nav-config";
import { navLabelForBusinessType } from "@/lib/terminology";
import type { ModuleKey } from "@/lib/module-visibility";
import { navigationHrefDisabled } from "@/lib/module-visibility";
import { getCommandPaletteRoutesFromRegistry } from "@/lib/modules/command-palette-routes";
import { isDashboardPathAllowedForRole } from "@/lib/nav-role-filter";
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
  const [remoteHits, setRemoteHits] = React.useState<GlobalSearchHit[]>([]);
  const [searchPending, startSearchTransition] = React.useTransition();
  const disabled = React.useMemo(() => new Set<ModuleKey>(disabledModuleKeys), [disabledModuleKeys]);

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

  const filteredRoutes = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ROUTES;
    return ROUTES.filter(
      (r) =>
        r.label.toLowerCase().includes(s) ||
        r.href.toLowerCase().includes(s) ||
        r.k?.includes(s),
    );
  }, [q, ROUTES]);

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

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="hidden rounded-full text-xs text-muted-foreground lg:inline-flex"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-3.5 w-3.5" />
        Search
        <kbd className="ml-2 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="sr-only">
            <DialogTitle>Command palette</DialogTitle>
            <DialogDescription>Jump to a module or run a quick action.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search modules, actions, orders, customers…"
              className="border-0 shadow-none focus-visible:ring-0"
              autoFocus
            />
          </div>
          <ul className="max-h-72 overflow-y-auto py-2" aria-label="Command results">
            {filteredHits.length > 0 ? (
              <li className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Workspace matches
              </li>
            ) : null}
            {filteredHits.map((h) => (
              <li key={`${h.kind}-${h.id}`}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full px-4 py-2 text-left text-sm hover:bg-muted",
                    "focus:bg-muted outline-none",
                  )}
                  onClick={() => {
                    setOpen(false);
                    setQ("");
                    router.push(h.href);
                  }}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{h.title}</span>
                    {h.subtitle ? (
                      <span className="block text-xs text-muted-foreground">{h.subtitle}</span>
                    ) : null}
                  </span>
                  <span className="ml-2 shrink-0 text-[10px] uppercase text-muted-foreground">
                    {h.kind}
                  </span>
                </button>
              </li>
            ))}
            {filteredRoutes.length > 0 ? (
              <li className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Navigation
              </li>
            ) : null}
            {filteredRoutes.map((r) => (
              <li key={r.href}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full px-4 py-2 text-left text-sm hover:bg-muted",
                    "focus:bg-muted outline-none",
                  )}
                  onClick={() => {
                    setOpen(false);
                    setQ("");
                    router.push(r.href);
                  }}
                >
                  {r.label}
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">{r.href}</span>
                </button>
              </li>
            ))}
            {searchPending ? (
              <li className="px-4 py-2 text-xs text-muted-foreground">Searching workspace…</li>
            ) : null}
            {filteredRoutes.length === 0 && filteredHits.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">No matches</li>
            ) : null}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
