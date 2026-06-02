"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; match?: "exact" | "prefix" }[] = [
  { href: "/dashboard/analytics", label: "Executive Overview", match: "exact" },
  { href: "/dashboard/analytics/revenue", label: "Revenue" },
  { href: "/dashboard/analytics/orders", label: "Orders" },
  { href: "/dashboard/analytics/channels", label: "Channels" },
  { href: "/dashboard/analytics/delivery-channels", label: "Delivery Channels" },
  { href: "/dashboard/analytics/customers", label: "Customers" },
  { href: "/dashboard/analytics/production", label: "Production" },
  { href: "/dashboard/analytics/delivery", label: "Packing & Delivery" },
  { href: "/dashboard/analytics/catering", label: "Catering" },
  { href: "/dashboard/analytics/meal-plans", label: "Meal Plans" },
  { href: "/dashboard/analytics/inventory", label: "Inventory & Margin" },
  { href: "/dashboard/analytics/forecasting", label: "Forecasting" },
  { href: "/dashboard/analytics/digital-twin", label: "Digital Twin" },
  { href: "/dashboard/analytics/food-cost", label: "Food Cost" },
  { href: "/dashboard/analytics/benchmarks", label: "Benchmarks" },
  { href: "/dashboard/analytics/advanced", label: "Advanced" },
  { href: "/dashboard/analytics/capital", label: "Financing resources" },
  { href: "/dashboard/analytics/reports", label: "Reports" },
  { href: "/dashboard/analytics/saved-views", label: "Saved Views" },
];

export function AnalyticsSubnav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border/80 pb-3 print:hidden">
      {LINKS.map((l) => {
        const active = l.match === "exact" ? path === l.href : path === l.href || path.startsWith(`${l.href}/`);
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
