"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; match?: "exact" | "prefix" }[] = [
  { href: "/dashboard/import-center", label: "Overview", match: "exact" },
  { href: "/dashboard/import-center/upload", label: "Upload" },
  { href: "/dashboard/import-center/history", label: "Import history" },
  { href: "/dashboard/import-center/templates", label: "Templates" },
  { href: "/dashboard/import-center/errors", label: "Error reports" },
  { href: "/dashboard/import-center/settings", label: "Settings" },
];

export function ImportCenterSubnav() {
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
