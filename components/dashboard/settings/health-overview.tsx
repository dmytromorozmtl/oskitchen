import Link from "next/link";
import { CheckCircle2, AlertTriangle, AlertCircle, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { SectionHealth } from "@/lib/settings/health-score";
import { overallReadiness, readinessTone } from "@/lib/settings/health-score";

const SECTION_LINKS: Record<SectionHealth["section"], string> = {
  workspace: "/dashboard/settings/workspace",
  branding: "/dashboard/settings/branding",
  operations: "/dashboard/settings/operations",
  orders: "/dashboard/settings/orders",
  production: "/dashboard/settings/production",
  packing: "/dashboard/settings/packing",
  delivery: "/dashboard/settings/delivery",
  crm: "/dashboard/settings/crm",
  storefront: "/dashboard/settings/storefront",
  notifications: "/dashboard/settings/notifications",
  integrations: "/dashboard/settings/integrations",
  billing: "/dashboard/settings/billing",
  security: "/dashboard/settings/security",
  compliance: "/dashboard/settings/compliance",
  ai: "/dashboard/settings/ai",
};

function toneStyles(score: number) {
  const tone = readinessTone(score);
  if (tone === "danger") return { ring: "ring-rose-500/40", bar: "bg-rose-500", label: "Needs attention", Icon: AlertCircle };
  if (tone === "warning") return { ring: "ring-amber-500/40", bar: "bg-amber-500", label: "In progress", Icon: AlertTriangle };
  return { ring: "ring-emerald-500/40", bar: "bg-emerald-500", label: "Ready", Icon: CheckCircle2 };
}

export type HealthOverviewProps = {
  sections: SectionHealth[];
};

export function HealthOverview({ sections }: HealthOverviewProps) {
  const overall = overallReadiness(sections);
  const tone = toneStyles(overall);
  const ToneIcon = tone.Icon;
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Workspace readiness</CardTitle>
            <CardDescription>
              Configuration coverage across the most operationally critical surfaces.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn("flex items-center gap-1 rounded-full border-transparent ring-2", tone.ring)}
          >
            <ToneIcon className="h-3 w-3" aria-hidden />
            {overall}% · {tone.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={overall} className="h-2" />
        <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <SectionHealthTile key={s.section} section={s} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SectionHealthTile({ section }: { section: SectionHealth }) {
  const tone = toneStyles(section.score);
  return (
    <Link
      href={SECTION_LINKS[section.section]}
      className="group flex flex-col gap-2 rounded-xl border border-border/70 bg-background/80 p-3 text-sm transition hover:border-primary/50 hover:bg-primary/5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{section.label}</span>
        <ArrowUpRight className="h-3 w-3 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-semibold tabular-nums">{section.score}%</span>
        <span className={cn("text-[10px] uppercase tracking-wider", section.score < 50 ? "text-rose-600" : section.score < 80 ? "text-amber-600" : "text-emerald-600")}>
          {tone.label}
        </span>
      </div>
      <div className={cn("h-1.5 rounded-full bg-muted")}>
        <div className={cn("h-full rounded-full", tone.bar)} style={{ width: `${section.score}%` }} />
      </div>
      <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
        {section.checks.slice(0, 3).map((c) => (
          <li key={c.key} className="flex items-center gap-1">
            <span className={cn("h-1.5 w-1.5 rounded-full", c.passed ? "bg-emerald-500" : "bg-muted-foreground/40")} aria-hidden />
            <span className={cn(c.passed ? "" : "text-foreground")}>{c.label}</span>
          </li>
        ))}
      </ul>
    </Link>
  );
}
