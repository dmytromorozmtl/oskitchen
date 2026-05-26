"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard/storefront/launch", label: "Launch" },
  { href: "/dashboard/storefront/website", label: "Website" },
  { href: "/dashboard/storefront/builder", label: "Builder" },
  { href: "/dashboard/storefront/media", label: "Media" },
  { href: "/dashboard/storefront/pages", label: "Pages" },
  { href: "/dashboard/storefront/theme", label: "Theme" },
  { href: "/dashboard/storefront/menu", label: "Menu" },
  { href: "/dashboard/storefront/catalog", label: "Catalog" },
  { href: "/dashboard/storefront/products", label: "Products" },
  { href: "/dashboard/storefront/markets", label: "Markets" },
  { href: "/dashboard/storefront", label: "Overview" },
  { href: "/dashboard/storefront/workspace", label: "Workspace" },
  { href: "/dashboard/storefront/team", label: "Team" },
  { href: "/dashboard/storefront/ordering", label: "Ordering" },
  { href: "/dashboard/storefront/fulfillment", label: "Fulfillment" },
  { href: "/dashboard/storefront/forms", label: "Forms" },
  { href: "/dashboard/storefront/domains", label: "Domains" },
  { href: "/dashboard/storefront/redirects", label: "Redirects" },
  { href: "/dashboard/storefront/discounts", label: "Discounts" },
  { href: "/dashboard/storefront/gift-cards", label: "Gift cards" },
  { href: "/dashboard/storefront/loyalty", label: "Loyalty" },
  { href: "/dashboard/storefront/cart-recovery", label: "Recovery" },
  { href: "/dashboard/storefront/reservations", label: "Reservations" },
  { href: "/dashboard/storefront/marketing", label: "Marketing" },
  { href: "/dashboard/storefront/reviews", label: "Reviews" },
  { href: "/dashboard/storefront/referrals", label: "Referrals" },
  { href: "/dashboard/storefront/schedule", label: "Schedule" },
  { href: "/dashboard/storefront/inventory", label: "Inventory" },
  { href: "/dashboard/storefront/seo", label: "SEO" },
  { href: "/dashboard/storefront/analytics", label: "Analytics" },
  { href: "/dashboard/storefront/notifications", label: "Notifications" },
  { href: "/dashboard/storefront/settings", label: "Settings" },
  { href: "/dashboard/storefront/advanced", label: "Advanced" },
  { href: "/dashboard/storefront/preview", label: "Preview" },
] as const;

function tabActive(pathname: string, href: string): boolean {
  if (href === "/dashboard/storefront") {
    return pathname === "/dashboard/storefront" || pathname === "/dashboard/storefront/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StorefrontSubnav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="-mx-1 flex gap-2 overflow-x-auto border-b border-border/80 pb-3 text-sm" aria-label="Storefront sections">
      {tabs.map((t) => {
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
