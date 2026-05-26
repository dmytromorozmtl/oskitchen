"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string }[] = [
  { href: "/dashboard/growth", label: "Overview" },
  { href: "/dashboard/growth/leads", label: "Leads" },
  { href: "/dashboard/growth/demo-requests", label: "Demos" },
  { href: "/dashboard/growth/feedback", label: "Feedback" },
  { href: "/dashboard/growth/onboarding-calls", label: "Calls" },
  { href: "/dashboard/growth/accounts", label: "Accounts" },
  { href: "/dashboard/growth/customer-success", label: "Customer success" },
  { href: "/dashboard/growth/referrals", label: "Referrals" },
  { href: "/dashboard/growth/usage", label: "Usage" },
  { href: "/dashboard/growth/launch-analytics", label: "Launch analytics" },
  { href: "/dashboard/growth/outreach", label: "Outreach" },
  { href: "/dashboard/growth/content-library", label: "Content library" },
  { href: "/dashboard/growth/roadmap", label: "Roadmap" },
];

export function GrowthSubnav() {
  const pathname = usePathname();
  return (
    <nav
      className="-mx-1 flex flex-wrap gap-1 border-b border-border/70 pb-3"
      aria-label="Growth tools"
    >
      {LINKS.map((l) => {
        const active =
          l.href === "/dashboard/growth"
            ? pathname === l.href
            : pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
