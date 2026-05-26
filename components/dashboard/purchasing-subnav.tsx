"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard/purchasing", label: "Overview" },
  { href: "/dashboard/purchasing/reorder-queue", label: "Reorder queue" },
  { href: "/dashboard/purchasing/purchase-orders", label: "Purchase orders" },
  { href: "/dashboard/purchasing/suppliers", label: "Suppliers" },
  { href: "/dashboard/purchasing/receiving", label: "Receiving" },
  { href: "/dashboard/purchasing/price-history", label: "Price history" },
  { href: "/dashboard/purchasing/exports", label: "Exports" },
  { href: "/dashboard/inventory/demand", label: "Ingredient demand" },
];

export function PurchasingSubnav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border/80 pb-3">
      {LINKS.map((l) => {
        const active = path === l.href || (l.href !== "/dashboard/purchasing" && path.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
