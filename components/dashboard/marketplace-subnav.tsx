"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export const MARKETPLACE_SUBNAV_LINKS = [
  { href: "/dashboard/marketplace", label: "Discover", exact: true },
  { href: "/dashboard/marketplace/catalog", label: "Catalog" },
  { href: "/dashboard/marketplace/checkout", label: "Cart" },
  { href: "/dashboard/marketplace/vendors", label: "My Vendors" },
  { href: "/dashboard/marketplace/orders", label: "Orders" },
  { href: "/dashboard/marketplace/orders?tab=po", label: "PO" },
  { href: "/dashboard/marketplace/analytics", label: "Analytics" },
  { href: "/dashboard/marketplace/compare", label: "Compare" },
  { href: "/dashboard/marketplace/wishlist", label: "Wish List" },
] as const;

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) {
    return pathname === href || pathname === `${href}/`;
  }
  const base = href.split("?")[0] ?? href;
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function MarketplaceSubnav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="-mx-1 flex gap-2 overflow-x-auto border-b border-border/80 pb-3 text-sm"
      aria-label="Marketplace sections"
    >
      {MARKETPLACE_SUBNAV_LINKS.map((link) => {
        const active = isActive(pathname, link.href, "exact" in link ? link.exact : false);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
