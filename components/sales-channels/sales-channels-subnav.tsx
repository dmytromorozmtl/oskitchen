"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS: { href: string; label: string }[] = [
  { href: "/dashboard/sales-channels", label: "Overview" },
  { href: "/dashboard/sales-channels/connected", label: "Connected channels" },
  { href: "/dashboard/sales-channels/available", label: "Available channels" },
  { href: "/dashboard/sales-channels/attention", label: "Needs attention" },
  { href: "/dashboard/sales-channels/staging", label: "Import staging" },
  { href: "/dashboard/sales-channels/conflicts", label: "Conflicts" },
  { href: "/dashboard/sales-channels/rules", label: "Rules" },
  { href: "/dashboard/sales-channels/handoff", label: "Handoff" },
  { href: "/dashboard/sales-channels/simulator", label: "Simulator" },
  { href: "/dashboard/sales-channels/webhook-lab", label: "Webhook lab" },
  { href: "/dashboard/sales-channels/sync-jobs", label: "Sync jobs" },
  { href: "/dashboard/sales-channels/webhooks", label: "Webhooks" },
  { href: "/dashboard/sales-channels/mapping", label: "Mapping" },
  { href: "/dashboard/sales-channels/analytics", label: "Analytics" },
  { href: "/dashboard/sales-channels/health", label: "Health" },
  { href: "/dashboard/sales-channels/reliability", label: "Reliability" },
  { href: "/dashboard/sales-channels/assistant", label: "Assistant" },
  { href: "/dashboard/sales-channels/settings", label: "Settings" },
];

export function SalesChannelsSubnav() {
  const pathname = usePathname();
  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-border/70 pb-2 text-sm"
      aria-label="Sales channels sections"
    >
      {TABS.map((t) => {
        const active =
          t.href === "/dashboard/sales-channels"
            ? pathname === t.href
            : pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
