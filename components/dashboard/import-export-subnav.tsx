"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; match?: "exact" | "prefix" }[] = [
  { href: "/dashboard/import-export", label: "Overview", match: "exact" },
  { href: "/dashboard/import-export/import", label: "Import data" },
  { href: "/dashboard/import-export/export", label: "Export data" },
  { href: "/dashboard/import-export/templates", label: "Templates" },
  { href: "/dashboard/import-export/imports", label: "Import history" },
  { href: "/dashboard/import-export/exports", label: "Export history" },
  { href: "/dashboard/import-export/validation-errors", label: "Validation errors" },
  { href: "/dashboard/import-export/settings", label: "Settings" },
];

export function ImportExportSubnav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border/80 pb-3">
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
