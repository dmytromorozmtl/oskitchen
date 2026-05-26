import Link from "next/link";
import { ClipboardList, HeartPulse, Radio, Shield, AlertTriangle } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";

const PAGES = [
  {
    href: "/dashboard/food-safety/temperature",
    label: "Temperature logs",
    desc: "Fridge, freezer, and hot-holding temperature records",
    icon: HeartPulse,
  },
  {
    href: "/dashboard/food-safety/checklists",
    label: "HACCP checklists",
    desc: "Daily and shift checklists with pass/fail",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/food-safety/audits",
    label: "Audits",
    desc: "Periodic food safety audits with evidence",
    icon: Shield,
  },
  {
    href: "/dashboard/food-safety/allergens",
    label: "Allergen management",
    desc: "Declarations and conflict detection",
    icon: AlertTriangle,
  },
  {
    href: "/dashboard/food-safety/iot-devices",
    label: "IoT devices",
    desc: "Sensor feeds and out-of-range alerts",
    icon: Radio,
  },
] as const;

export default function FoodSafetyOverviewPage() {
  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Food safety</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Temperature monitoring, HACCP compliance, allergen tracking, and audits.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PAGES.map((page) => {
          const Icon = page.icon;
          return (
            <Link
              key={page.href}
              href={page.href}
              className="rounded-xl border border-border/80 bg-card p-5 transition-shadow hover:shadow-md"
            >
              <Icon className="mb-2 h-5 w-5 text-primary" aria-hidden />
              <h2 className="font-semibold">{page.label}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{page.desc}</p>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
