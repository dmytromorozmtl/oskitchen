"use client";

import * as React from "react";
import Link from "next/link";
import { Pin, PinOff, Search } from "lucide-react";
import { ChevronDown } from "lucide-react";

import type { BusinessType } from "@prisma/client";

import type { ModuleKey } from "@/lib/module-visibility";
import type { Locale } from "@/lib/i18n";
import { getFilteredNavGroups, type NavRoleContext } from "@/lib/business-modes";
import { type NavLinkItem } from "@/lib/nav-config";
import { applyNavReleaseProfile, type NavReleaseProfile } from "@/services/modules/module-release-service";
import { navLabelForBusinessType } from "@/lib/terminology";
import { cn } from "@/lib/utils";
import type { SetupHintPayload } from "@/lib/setup-hint";
import { SetupProgressNavWidget } from "@/components/dashboard/setup-progress-widget";
import { Badge } from "@/components/ui/badge";
import {
  getModuleReadinessForPath,
  moduleReadinessBadgeLabel,
} from "@/lib/product/module-readiness";
import { navMaturityBadgeForHref } from "@/lib/navigation/nav-maturity-governance";
import { showNavStatusBadges } from "@/lib/ui/customer-facing-dashboard";

import {
  MAX_NAV_PINS as MAX_PINS,
  MAX_NAV_RECENT as MAX_RECENT,
  NAV_PINS_STORAGE_KEY as LS_NAV_PINS,
  NAV_RECENT_STORAGE_KEY as LS_NAV_RECENT,
  NAV_SCOPE_STORAGE_KEY as LS_NAV_SCOPE,
} from "@/services/navigation/navigation-preference-service";

export type { NavLinkItem } from "@/lib/nav-config";
export { NAV_GROUPS, flattenNavLinks } from "@/lib/nav-config";
export { DashboardBreadcrumbs } from "@/components/dashboard/breadcrumbs";

function linkActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function slugId(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

const TOUR_TARGETS: Record<string, string> = {
  "/dashboard/menus": "nav-menus",
  "/dashboard/pos": "nav-pos",
  "/dashboard/storefront": "nav-storefront",
  "/dashboard/kitchen": "nav-kitchen",
};

function NavGroup({
  title,
  headerRight,
  links,
  pathname,
  locale,
  businessType,
  defaultOpen,
  onNavigate,
  navQuery,
  pins,
  onTogglePin,
  onRecordVisit,
}: {
  title: string;
  headerRight?: React.ReactNode;
  links: NavLinkItem[];
  pathname: string;
  locale: Locale;
  businessType: BusinessType | null;
  defaultOpen: boolean;
  onNavigate?: () => void;
  navQuery: string;
  pins: Set<string>;
  onTogglePin: (href: string) => void;
  onRecordVisit?: (href: string) => void;
}) {
  const hasActive = links.some((l) => linkActive(pathname, l.href));
  const [open, setOpen] = React.useState(defaultOpen || hasActive);
  const panelId = `nav-group-${slugId(title)}`;

  React.useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive]);

  const q = navQuery.trim().toLowerCase();
  const visibleLinks = React.useMemo(() => {
    if (!q) return links;
    return links.filter((l) => {
      const label = navLabelForBusinessType(locale, businessType, l.labelKey).toLowerCase();
      return label.includes(q) || l.href.toLowerCase().includes(q);
    });
  }, [links, q, locale, businessType]);

  if (visibleLinks.length === 0) return null;

  return (
    <div className="space-y-1">
      <div className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted/60">
        <button
          type="button"
          id={`${panelId}-trigger`}
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md text-left outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={open}
          aria-controls={panelId}
        >
          <span className="min-w-0 flex-1 truncate">{title}</span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open ? "rotate-180" : "")} />
        </button>
        {headerRight ? <div className="flex shrink-0 items-center">{headerRight}</div> : null}
      </div>
      {open ? (
        <div id={panelId} role="region" aria-labelledby={`${panelId}-trigger`} className="flex flex-col gap-0.5">
          {visibleLinks.map((link) => {
            const active = linkActive(pathname, link.href);
            const pinned = pins.has(link.href);
            const readiness = getModuleReadinessForPath(link.href);
            const readinessLabel = showNavStatusBadges()
              ? readiness
                ? moduleReadinessBadgeLabel(readiness.status)
                : null
              : null;
            const maturityLabel = showNavStatusBadges() ? navMaturityBadgeForHref(link.href) : null;
            const badgeLabel = readinessLabel ?? maturityLabel;
            return (
              <div key={link.href} className="group relative flex items-stretch">
                <Link
                  href={link.href}
                  data-tour={TOUR_TARGETS[link.href]}
                  onClick={() => {
                    onRecordVisit?.(link.href);
                    onNavigate?.();
                  }}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2 pr-10 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <link.icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate">
                      {navLabelForBusinessType(locale, businessType, link.labelKey)}
                    </span>
                    {badgeLabel ? (
                      <Badge
                        variant="secondary"
                        className="rounded-full px-1.5 py-0 text-[10px] uppercase tracking-wide"
                      >
                        {badgeLabel}
                      </Badge>
                    ) : null}
                  </span>
                </Link>
                <button
                  type="button"
                  title={pinned ? "Unpin from shortcuts" : "Pin to shortcuts (max 6)"}
                  aria-label={pinned ? "Unpin from shortcuts" : "Pin to shortcuts"}
                  onClick={(e) => {
                    e.preventDefault();
                    onTogglePin(link.href);
                  }}
                  className={cn(
                    "absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md border border-transparent text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:opacity-100 group-hover:opacity-100",
                    pinned ? "opacity-100 text-primary" : "",
                  )}
                >
                  {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function DashboardSidebarNav({
  locale,
  pathname,
  ownerExtras,
  onNavigate,
  businessType = null,
  businessModeLabel = null,
  navContext,
  disabledModuleKeys,
  setupHint = null,
  navReleaseProfile = "full",
}: {
  locale: Locale;
  pathname: string;
  ownerExtras: NavLinkItem[];
  onNavigate?: () => void;
  businessType?: BusinessType | null;
  businessModeLabel?: string | null;
  navContext: NavRoleContext;
  disabledModuleKeys?: readonly ModuleKey[];
  setupHint?: SetupHintPayload | null;
  /** Pilot profile hides deep modules from the default sidebar (routes still work). */
  navReleaseProfile?: NavReleaseProfile;
}) {
  const [navQuery, setNavQuery] = React.useState("");
  const [navScopeAll, setNavScopeAll] = React.useState(false);
  const [pinHrefs, setPinHrefs] = React.useState<string[]>([]);
  const [recentHrefs, setRecentHrefs] = React.useState<string[]>([]);

  const pins = React.useMemo(() => new Set(pinHrefs), [pinHrefs]);

  const recordVisit = React.useCallback((href: string) => {
    setRecentHrefs((prev) => {
      const next = [href, ...prev.filter((h) => h !== href)].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(LS_NAV_RECENT, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  React.useEffect(() => {
    const onClear = () => setRecentHrefs([]);
    window.addEventListener("kitchenos:nav-recent-cleared", onClear);
    return () => window.removeEventListener("kitchenos:nav-recent-cleared", onClear);
  }, []);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_NAV_SCOPE);
      setNavScopeAll(raw === "all");
      const p = localStorage.getItem(LS_NAV_PINS);
      if (p) {
        const arr = JSON.parse(p) as string[];
        setPinHrefs(Array.isArray(arr) ? arr.slice(0, MAX_PINS) : []);
      }
      const r = localStorage.getItem(LS_NAV_RECENT);
      if (r) setRecentHrefs(JSON.parse(r) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const persistScope = (all: boolean) => {
    setNavScopeAll(all);
    try {
      localStorage.setItem(LS_NAV_SCOPE, all ? "all" : "focused");
    } catch {
      /* ignore */
    }
  };

  const togglePin = (href: string) => {
    setPinHrefs((prev) => {
      let next: string[];
      const idx = prev.indexOf(href);
      if (idx >= 0) {
        next = prev.filter((h) => h !== href);
      } else {
        if (prev.length >= MAX_PINS) {
          next = [...prev.slice(1), href];
        } else {
          next = [...prev, href];
        }
      }
      try {
        localStorage.setItem(LS_NAV_PINS, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const clearRecent = () => {
    setRecentHrefs([]);
    try {
      localStorage.removeItem(LS_NAV_RECENT);
    } catch {
      /* ignore */
    }
  };

  const disabledSet = React.useMemo(
    () => new Set<ModuleKey>(disabledModuleKeys ?? []),
    [disabledModuleKeys],
  );

  const groups = React.useMemo(() => {
    const base = getFilteredNavGroups(
      { ...navContext, businessType, navScopeAll },
      navContext.fullNavAccess ? undefined : { disabledModuleKeys: disabledSet },
    );
    const effectiveRelease = navContext.fullNavAccess ? "full" : navReleaseProfile;
    return applyNavReleaseProfile(base, effectiveRelease);
  }, [navContext, businessType, navScopeAll, disabledSet, navReleaseProfile]);

  const linkIndex = React.useMemo(() => {
    const m = new Map<string, NavLinkItem>();
    for (const g of groups) {
      for (const l of g.links) m.set(l.href, l);
    }
    for (const l of ownerExtras) m.set(l.href, l);
    return m;
  }, [groups, ownerExtras]);

  const pinnedLinks = React.useMemo(() => {
    const out: NavLinkItem[] = [];
    for (const href of pinHrefs) {
      const item = linkIndex.get(href);
      if (item) out.push(item);
    }
    return out;
  }, [pinHrefs, linkIndex]);

  const recentLinks = React.useMemo(() => {
    const out: NavLinkItem[] = [];
    for (const href of recentHrefs) {
      if (pins.has(href)) continue;
      const item = linkIndex.get(href);
      if (item) out.push(item);
    }
    return out;
  }, [recentHrefs, linkIndex, pins]);

  const defaultOpenForGroup = (id: string) => {
    if (id === "internal" && !navContext.fullNavAccess) return false;
    return id === "today" || id === "ordersSales" || id === "menus" || id === "kitchen";
  };

  return (
    <div className="flex flex-col gap-3 px-2">
      <div className="space-y-2 px-1">
        {businessModeLabel ? (
          <p className="rounded-lg border border-border/70 bg-muted/30 px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {businessModeLabel}
          </p>
        ) : null}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={navQuery}
            onChange={(e) => setNavQuery(e.target.value)}
            placeholder="Filter navigation…"
            className="h-9 w-full rounded-lg border border-border/80 bg-muted/40 py-1 pl-8 pr-2 text-xs outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Filter navigation"
          />
        </div>
        {!navContext.fullNavAccess ? (
          <button
            type="button"
            onClick={() => persistScope(!navScopeAll)}
            className="w-full rounded-lg border border-dashed border-border/80 px-2 py-1.5 text-left text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            {navScopeAll ? "Focus recommended modules" : "Show all modules (advanced)"}
          </button>
        ) : null}
      </div>

      {setupHint ? (
        <SetupProgressNavWidget
          percent={setupHint.percent}
          nextLabel={setupHint.nextLabel}
          nextHref={setupHint.nextHref}
          why={setupHint.why}
        />
      ) : null}

      {pinnedLinks.length > 0 ? (
        <NavGroup
          title="Quick access"
          links={pinnedLinks}
          pathname={pathname}
          locale={locale}
          businessType={businessType}
          defaultOpen
          onNavigate={onNavigate}
          navQuery={navQuery}
          pins={pins}
          onTogglePin={togglePin}
          onRecordVisit={recordVisit}
        />
      ) : null}

      {recentLinks.length > 0 ? (
        <NavGroup
          title="Recently opened"
          headerRight={
            <button
              type="button"
              className="rounded px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-primary hover:bg-muted hover:underline"
              onClick={() => {
                clearRecent();
              }}
            >
              Clear
            </button>
          }
          links={recentLinks}
          pathname={pathname}
          locale={locale}
          businessType={businessType}
          defaultOpen={false}
          onNavigate={onNavigate}
          navQuery={navQuery}
          pins={pins}
          onTogglePin={togglePin}
          onRecordVisit={recordVisit}
        />
      ) : null}

      <nav className="flex flex-col gap-4" aria-label="Workspace">
        {groups.map((group) => (
          <NavGroup
            key={group.id}
            title={group.title}
            links={group.links}
            pathname={pathname}
            locale={locale}
            businessType={businessType}
            defaultOpen={defaultOpenForGroup(group.id)}
            onNavigate={onNavigate}
            navQuery={navQuery}
            pins={pins}
            onTogglePin={togglePin}
            onRecordVisit={recordVisit}
          />
        ))}
        {ownerExtras.length > 0 ? (
          <NavGroup
            title="Platform"
            links={ownerExtras}
            pathname={pathname}
            locale={locale}
            businessType={businessType}
            defaultOpen={Boolean(navContext.fullNavAccess)}
            onNavigate={onNavigate}
            navQuery={navQuery}
            pins={pins}
            onTogglePin={togglePin}
            onRecordVisit={recordVisit}
          />
        ) : null}
      </nav>

      <div className="space-y-1 border-t border-border/60 px-1 pt-3 text-[11px] text-muted-foreground">
        <Link
          href="/dashboard/settings/modules"
          onClick={onNavigate}
          className="block rounded-md px-2 py-1 hover:bg-muted/60 hover:text-foreground"
        >
          Customize sidebar (modules)
        </Link>
        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          className="block rounded-md px-2 py-1 hover:bg-muted/60 hover:text-foreground"
        >
          Switch business mode
        </Link>
        <Link
          href="/dashboard/settings/modules"
          onClick={onNavigate}
          className="block rounded-md px-2 py-1 hover:bg-muted/60 hover:text-foreground"
        >
          Reset to recommended modules
        </Link>
      </div>
    </div>
  );
}
