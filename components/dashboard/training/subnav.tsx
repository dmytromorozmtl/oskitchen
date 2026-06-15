"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard/training", label: "Command Center", match: "exact" as const },
  { href: "/dashboard/training/programs", label: "Programs" },
  { href: "/dashboard/training/assignments", label: "Assignments" },
  { href: "/dashboard/training/certifications", label: "Certifications" },
  { href: "/dashboard/training/sops", label: "SOPs" },
  { href: "/dashboard/training/simulations", label: "Simulations" },
  { href: "/dashboard/training/analytics", label: "Analytics" },
  { href: "/dashboard/training/practice", label: "Practice mode" },
  { href: "/dashboard/training/tablet", label: "Tablet kiosk" },
  { href: "/dashboard/training/kitchen", label: "Kitchen (legacy)" },
  { href: "/dashboard/training/packing", label: "Packing (legacy)" },
  { href: "/dashboard/training/manager", label: "Manager (legacy)" },
];

export function TrainingSubnav() {
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
