import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import type { BusinessType } from "@prisma/client";

import { getFilteredNavGroups, type NavRoleContext } from "@/lib/business-modes";
import { flattenNavLinks, type NavLinkItem } from "@/lib/nav-config";
import { navLabelForBusinessType } from "@/lib/terminology";
import type { ModuleKey } from "@/lib/module-visibility";

export function DashboardBreadcrumbs({
  pathname,
  locale,
  ownerExtras = [],
  businessType = null,
  navContext,
  disabledModuleKeys = [],
}: {
  pathname: string;
  locale: Locale;
  ownerExtras?: NavLinkItem[];
  businessType?: BusinessType | null;
  navContext: NavRoleContext;
  disabledModuleKeys?: readonly ModuleKey[];
}) {
  const disabledSet = new Set<ModuleKey>(disabledModuleKeys ?? []);
  const groups = getFilteredNavGroups(
    { ...navContext, businessType, navScopeAll: true },
    navContext.fullNavAccess ? undefined : { disabledModuleKeys: disabledSet },
  );
  const map = new Map(
    flattenNavLinks(groups, ownerExtras).map((l) => [
      l.href,
      navLabelForBusinessType(locale, businessType, l.labelKey),
    ]),
  );

  const segments = pathname.replace(/^\/dashboard\/?/, "").split("/").filter(Boolean);
  const crumbs: { href: string; label: string }[] = [
    { href: "/dashboard", label: navLabelForBusinessType(locale, businessType, "nav.dashboard") },
  ];

  let acc = "/dashboard";
  for (const seg of segments) {
    acc = `${acc}/${seg}`;
    const label = map.get(acc);
    crumbs.push({
      href: acc,
      label: label ?? seg.replace(/-/g, " "),
    });
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
      <ol className="flex max-w-[65vw] flex-wrap items-center gap-1 lg:max-w-xl">
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-1">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {i === crumbs.length - 1 ? (
              <span className="font-medium text-foreground">{c.label}</span>
            ) : (
              <Link href={c.href} className="hover:text-foreground hover:underline">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
