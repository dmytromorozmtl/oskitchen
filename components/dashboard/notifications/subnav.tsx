"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard/notifications", label: "Overview" },
  { href: "/dashboard/notifications/templates", label: "Templates" },
  { href: "/dashboard/notifications/rules", label: "Rules" },
  { href: "/dashboard/notifications/alerts", label: "Internal alerts" },
  { href: "/dashboard/notifications/log", label: "Log" },
  { href: "/dashboard/notifications/retry", label: "Retry" },
  { href: "/dashboard/notifications/provider", label: "Provider" },
  { href: "/dashboard/notifications/preferences", label: "Preferences" },
  { href: "/dashboard/notifications/settings", label: "Settings" },
];

export function NotificationsSubnav() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="flex flex-wrap gap-2 text-xs">
      {TABS.map((t) => {
        const active = t.href === "/dashboard/notifications"
          ? pathname === t.href
          : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "rounded-full border px-3 py-1.5 font-medium transition-colors",
              active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
