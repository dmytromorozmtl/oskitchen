"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CUSTOMERS_SUBNAV_LINKS,
  type CustomersSubnavLink,
} from "@/lib/crm/customers-subnav-links";
import { cn } from "@/lib/utils";

export function CustomersSubnav({ links = CUSTOMERS_SUBNAV_LINKS }: { links?: CustomersSubnavLink[] }) {
  const path = usePathname();
  if (links.length === 0) return null;
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border/80 pb-3 print:hidden">
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
