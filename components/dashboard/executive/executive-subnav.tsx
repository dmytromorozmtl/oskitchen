"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; match?: "exact" | "prefix" }[] = [
  { href: "/dashboard/executive", label: "Overview", match: "exact" },
  { href: "/dashboard/executive/revenue", label: "Revenue & orders" },
  { href: "/dashboard/executive/operations", label: "Operations" },
  { href: "/dashboard/executive/customers", label: "Customers" },
  { href: "/dashboard/executive/profitability", label: "Profitability" },
  { href: "/dashboard/executive/brands-locations", label: "Brands & locations" },
  { href: "/dashboard/executive/risks", label: "Risks" },
  { href: "/dashboard/executive/report", label: "Report" },
];

export function ExecutiveSubnav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border/80 pb-3 print:hidden">
      {LINKS.map((l) => {
        const active =
          l.match === "exact"
            ? path === l.href
            : path === l.href || path.startsWith(`${l.href}/`);
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
