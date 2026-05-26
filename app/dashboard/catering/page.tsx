import Link from "next/link";
import { format } from "date-fns";

import {
  createCateringQuoteFormAction,
  markQuoteSentFormAction,
} from "@/actions/catering";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function CateringPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const env = getServerEnv();
  const base =
    env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  const quotes = await prisma.cateringQuote.findMany({
    where: { userId: dataUserId },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Catering quotes</h1>
        <p className="max-w-2xl text-muted-foreground">
          Draft multi-line proposals, share a read-only link, and convert to orders manually until a
          guided wizard ships.
        </p>
        <p className="text-sm">
          The full pipeline, proposal editor, conversion, and reports live in the new{" "}
          <Link href="/dashboard/catering-quotes" className="text-primary underline">
            Catering Sales &amp; Event Quote Center
          </Link>
          .
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">New quote</CardTitle>
          <CardDescription>Optional first line seeds totals — add more lines later via Prisma Studio or an upcoming editor.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCateringQuoteFormAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer name</Label>
              <Input id="customerName" name="customerName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input id="customerEmail" name="customerEmail" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company</Label>
              <Input id="companyName" name="companyName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event date</Label>
              <Input id="eventDate" name="eventDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestCount">Guests</Label>
              <Input id="guestCount" name="guestCount" type="number" min={0} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>
            <div className="space-y-2 md:col-span-2 border-t pt-4">
              <p className="text-sm font-medium">Starter line (optional)</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="lineTitle">Title</Label>
              <Input id="lineTitle" name="lineTitle" placeholder="Drop-off buffet" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lineQty">Qty</Label>
              <Input id="lineQty" name="lineQty" type="number" min={1} defaultValue={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lineUnitPrice">Unit price</Label>
              <Input id="lineUnitPrice" name="lineUnitPrice" type="number" min={0} step="0.01" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="rounded-full">
                Save draft quote
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {quotes.map((q) => (
          <Card key={q.id} className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">{q.customerName}</CardTitle>
                <CardDescription>{q.customerEmail}</CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full capitalize">
                {q.status.toLowerCase()}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                {q.eventDate ? <span>Event {format(q.eventDate, "MMM d, yyyy")}</span> : null}
                {q.guestCount != null ? <span>{q.guestCount} guests</span> : null}
                <span className="font-medium text-foreground">
                  Total {formatCurrency(Number(q.total))}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link href={`${base}/quote/${q.publicToken}`} target="_blank" rel="noreferrer">
                    Public link
                  </Link>
                </Button>
                <form action={markQuoteSentFormAction}>
                  <input type="hidden" name="quoteId" value={q.id} />
                  <Button type="submit" size="sm" variant="secondary" className="rounded-full">
                    Mark sent
                  </Button>
                </form>
              </div>
              <p className="text-xs text-muted-foreground">
                Email delivery placeholder — wire Resend templates when copy is approved.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {quotes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No quotes yet</CardTitle>
          </CardHeader>
        </Card>
      ) : null}
    </div>
  );
}
