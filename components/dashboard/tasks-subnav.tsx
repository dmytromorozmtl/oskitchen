"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; match?: "exact" | "prefix" }[] = [
  { href: "/dashboard/tasks", label: "Today", match: "exact" },
  { href: "/dashboard/tasks/kanban", label: "Kanban" },
  { href: "/dashboard/tasks/list", label: "List" },
  { href: "/dashboard/tasks/calendar", label: "Calendar" },
  { href: "/dashboard/tasks/my", label: "My tasks" },
  { href: "/dashboard/tasks/templates", label: "Templates" },
  { href: "/dashboard/tasks/recurring", label: "Recurring" },
  { href: "/dashboard/tasks/reports", label: "Reports" },
  { href: "/dashboard/tasks/settings", label: "Settings" },
];

export function TasksSubnav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border/80 pb-3 print:hidden">
      {LINKS.map((l) => {
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
