import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertTriangle, AlertCircle, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type BridgeStatusTone = "ok" | "warn" | "down" | "neutral";

export type BridgeKeyValue = {
  label: string;
  value: string;
  tone?: BridgeStatusTone;
};

export type BridgeCardProps = {
  title: string;
  description: string;
  href: string;
  ctaLabel?: string;
  /** Optional small stats above the description. */
  stats?: BridgeKeyValue[];
  /** Optional bullet checklist. */
  checks?: { label: string; ok: boolean; hint?: string }[];
  /** Optional secondary actions. */
  secondaryActions?: { label: string; href: string }[];
  /** Overall tone for the badge. */
  status?: { label: string; tone: BridgeStatusTone };
};

function toneIcon(tone: BridgeStatusTone) {
  if (tone === "ok") return CheckCircle2;
  if (tone === "warn") return AlertTriangle;
  if (tone === "down") return AlertCircle;
  return Circle;
}

function toneBadgeClasses(tone: BridgeStatusTone) {
  if (tone === "ok") return "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30";
  if (tone === "warn") return "bg-amber-500/10 text-amber-800 ring-amber-500/30";
  if (tone === "down") return "bg-rose-500/10 text-rose-700 ring-rose-500/30";
  return "bg-muted text-muted-foreground ring-border/60";
}

export function BridgeCard({
  title,
  description,
  href,
  ctaLabel,
  stats,
  checks,
  secondaryActions,
  status,
}: BridgeCardProps) {
  const StatusIcon = status ? toneIcon(status.tone) : null;
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {status && StatusIcon && (
            <Badge variant="outline" className={cn("flex items-center gap-1 rounded-full ring-2", toneBadgeClasses(status.tone))}>
              <StatusIcon className="h-3 w-3" aria-hidden />
              {status.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats && stats.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border/70 bg-background/60 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className={cn("mt-1 text-sm font-semibold", s.tone === "warn" ? "text-amber-700" : s.tone === "down" ? "text-rose-700" : s.tone === "ok" ? "text-emerald-700" : "")}>{s.value}</p>
              </div>
            ))}
          </div>
        )}
        {checks && checks.length > 0 && (
          <ul className="space-y-1 text-sm">
            {checks.map((c) => {
              const Icon = c.ok ? CheckCircle2 : AlertTriangle;
              return (
                <li key={c.label} className="flex items-start gap-2">
                  <Icon className={cn("mt-0.5 h-4 w-4", c.ok ? "text-emerald-600" : "text-amber-600")} aria-hidden />
                  <div>
                    <p className="font-medium">{c.label}</p>
                    {c.hint && <p className="text-xs text-muted-foreground">{c.hint}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button asChild size="sm">
            <Link href={href}>
              {ctaLabel ?? "Open"} <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
          {secondaryActions?.map((a) => (
            <Button key={a.href} asChild size="sm" variant="ghost">
              <Link href={a.href}>{a.label}</Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
