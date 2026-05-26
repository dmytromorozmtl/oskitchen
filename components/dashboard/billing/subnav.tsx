"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard/billing", label: "Overview", match: "exact" as const },
  { href: "/dashboard/billing/plans", label: "Plans" },
  { href: "/dashboard/billing/usage", label: "Usage" },
  { href: "/dashboard/billing/invoices", label: "Invoices" },
  { href: "/dashboard/billing/payment-method", label: "Payment method" },
  { href: "/dashboard/billing/history", label: "History" },
  { href: "/dashboard/billing/entitlements", label: "Entitlements" },
  { href: "/dashboard/billing/cancel", label: "Cancel / downgrade" },
  { href: "/dashboard/billing/settings", label: "Settings" },
];

export function BillingSubnav() {
  const path = usePathname();
  return (
    <nav className="-mx-1 flex flex-wrap gap-1 overflow-x-auto border-b border-border/80 pb-3">
      {LINKS.map((l) => {
        const active = l.match === "exact" ? path === l.href : path.startsWith(l.href);
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
