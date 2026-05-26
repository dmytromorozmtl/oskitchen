"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; match?: "exact" | "prefix" }[] = [
  { href: "/dashboard/playbooks", label: "Recommended", match: "exact" },
  { href: "/dashboard/playbooks/all", label: "All Playbooks" },
  { href: "/dashboard/playbooks/active", label: "Active Runs" },
  { href: "/dashboard/playbooks/templates", label: "Templates" },
  { href: "/dashboard/playbooks/custom", label: "Custom" },
  { href: "/dashboard/playbooks/schedule", label: "Schedule" },
  { href: "/dashboard/playbooks/reports", label: "Reports" },
  { href: "/dashboard/playbooks/settings", label: "Settings" },
];

export function PlaybooksSubnav() {
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
