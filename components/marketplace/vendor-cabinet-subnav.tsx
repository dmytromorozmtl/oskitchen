"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export const VENDOR_CABINET_LINKS = [
  { href: "/vendor/dashboard", label: "Portal", exact: true },
  { href: "/vendor/orders", label: "Orders" },
  { href: "/vendor/invoices", label: "Invoices" },
  { href: "/vendor/analytics", label: "Analytics" },
  { href: "/vendor/products", label: "Products" },
  { href: "/vendor/finance", label: "Finance" },
  { href: "/vendor/settings", label: "Settings" },
] as const;

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href || pathname === `${href}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function VendorCabinetSubnav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="-mx-1 flex gap-2 overflow-x-auto border-b border-border/80 pb-3 text-sm"
      aria-label="Vendor cabinet"
    >
      {VENDOR_CABINET_LINKS.map((link) => {
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
