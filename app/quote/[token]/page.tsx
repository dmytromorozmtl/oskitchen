import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CATERING_EVENT_TYPE_LABEL,
  CATERING_LINE_TYPE_LABEL,
  CATERING_SERVICE_STYLE_LABEL,
} from "@/lib/catering/quote-types";
import { loadPublicProposal } from "@/services/catering/proposal-service";
import { formatCurrency } from "@/lib/utils";

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const h = await headers();
  const ipHash = h.get("x-forwarded-for") ?? h.get("x-real-ip");
  const ua = h.get("user-agent");

  const result = await loadPublicProposal(token, { ipHash, userAgent: ua });
  if (!result.ok) {
    if (result.reason === "revoked") {
      return (
        <div className="min-h-screen bg-muted/30 px-4 py-12">
          <div className="mx-auto max-w-lg space-y-4 text-center">
            <h1 className="text-2xl font-semibold">This proposal link has been revoked</h1>
            <p className="text-sm text-muted-foreground">
              Please contact the caterer to receive an updated link.
            </p>
          </div>
        </div>
      );
    }
    notFound();
  }

  const p = result.payload;
  const isExpired = p.status === "EXPIRED" || (p.validUntil ? new Date(p.validUntil) < new Date() : false);

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="border-border/80 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">
                {p.eventName ?? "Catering proposal"}
              </CardTitle>
              <Badge variant={isExpired ? "destructive" : "outline"} className="rounded-full">
                {isExpired ? "Expired" : p.status.toLowerCase()}
              </Badge>
            </div>
            <CardDescription>
              {p.brandName ? `${p.brandName} · ` : ""}
              Quote {p.quoteNumber ?? ""} — prepared for {p.customerName}
              {p.companyName ? `, ${p.companyName}` : ""}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>{CATERING_EVENT_TYPE_LABEL[p.eventType]}</span>
              <span>·</span>
              <span>{CATERING_SERVICE_STYLE_LABEL[p.serviceStyle]}</span>
            </div>
            {p.eventDate ? (
              <p>
                <span className="text-muted-foreground">Event date</span>{" "}
                <strong>{format(new Date(p.eventDate), "MMM d, yyyy")}</strong>
                {p.eventStartTime ? (
                  <> · {format(new Date(p.eventStartTime), "h:mma")}{p.eventEndTime ? `–${format(new Date(p.eventEndTime), "h:mma")}` : ""}</>
                ) : null}
              </p>
            ) : null}
            {p.guestCount != null ? (
              <p>
                <span className="text-muted-foreground">Guests</span> <strong>{p.guestCount}</strong>
              </p>
            ) : null}
            {p.clientNotes ? (
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">From the caterer</p>
                <p>{p.clientNotes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Line items</CardTitle>
            <CardDescription>The proposal includes:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {p.lines.length === 0 ? (
              <p className="text-sm text-muted-foreground">Items will appear here once added.</p>
            ) : (
              <ul className="space-y-2">
                {p.lines.map((line) => (
                  <li
                    key={line.id}
                    className="flex flex-wrap justify-between gap-3 border-b border-border/60 pb-2 text-sm last:border-0"
                  >
                    <div>
                      <p>
                        {line.quantity}× {line.title}
                        {line.unit ? ` ${line.unit}` : ""}
                      </p>
                      {line.description ? <p className="text-xs text-muted-foreground">{line.description}</p> : null}
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {CATERING_LINE_TYPE_LABEL[line.lineType]}
                      </p>
                    </div>
                    <span className="tabular-nums">{formatCurrency(line.total)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="space-y-1 border-t pt-3 text-sm">
              <Row label="Subtotal" value={p.subtotal} />
              {p.serviceFee > 0 ? <Row label="Service fee" value={p.serviceFee} /> : null}
              {p.deliveryFee > 0 ? <Row label="Delivery fee" value={p.deliveryFee} /> : null}
              {p.setupFee > 0 ? <Row label="Setup fee" value={p.setupFee} /> : null}
              {p.staffingFee > 0 ? <Row label="Staffing fee" value={p.staffingFee} /> : null}
              {p.discount > 0 ? <Row label="Discount" value={-p.discount} /> : null}
              {p.tax > 0 ? <Row label="Tax" value={p.tax} /> : null}
              <Row label="Total" value={p.total} strong />
            </div>
          </CardContent>
        </Card>

        {(p.allergyNotes || p.dietaryNotes) ? (
          <Card className="border-amber-300/60 bg-amber-50/40 shadow-md dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="text-base">Dietary &amp; allergy notes</CardTitle>
              <CardDescription>
                Please verify these match your group&apos;s needs before confirming.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {p.allergyNotes ? <p><strong>Allergies:</strong> {p.allergyNotes}</p> : null}
              {p.dietaryNotes ? <p><strong>Dietary:</strong> {p.dietaryNotes}</p> : null}
            </CardContent>
          </Card>
        ) : null}

        {p.validUntil ? (
          <p className="text-center text-xs text-muted-foreground">
            Valid until {format(new Date(p.validUntil), "MMM d, yyyy")}.
          </p>
        ) : null}
        <p className="text-center text-xs text-muted-foreground">
          To accept or request changes, reply to the caterer directly. (E-signature and payment hooks coming soon.)
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "font-semibold" : ""}`}>
      <span>{label}</span>
      <span className="tabular-nums">{formatCurrency(value)}</span>
    </div>
  );
}
