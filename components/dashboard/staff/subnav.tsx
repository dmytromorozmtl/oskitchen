"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard/staff", label: "Command Center", match: "exact" as const },
  { href: "/dashboard/staff/roster", label: "Roster" },
  { href: "/dashboard/staff/roles", label: "Roles & permissions" },
  { href: "/dashboard/staff/availability", label: "Availability" },
  { href: "/dashboard/staff/shifts", label: "Shifts" },
  { href: "/dashboard/staff/schedule", label: "Schedule" },
  { href: "/dashboard/staff/ai-scheduling", label: "AI scheduling" },
  { href: "/dashboard/staff/tip-pooling", label: "Tip pooling" },
  { href: "/dashboard/staff/labor-realtime", label: "Labor tracker" },
  { href: "/dashboard/staff/certifications", label: "Certifications" },
  { href: "/dashboard/staff/drivers", label: "Drivers" },
  { href: "/dashboard/staff/reports", label: "Reports" },
];

export function StaffSubnav() {
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
