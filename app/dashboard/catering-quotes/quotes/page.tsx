import Link from "next/link";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  CATERING_QUOTE_STATUS_BADGE,
  CATERING_QUOTE_STATUS_LABEL,
} from "@/lib/catering/quote-status";
import { formatCurrency } from "@/lib/utils";
import { listQuotesForUser } from "@/services/catering/quote-service";

export default async function QuotesListPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const quotes = await listQuotesForUser({ userId: dataUserId }, { take: 200 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">All quotes</h1>
        <p className="text-muted-foreground">All catering quotes scoped to your workspace.</p>
      </div>
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quotes ({quotes.length})</CardTitle>
          <CardDescription>Sorted by status then event date.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {quotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quotes yet.</p>
          ) : null}
          {quotes.map((q) => (
            <Link
              key={q.id}
              href={`/dashboard/catering-quotes/${q.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2 transition-colors hover:bg-muted/40"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {q.quoteNumber ?? q.id.slice(0, 8)} · {q.customerName}
                  {q.companyName ? ` · ${q.companyName}` : ""}
                </span>
                <span className="text-xs text-muted-foreground">
                  {q.eventDate ? format(q.eventDate, "MMM d, yyyy") : "No event date"}
                  {q.guestCount ? ` · ${q.guestCount} guests` : ""}
                  {q.items.length ? ` · ${q.items.length} lines` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={CATERING_QUOTE_STATUS_BADGE[q.status]} className="rounded-full">
                  {CATERING_QUOTE_STATUS_LABEL[q.status]}
                </Badge>
                <span className="text-sm font-medium tabular-nums">{formatCurrency(Number(q.total.toString()))}</span>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
