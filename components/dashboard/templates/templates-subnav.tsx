"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; match?: "exact" | "prefix" }[] = [
  { href: "/dashboard/templates", label: "Recommended", match: "exact" },
  { href: "/dashboard/templates/all", label: "All Templates" },
  { href: "/dashboard/templates/starters", label: "Business Starters" },
  { href: "/dashboard/templates/module-packs", label: "Module Packs" },
  { href: "/dashboard/templates/playbooks", label: "Playbooks" },
  { href: "/dashboard/templates/storefront", label: "Storefront" },
  { href: "/dashboard/templates/imports", label: "Import Templates" },
  { href: "/dashboard/templates/history", label: "Applied History" },
];

export function TemplatesSubnav() {
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
