"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const BASE_LINKS = [
  { href: "/dashboard/billing", label: "Overview", match: "exact" as const },
  { href: "/dashboard/billing/plans", label: "Plans" },
  { href: "/dashboard/billing/usage", label: "Usage" },
  { href: "/dashboard/billing/invoices", label: "Invoices" },
  { href: "/dashboard/billing/payment-method", label: "Payment method", portalOnly: true },
  { href: "/dashboard/billing/history", label: "History" },
  { href: "/dashboard/billing/entitlements", label: "Entitlements" },
  { href: "/dashboard/billing/cancel", label: "Cancel / downgrade", cancelOnly: true },
  { href: "/dashboard/billing/settings", label: "Settings", settingsOnly: true },
] as const;

export function BillingSubnav({
  canOpenPortal = true,
  canCancel = true,
  canViewSettings = true,
}: {
  canOpenPortal?: boolean;
  canCancel?: boolean;
  canViewSettings?: boolean;
}) {
  const path = usePathname();
  const links = BASE_LINKS.filter((l) => {
    if (l.settingsOnly && !canViewSettings) return false;
    if (l.cancelOnly && !canCancel) return false;
    if (l.portalOnly && !canOpenPortal) return false;
    return true;
  });
  return (
    <nav className="-mx-1 flex flex-wrap gap-1 overflow-x-auto border-b border-border/80 pb-3">
      {links.map((l) => {
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
