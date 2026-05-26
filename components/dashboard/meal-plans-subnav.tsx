"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; match?: "exact" | "prefix" }[] = [
  { href: "/dashboard/meal-plans", label: "Overview", match: "exact" },
  { href: "/dashboard/meal-plans/active", label: "Active" },
  { href: "/dashboard/meal-plans/cycles", label: "Cycles" },
  { href: "/dashboard/meal-plans/needs-review", label: "Needs review" },
  { href: "/dashboard/meal-plans/customers", label: "Customers" },
  { href: "/dashboard/meal-plans/templates", label: "Templates" },
  { href: "/dashboard/meal-plans/generated", label: "Generated orders" },
  { href: "/dashboard/meal-plans/paused", label: "Paused / cancelled" },
  { href: "/dashboard/meal-plans/reports", label: "Reports" },
  { href: "/dashboard/meal-plans/settings", label: "Settings" },
];

export function MealPlansSubnav() {
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
