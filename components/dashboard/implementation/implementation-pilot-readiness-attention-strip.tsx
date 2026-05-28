import Link from "next/link";
import { AlertTriangle, ArrowRight, ClipboardCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  pickImplementationPilotReadinessAttentionItems,
  summarizeImplementationPilotReadiness,
  type ImplementationPilotReadinessModel,
} from "@/lib/implementation/implementation-pilot-readiness-focus-era18";

export function ImplementationPilotReadinessAttentionStrip(props: {
  model: ImplementationPilotReadinessModel;
}) {
  const items = pickImplementationPilotReadinessAttentionItems(props.model);
  const summary = summarizeImplementationPilotReadiness(items);

  if (items.length === 0) return null;

  return (
    <Card
      className="border-amber-200/80 bg-amber-50/40 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20"
      data-testid="implementation-pilot-readiness-attention-strip"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardCheck className="h-5 w-5 text-muted-foreground" aria-hidden />
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
          Pilot readiness — resolve before go-live
        </CardTitle>
        <CardDescription>
          {summary.hasUrgent
            ? "Channel pilot, SSO, and launch validation gaps prioritized for this workspace."
            : `${summary.totalSignals} pilot signal${summary.totalSignals === 1 ? "" : "s"} — complete before paid pilot cutover.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            data-testid={`implementation-pilot-readiness-${item.id}`}
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
