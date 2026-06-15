"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = (locationId: string) => [
  { href: `/dashboard/locations/${locationId}`, label: "Overview", match: "exact" as const },
  { href: `/dashboard/locations/${locationId}/profile`, label: "Profile" },
  { href: `/dashboard/locations/${locationId}/hours`, label: "Hours" },
  { href: `/dashboard/locations/${locationId}/fulfillment`, label: "Fulfillment" },
  { href: `/dashboard/locations/${locationId}/brands`, label: "Brands" },
  { href: `/dashboard/locations/${locationId}/menus`, label: "Menus" },
  { href: `/dashboard/locations/${locationId}/orders`, label: "Orders" },
  { href: `/dashboard/locations/${locationId}/production`, label: "Production" },
  { href: `/dashboard/locations/${locationId}/routes`, label: "Routes" },
  { href: `/dashboard/locations/${locationId}/inventory`, label: "Inventory" },
  { href: `/dashboard/locations/${locationId}/reports`, label: "Reports" },
  { href: `/dashboard/locations/${locationId}/settings`, label: "Settings" },
];

export function LocationTabs({ locationId }: { locationId: string }) {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 overflow-x-auto pb-2">
      {TABS(locationId).map((t) => {
        const active = t.match === "exact" ? path === t.href : path === t.href || path.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium",
              active
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
