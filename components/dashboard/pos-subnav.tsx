"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { PosNavLink } from "@/lib/pos/pos-subnav-links";
import { cn } from "@/lib/utils";

export function PosSubnav({ links }: { links: PosNavLink[] }) {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border/80 pb-3 print:hidden">
      {links.map((l) => {
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
