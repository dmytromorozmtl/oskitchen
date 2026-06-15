"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export type WorkbenchSubnavLink = {
  href: string;
  label: string;
  match?: "exact" | "prefix";
};

const DEFAULT_LINKS: WorkbenchSubnavLink[] = [
  { href: "/dashboard/product-mapping", label: "Overview", match: "exact" },
  { href: "/dashboard/product-mapping/unmapped", label: "Unmapped queue" },
  { href: "/dashboard/product-mapping/suggestions", label: "Suggestions" },
  { href: "/dashboard/product-mapping/approved", label: "Approved" },
  { href: "/dashboard/product-mapping/conflicts", label: "Conflicts" },
  { href: "/dashboard/product-mapping/bulk", label: "Bulk" },
  { href: "/dashboard/product-mapping/modifiers", label: "Modifiers" },
  { href: "/dashboard/product-mapping/aliases", label: "Rules / aliases" },
  { href: "/dashboard/product-mapping/batches", label: "Import batches" },
  { href: "/dashboard/product-mapping/health", label: "Sync health" },
  { href: "/dashboard/product-mapping/activity", label: "Activity" },
  { href: "/dashboard/product-mapping/settings", label: "Settings" },
];

export function WorkbenchSubnav({ links = DEFAULT_LINKS }: { links?: WorkbenchSubnavLink[] }) {
  const path = usePathname();
  if (links.length === 0) return null;
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border/80 pb-3">
      {links.map((l) => {
        const active =
          l.match === "exact" ? path === l.href : path === l.href || path.startsWith(`${l.href}/`);
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
