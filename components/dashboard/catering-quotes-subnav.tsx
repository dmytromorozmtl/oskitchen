"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; match?: "exact" | "prefix" }[] = [
  { href: "/dashboard/catering-quotes", label: "Overview", match: "exact" },
  { href: "/dashboard/catering-quotes/quotes", label: "Quotes" },
  { href: "/dashboard/catering-quotes/pipeline", label: "Pipeline" },
  { href: "/dashboard/catering-quotes/follow-ups", label: "Follow-ups" },
  { href: "/dashboard/catering-quotes/templates", label: "Templates" },
  { href: "/dashboard/catering-quotes/accepted", label: "Accepted / Events" },
  { href: "/dashboard/catering-quotes/public-proposals", label: "Public proposals" },
  { href: "/dashboard/catering-quotes/reports", label: "Reports" },
  { href: "/dashboard/catering-quotes/settings", label: "Settings" },
];

export function CateringQuotesSubnav() {
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
