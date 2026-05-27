"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard/storefront/launch", label: "Launch" },
  { href: "/dashboard/storefront/website", label: "Website" },
  { href: "/dashboard/storefront", label: "Overview" },
  { href: "/dashboard/storefront/analytics", label: "Analytics" },
  { href: "/dashboard/storefront/preview", label: "Preview" },
  { href: "/dashboard/storefront/seo", label: "SEO" },
  { href: "/dashboard/storefront/marketing", label: "Marketing" },
  { href: "/dashboard/storefront/reviews", label: "Reviews" },
  { href: "/dashboard/storefront/cart-recovery", label: "Recovery" },
  { href: "/dashboard/storefront/notifications", label: "Notifications" },
  { href: "/dashboard/storefront/builder", label: "Builder", manageOnly: true },
  { href: "/dashboard/storefront/media", label: "Media" },
  { href: "/dashboard/storefront/pages", label: "Pages", manageOnly: true },
  { href: "/dashboard/storefront/theme", label: "Theme", manageOnly: true },
  { href: "/dashboard/storefront/menu", label: "Menu", manageOnly: true },
  { href: "/dashboard/storefront/catalog", label: "Catalog", manageOnly: true },
  { href: "/dashboard/storefront/products", label: "Products", manageOnly: true },
  { href: "/dashboard/storefront/markets", label: "Markets", manageOnly: true },
  { href: "/dashboard/storefront/workspace", label: "Workspace", manageOnly: true },
  { href: "/dashboard/storefront/team", label: "Team", manageOnly: true },
  { href: "/dashboard/storefront/ordering", label: "Ordering", manageOnly: true },
  { href: "/dashboard/storefront/fulfillment", label: "Fulfillment", manageOnly: true },
  { href: "/dashboard/storefront/forms", label: "Forms", manageOnly: true },
  { href: "/dashboard/storefront/domains", label: "Domains", manageOnly: true },
  { href: "/dashboard/storefront/redirects", label: "Redirects", manageOnly: true },
  { href: "/dashboard/storefront/discounts", label: "Discounts", manageOnly: true },
  { href: "/dashboard/storefront/gift-cards", label: "Gift cards", manageOnly: true },
  { href: "/dashboard/storefront/loyalty", label: "Loyalty", manageOnly: true },
  { href: "/dashboard/storefront/reservations", label: "Reservations", manageOnly: true },
  { href: "/dashboard/storefront/referrals", label: "Referrals", manageOnly: true },
  { href: "/dashboard/storefront/schedule", label: "Schedule", manageOnly: true },
  { href: "/dashboard/storefront/inventory", label: "Inventory", manageOnly: true },
  { href: "/dashboard/storefront/settings", label: "Settings", manageOnly: true },
  { href: "/dashboard/storefront/advanced", label: "Advanced", manageOnly: true },
] as const;

function tabActive(pathname: string, href: string): boolean {
  if (href === "/dashboard/storefront") {
    return pathname === "/dashboard/storefront" || pathname === "/dashboard/storefront/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StorefrontSubnav({
  canManage = true,
  visibleHrefs,
}: {
  canManage?: boolean;
  canPublish?: boolean;
  canManageMedia?: boolean;
  /** When set, only these hrefs are shown (server-resolved RBAC). */
  visibleHrefs?: readonly string[];
}) {
  const pathname = usePathname() ?? "";
  const hrefSet = visibleHrefs ? new Set(visibleHrefs) : null;
  const visible = tabs.filter((t) => {
    if (hrefSet) return hrefSet.has(t.href);
    return !t.manageOnly || canManage;
  });

  return (
    <nav
      className="-mx-1 flex gap-2 overflow-x-auto border-b border-border/80 pb-3 text-sm"
      aria-label="Storefront sections"
    >
      {visible.map((t) => {
        const active = tabActive(pathname, t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={
              active
                ? "shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-medium text-primary"
                : "shrink-0 rounded-full border border-transparent px-3 py-1.5 font-medium text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
            }
            aria-current={active ? "page" : undefined}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
