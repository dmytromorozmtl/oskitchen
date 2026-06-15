import Link from "next/link";
import { AlertTriangle, ArrowRight, PackageCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PackingKpis } from "@/lib/packing/packing-kpis";
import {
  pickPackingAttentionItems,
  summarizePackingFocus,
  type PackingFocusSnapshot,
  type PackingTaskFocus,
} from "@/lib/packing/packing-focus-era18";

export function PackingAttentionStrip(props: {
  focus: PackingFocusSnapshot;
  tasks: readonly PackingTaskFocus[];
  kpis: Pick<PackingKpis, "allergenChecksOpen" | "labelsMissing">;
}) {
  const summary = summarizePackingFocus(props.focus, props.kpis);
  const items = pickPackingAttentionItems(props.tasks, props.focus);

  if (items.length === 0) return null;

  return (
    <Card
      className="border-amber-200/80 bg-amber-50/40 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20"
      data-testid="packing-attention-strip"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PackageCheck className="h-5 w-5 text-muted-foreground" aria-hidden />
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
          Packing — handle these first
        </CardTitle>
        <CardDescription>
          {summary.hasUrgent
            ? "Allergen checks, missing labels, and verify gaps prioritized before handoff."
            : `${summary.totalSignals} open packing signal${summary.totalSignals === 1 ? "" : "s"} on today&apos;s queue.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            data-testid={`packing-attention-${item.id}`}
            className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm hover:bg-muted/40"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
