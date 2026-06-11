import Link from "next/link";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { PIPELINE_COLUMNS } from "@/lib/catering/quote-status";
import { formatCurrency } from "@/lib/utils";
import { listQuotesForUser } from "@/services/catering/quote-service";

export default async function PipelinePage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const quotes = await listQuotesForUser({ userId: dataUserId }, { take: 500 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-muted-foreground">Catering quotes grouped by status.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {PIPELINE_COLUMNS.map((col) => {
          const cards = quotes.filter((q) => col.statuses.includes(q.status));
          const total = cards.reduce((acc, q) => acc + Number(q.total.toString()), 0);
          return (
            <Card key={col.id} className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{col.label}</CardTitle>
                  <Badge variant="outline" className="rounded-full">
                    {cards.length}
                  </Badge>
                </div>
                <CardDescription className="text-xs tabular-nums">
                  {formatCurrency(total)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {cards.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No quotes here.</p>
                ) : null}
                {cards.map((q) => (
                  <Link
                    key={q.id}
                    href={`/dashboard/catering-quotes/${q.id}`}
                    className="block rounded-lg border border-border/70 bg-background p-2.5 text-xs transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{q.quoteNumber ?? q.id.slice(0, 6)}</span>
                      <span className="tabular-nums">{formatCurrency(Number(q.total.toString()))}</span>
                    </div>
                    <div className="mt-1 truncate text-muted-foreground">
                      {q.companyName ?? q.customerName}
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {q.eventDate ? format(q.eventDate, "MMM d") : "No date"}
                      {q.guestCount ? ` · ${q.guestCount} ppl` : ""}
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
