"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard/costing", label: "Overview" },
  { href: "/dashboard/costing/avt", label: "AvT foundation" },
  { href: "/dashboard/costing/menus", label: "Menus" },
  { href: "/dashboard/costing/recipes-missing", label: "Recipes missing" },
  { href: "/dashboard/costing/components", label: "Cost components" },
  { href: "/dashboard/costing/channel-fees", label: "Channel fees" },
  { href: "/dashboard/costing/scenarios", label: "Pricing scenarios" },
  { href: "/dashboard/costing/alerts", label: "Alerts" },
  { href: "/dashboard/costing/reports", label: "Reports" },
  { href: "/dashboard/costing/settings", label: "Settings" },
];

export function CostingSubnav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border/80 pb-3">
      {LINKS.map((l) => {
        const active = path === l.href || (l.href !== "/dashboard/costing" && path.startsWith(l.href));
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
