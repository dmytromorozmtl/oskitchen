"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; match?: "exact" | "prefix" }[] = [
  { href: "/dashboard/reports", label: "Overview", match: "exact" },
  { href: "/dashboard/reports/library", label: "Report library" },
  { href: "/dashboard/reports/saved", label: "Saved reports" },
  { href: "/dashboard/reports/history", label: "Recent exports" },
  { href: "/dashboard/reports/executive", label: "Executive" },
  { href: "/dashboard/reports/operations", label: "Operations" },
  { href: "/dashboard/reports/financial", label: "Financial / Margin" },
  { href: "/dashboard/reports/settings", label: "Settings" },
];

export function ReportsSubnav() {
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
