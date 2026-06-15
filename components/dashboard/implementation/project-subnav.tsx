"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function ProjectSubnav({ projectId }: { projectId: string }) {
  const path = usePathname();
  const base = `/dashboard/implementation/${projectId}`;
  const links = [
    { href: base, label: "Overview", match: "exact" as const },
    { href: `${base}/checklist`, label: "Checklist" },
    { href: `${base}/timeline`, label: "Timeline" },
    { href: `${base}/migration`, label: "Migration" },
    { href: `${base}/integrations`, label: "Integrations" },
    { href: `${base}/training`, label: "Training" },
    { href: `${base}/uat`, label: "UAT" },
    { href: `${base}/go-live`, label: "Go-Live" },
    { href: `${base}/risks`, label: "Risks" },
    { href: `${base}/activity`, label: "Activity" },
  ];
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
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
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
