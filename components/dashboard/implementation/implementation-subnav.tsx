"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; match?: "exact" | "prefix" }[] = [
  { href: "/dashboard/implementation", label: "Overview", match: "exact" },
  { href: "/dashboard/implementation/projects", label: "Projects" },
  { href: "/dashboard/implementation/checklist", label: "Checklist" },
  { href: "/dashboard/implementation/migration", label: "Migration" },
  { href: "/dashboard/implementation/integrations", label: "Integrations" },
  { href: "/dashboard/implementation/training", label: "Training" },
  { href: "/dashboard/implementation/uat", label: "UAT" },
  { href: "/dashboard/implementation/go-live", label: "Go-Live" },
  { href: "/dashboard/implementation/risks", label: "Risks" },
  { href: "/dashboard/implementation/reports", label: "Reports" },
  { href: "/dashboard/implementation/activity", label: "Activity" },
];

export function ImplementationSubnav() {
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
