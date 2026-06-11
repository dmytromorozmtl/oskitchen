import Link from "next/link";
import { format } from "date-fns";
import { CalendarHeart } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  CATERING_QUOTE_STATUS_BADGE,
  CATERING_QUOTE_STATUS_LABEL,
} from "@/lib/catering/quote-status";
import { formatCurrency } from "@/lib/utils";
import { listQuotesForUser } from "@/services/catering/quote-service";

export default async function AcceptedEventsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const quotes = await listQuotesForUser(
    { userId: dataUserId },
    { status: ["ACCEPTED", "CONVERTED_TO_ORDER"], take: 200 },
  );

  if (quotes.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Accepted / Events</h1>
          <p className="text-muted-foreground">Accepted catering quotes and the events they&apos;ve turned into.</p>
        </div>
        <EmptyState
          icon={CalendarHeart}
          title="No accepted catering events yet"
          description="Accepted quotes can be converted into orders, production plans, packing lists, and routes."
          primaryLabel="View pipeline"
          primaryHref="/dashboard/catering-quotes/pipeline"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Accepted / Events</h1>
        <p className="text-muted-foreground">
          Convert accepted quotes to draft orders to hand off production, packing, and delivery.
        </p>
      </div>
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Accepted &amp; converted ({quotes.length})</CardTitle>
          <CardDescription>Sorted by event date.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {quotes.map((q) => (
            <Link
              key={q.id}
              href={`/dashboard/catering-quotes/${q.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2 transition-colors hover:bg-muted/40"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {q.quoteNumber ?? q.id.slice(0, 8)} · {q.customerName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {q.eventDate ? format(q.eventDate, "MMM d, yyyy") : "No event date"}
                  {q.guestCount ? ` · ${q.guestCount} guests` : ""}
                  {q.convertedOrderId ? ` · order linked` : " · no order yet"}
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
