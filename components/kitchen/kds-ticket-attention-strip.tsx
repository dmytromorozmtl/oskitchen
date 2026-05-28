import Link from "next/link";
import { AlertTriangle, ArrowRight, Flame } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  pickKdsTicketAttentionItems,
  summarizeKdsTicketFocus,
  type KdsTicketFocusOrder,
  type KdsTicketFocusSnapshot,
} from "@/lib/kitchen/kds-ticket-focus-era18";

export function KdsTicketAttentionStrip(props: {
  focus: KdsTicketFocusSnapshot;
  preparing: readonly KdsTicketFocusOrder[];
  ready: readonly KdsTicketFocusOrder[];
}) {
  const summary = summarizeKdsTicketFocus(props.focus);
  const items = pickKdsTicketAttentionItems(props.preparing, props.ready, props.focus);

  if (items.length === 0) return null;

  return (
    <Card
      className="border-rose-200/80 bg-rose-50/40 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/20"
      data-testid="kds-ticket-attention-strip"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="h-5 w-5 text-muted-foreground" aria-hidden />
          <AlertTriangle className="h-5 w-5 text-rose-600" aria-hidden />
          Kitchen line — handle these first
        </CardTitle>
        <CardDescription>
          {summary.hasUrgent
            ? "Overdue prep, allergy alerts, and expo backlog prioritized before service slips."
            : `${summary.totalSignals} open signal${summary.totalSignals === 1 ? "" : "s"} on today&apos;s kitchen queue.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            data-testid={`kds-ticket-attention-${item.id}`}
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
