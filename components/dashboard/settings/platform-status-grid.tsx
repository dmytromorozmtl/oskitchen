import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone = "ok" | "warn" | "down" | "neutral";

export type PlatformStatusItem = {
  key: string;
  label: string;
  description: string;
  tone: StatusTone;
  detail?: string;
};

function toneIcon(tone: StatusTone) {
  if (tone === "ok") return CheckCircle2;
  if (tone === "warn") return AlertTriangle;
  if (tone === "down") return AlertCircle;
  return CheckCircle2;
}

function toneClasses(tone: StatusTone) {
  if (tone === "ok") return "bg-emerald-500/10 text-emerald-600 ring-emerald-500/30";
  if (tone === "warn") return "bg-amber-500/10 text-amber-700 ring-amber-500/30";
  if (tone === "down") return "bg-rose-500/10 text-rose-700 ring-rose-500/30";
  return "bg-muted text-muted-foreground ring-border/60";
}

export function PlatformStatusGrid({ items }: { items: PlatformStatusItem[] }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Platform status</CardTitle>
        <CardDescription>
          Live readiness signals for the integrations that keep KitchenOS running.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const Icon = toneIcon(it.tone);
            return (
              <li key={it.key} className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/80 p-3 text-sm">
                <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-lg ring-1", toneClasses(it.tone))}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{it.label}</span>
                    <Badge variant="outline" className={cn("text-[10px] uppercase", toneClasses(it.tone))}>
                      {it.tone === "ok" ? "Healthy" : it.tone === "warn" ? "Attention" : it.tone === "down" ? "Down" : "Unknown"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{it.description}</p>
                  {it.detail && <p className="mt-1 text-[11px] text-muted-foreground/80">{it.detail}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
