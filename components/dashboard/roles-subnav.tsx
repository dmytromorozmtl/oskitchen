"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard/roles/owner", label: "Owner" },
  { href: "/dashboard/roles/manager", label: "Manager" },
  { href: "/dashboard/roles/chef", label: "Chef" },
  { href: "/dashboard/roles/cashier", label: "Cashier" },
  { href: "/dashboard/roles/driver", label: "Driver" },
] as const;

export function RolesSubnav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border/80 pb-3 print:hidden">
      {LINKS.map((link) => {
        const active = path === link.href || path.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
