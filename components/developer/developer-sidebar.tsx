"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string }[] = [
  { href: "/dashboard/developer", label: "Overview" },
  { href: "/dashboard/developer/health", label: "Platform health" },
  { href: "/dashboard/developer/releases", label: "Releases" },
  { href: "/dashboard/developer/api-keys", label: "API keys" },
  { href: "/dashboard/developer/integrations", label: "Integrations" },
  { href: "/dashboard/developer/webhooks", label: "Webhooks" },
  { href: "/dashboard/developer/jobs", label: "Queues & jobs" },
  { href: "/dashboard/developer/logs", label: "Logs" },
  { href: "/dashboard/developer/incidents", label: "Incidents" },
  { href: "/dashboard/developer/flags", label: "Feature flags" },
  { href: "/dashboard/developer/performance", label: "Performance" },
  { href: "/dashboard/developer/docs", label: "SDK & docs" },
  { href: "/dashboard/developer/tools", label: "Internal tools" },
  { href: "/dashboard/developer/email-preview", label: "Email preview" },
];

export function DeveloperSidebar() {
  const pathname = usePathname() ?? "/dashboard/developer";

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border/70 pr-4 md:block">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Developer Center
      </p>
      <nav className="flex flex-col gap-0.5 text-sm">
        {LINKS.map((l) => {
          const active =
            pathname === l.href ||
            (l.href !== "/dashboard/developer" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/80",
                active ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
