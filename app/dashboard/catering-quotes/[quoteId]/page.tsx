import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

import {
  addCateringQuoteLineFormAction,
  convertCateringQuoteFormAction,
  createCateringFollowUpFormAction,
  removeCateringQuoteLineFormAction,
  revokeCateringPublicLinkFormAction,
  rotateCateringPublicLinkFormAction,
  setCateringQuoteStatusFormAction,
  snapshotCateringQuoteVersionFormAction,
  updateCateringQuoteFormAction,
} from "@/actions/catering-quotes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getServerEnv } from "@/lib/env";
import { perPersonPrice } from "@/lib/catering/quote-calculations";
import {
  CATERING_QUOTE_STATUS_BADGE,
  CATERING_QUOTE_STATUS_LABEL,
  CATERING_QUOTE_STATUS_VALUES,
  canTransitionQuoteStatus,
} from "@/lib/catering/quote-status";
import {
  CATERING_EVENT_TYPE_LABEL,
  CATERING_EVENT_TYPE_VALUES,
  CATERING_LINE_TYPE_LABEL,
  CATERING_LINE_TYPE_VALUES,
  CATERING_PRICING_MODE_LABEL,
  CATERING_PRICING_MODE_VALUES,
  CATERING_SERVICE_STYLE_LABEL,
  CATERING_SERVICE_STYLE_VALUES,
} from "@/lib/catering/quote-types";
import { workflowsForEvent } from "@/lib/catering/event-workflows";
import { formatCurrency } from "@/lib/utils";
import { getQuoteForUser } from "@/services/catering/quote-service";
import { previewQuoteConversion } from "@/services/catering/quote-conversion-service";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ quoteId: string }>;
}) {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const { quoteId } = await params;
  const quote = await getQuoteForUser({ userId: dataUserId }, quoteId);
  if (!quote) notFound();

  const env = getServerEnv();
  const base = env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const isRevoked = quote.publicToken.startsWith("revoked-");
  const totalNum = Number(quote.total.toString());
  const pp = perPersonPrice(totalNum, quote.guestCount);
  const flags = workflowsForEvent(quote.eventType, quote.serviceStyle);

  const allowedNextStatuses = CATERING_QUOTE_STATUS_VALUES.filter((s) => canTransitionQuoteStatus(quote.status, s));
  const conversionPreview = await previewQuoteConversion({ userId: dataUserId }, quote.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {quote.quoteNumber ?? `Quote ${quote.id.slice(0, 8)}`}
          </h1>
          <p className="text-muted-foreground">
            {quote.customerName}
            {quote.companyName ? ` · ${quote.companyName}` : ""}
            {quote.eventDate ? ` · ${format(quote.eventDate, "MMM d, yyyy")}` : ""}
            {quote.guestCount ? ` · ${quote.guestCount} guests` : ""}
          </p>
        </div>
        <Badge variant={CATERING_QUOTE_STATUS_BADGE[quote.status]} className="rounded-full">
          {CATERING_QUOTE_STATUS_LABEL[quote.status]}
        </Badge>
      </div>

      {/* Overview KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardDescription>Total</CardDescription><CardTitle className="text-2xl tabular-nums">{formatCurrency(totalNum)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Per person</CardDescription><CardTitle className="text-2xl tabular-nums">{pp != null ? formatCurrency(pp) : "—"}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Margin estimate</CardDescription><CardTitle className="text-2xl tabular-nums">{quote.estimatedMargin != null ? formatCurrency(Number(quote.estimatedMargin.toString())) : "—"}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Lines</CardDescription><CardTitle className="text-2xl tabular-nums">{quote.items.length}</CardTitle></CardHeader></Card>
      </div>

      {/* Status actions */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Status &amp; actions</CardTitle>
          <CardDescription>Move the quote through the pipeline. Transitions are validated server-side.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {allowedNextStatuses.length === 0 ? (
            <p className="text-xs text-muted-foreground">Terminal status — no transitions available.</p>
          ) : null}
          {allowedNextStatuses.map((status) => (
            <form key={status} action={setCateringQuoteStatusFormAction}>
              <input type="hidden" name="quoteId" value={quote.id} />
              <input type="hidden" name="status" value={status} />
              <Button type="submit" size="sm" variant="outline" className="rounded-full">
                → {CATERING_QUOTE_STATUS_LABEL[status]}
              </Button>
            </form>
          ))}
          <form action={snapshotCateringQuoteVersionFormAction}>
            <input type="hidden" name="quoteId" value={quote.id} />
            <Button type="submit" size="sm" variant="secondary" className="rounded-full">Save version</Button>
          </form>
        </CardContent>
      </Card>

      {/* Public link */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Public proposal link</CardTitle>
          <CardDescription>
            Read-only and never exposes internal notes, costs, or margins.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isRevoked ? (
            <p className="text-sm text-muted-foreground">Public link is revoked. Rotate to issue a fresh one.</p>
          ) : (
            <p className="text-sm font-mono break-all">{`${base}/quote/${quote.publicToken}`}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {!isRevoked ? (
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={`${base}/quote/${quote.publicToken}`} target="_blank" rel="noreferrer">Open public link</Link>
              </Button>
            ) : null}
            <form action={rotateCateringPublicLinkFormAction}>
              <input type="hidden" name="quoteId" value={quote.id} />
              <Button type="submit" size="sm" variant="secondary" className="rounded-full">Rotate link</Button>
            </form>
            {!isRevoked ? (
              <form action={revokeCateringPublicLinkFormAction}>
                <input type="hidden" name="quoteId" value={quote.id} />
                <Button type="submit" size="sm" variant="destructive" className="rounded-full">Revoke link</Button>
              </form>
            ) : null}
          </div>
          {quote.publicViewedAt ? (
            <p className="text-xs text-muted-foreground">
              Last view: {format(quote.publicViewedAt, "MMM d, yyyy h:mma")} ({quote.proposalViews.length} recent
              views audited)
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Lines & Packages */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Lines &amp; packages</CardTitle>
          <CardDescription>Lines drive totals and the public proposal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {quote.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No lines yet. Add one below.</p>
          ) : (
            <div className="space-y-2">
              {quote.items.map((it) => (
                <div key={it.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2 text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">{it.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {CATERING_LINE_TYPE_LABEL[it.lineType]} · {it.quantity}
                      {it.unit ? ` ${it.unit}` : ""} × {formatCurrency(Number(it.unitPrice.toString()))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums">{formatCurrency(Number(it.total.toString()))}</span>
                    <form action={removeCateringQuoteLineFormAction}>
                      <input type="hidden" name="lineId" value={it.id} />
                      <Button type="submit" size="sm" variant="ghost" className="rounded-full">Remove</Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form action={addCateringQuoteLineFormAction} className="grid gap-3 md:grid-cols-6 border-t pt-4">
            <input type="hidden" name="quoteId" value={quote.id} />
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="line-title">Title</Label>
              <Input id="line-title" name="title" required maxLength={512} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="line-type">Type</Label>
              <select id="line-type" name="lineType" className="h-9 w-full rounded-md border bg-background px-2 text-sm">
                {CATERING_LINE_TYPE_VALUES.map((v) => (
                  <option key={v} value={v}>{CATERING_LINE_TYPE_LABEL[v]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="line-qty">Qty</Label>
              <Input id="line-qty" name="quantity" type="number" min={1} defaultValue={1} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="line-unit">Unit</Label>
              <Input id="line-unit" name="unit" placeholder="ea / pp" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="line-price">Unit price</Label>
              <Input id="line-price" name="unitPrice" type="number" min={0} step="0.01" required />
            </div>
            <div className="md:col-span-6">
              <Button type="submit" size="sm" className="rounded-full">Add line</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Edit details */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quote details</CardTitle>
          <CardDescription>Customer, event, service style, fees, and notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateCateringQuoteFormAction} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="quoteId" value={quote.id} />
            <div className="space-y-1">
              <Label htmlFor="d-customer">Customer name</Label>
              <Input id="d-customer" name="customerName" defaultValue={quote.customerName} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-email">Email</Label>
              <Input id="d-email" name="customerEmail" type="email" defaultValue={quote.customerEmail} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-phone">Phone</Label>
              <Input id="d-phone" name="customerPhone" defaultValue={quote.customerPhone ?? ""} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-company">Company</Label>
              <Input id="d-company" name="companyName" defaultValue={quote.companyName ?? ""} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-event-name">Event name</Label>
              <Input id="d-event-name" name="eventName" defaultValue={quote.eventName ?? ""} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-event-type">Event type</Label>
              <select id="d-event-type" name="eventType" defaultValue={quote.eventType} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                {CATERING_EVENT_TYPE_VALUES.map((v) => <option key={v} value={v}>{CATERING_EVENT_TYPE_LABEL[v]}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-service-style">Service style</Label>
              <select id="d-service-style" name="serviceStyle" defaultValue={quote.serviceStyle} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                {CATERING_SERVICE_STYLE_VALUES.map((v) => <option key={v} value={v}>{CATERING_SERVICE_STYLE_LABEL[v]}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-pricing-mode">Pricing mode</Label>
              <select id="d-pricing-mode" name="pricingMode" defaultValue={quote.pricingMode} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                {CATERING_PRICING_MODE_VALUES.map((v) => <option key={v} value={v}>{CATERING_PRICING_MODE_LABEL[v]}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-event-date">Event date</Label>
              <Input id="d-event-date" name="eventDate" type="date" defaultValue={quote.eventDate ? quote.eventDate.toISOString().slice(0, 10) : ""} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-guests">Guests</Label>
              <Input id="d-guests" name="guestCount" type="number" min={0} defaultValue={quote.guestCount ?? ""} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-valid">Valid until</Label>
              <Input id="d-valid" name="validUntil" type="date" defaultValue={quote.validUntil ? quote.validUntil.toISOString().slice(0, 10) : ""} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-svc-fee">Service fee</Label>
              <Input id="d-svc-fee" name="serviceFee" type="number" min={0} step="0.01" defaultValue={Number(quote.serviceFee.toString())} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-delivery-fee">Delivery fee</Label>
              <Input id="d-delivery-fee" name="deliveryFee" type="number" min={0} step="0.01" defaultValue={Number(quote.deliveryFee.toString())} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-setup-fee">Setup fee</Label>
              <Input id="d-setup-fee" name="setupFee" type="number" min={0} step="0.01" defaultValue={Number(quote.setupFee.toString())} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-staffing-fee">Staffing fee</Label>
              <Input id="d-staffing-fee" name="staffingFee" type="number" min={0} step="0.01" defaultValue={Number(quote.staffingFee.toString())} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-discount">Discount</Label>
              <Input id="d-discount" name="discount" type="number" min={0} step="0.01" defaultValue={Number(quote.discount.toString())} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-tax">Tax</Label>
              <Input id="d-tax" name="tax" type="number" min={0} step="0.01" defaultValue={Number(quote.tax.toString())} />
            </div>
            <div className="flex flex-wrap gap-4 md:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="deliveryRequired" defaultChecked={quote.deliveryRequired} value="true" className="h-4 w-4" /> Delivery required
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="setupRequired" defaultChecked={quote.setupRequired} value="true" className="h-4 w-4" /> Setup required
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="staffingRequired" defaultChecked={quote.staffingRequired} value="true" className="h-4 w-4" /> Staffing required
              </label>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="d-dietary">Dietary notes</Label>
              <Textarea id="d-dietary" name="dietaryNotes" rows={2} defaultValue={quote.dietaryNotes ?? ""} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="d-allergy">Allergy notes</Label>
              <Textarea id="d-allergy" name="allergyNotes" rows={2} defaultValue={quote.allergyNotes ?? ""} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="d-client-notes">Client notes</Label>
              <Textarea id="d-client-notes" name="clientNotes" rows={2} defaultValue={quote.clientNotes ?? ""} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="d-internal-notes">Internal notes</Label>
              <Textarea id="d-internal-notes" name="internalNotes" rows={2} defaultValue={quote.internalNotes ?? ""} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="d-notes">Legacy notes</Label>
              <Textarea id="d-notes" name="notes" rows={2} defaultValue={quote.notes ?? ""} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="rounded-full">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Conversion */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Convert to order</CardTitle>
          <CardDescription>
            Creates a draft (PENDING) order from the accepted quote — confirm and price separately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {quote.convertedOrderId ? (
            <p className="text-sm">
              Already converted to{" "}
              <Link className="text-primary hover:underline" href={`/dashboard/orders`}>
                order {quote.convertedOrderId.slice(0, 8)}
              </Link>
              .
            </p>
          ) : conversionPreview ? (
            <>
              <div className="rounded-xl border border-border/70 p-3 text-sm">
                <p>Fulfillment: <strong>{conversionPreview.fulfillmentType}</strong></p>
                <p>Pickup/event date: <strong>{conversionPreview.pickupDate ? format(conversionPreview.pickupDate, "MMM d, yyyy") : "—"}</strong></p>
                <p>Lines to import: <strong>{conversionPreview.lines.filter((l) => l.productId).length}</strong> of {conversionPreview.lines.length}</p>
                <p>Total: <strong>{formatCurrency(conversionPreview.total)}</strong></p>
                {conversionPreview.warnings.length > 0 ? (
                  <ul className="mt-2 list-disc pl-4 text-xs text-amber-700 dark:text-amber-300">
                    {conversionPreview.warnings.map((w) => <li key={w}>{w}</li>)}
                  </ul>
                ) : null}
                {conversionPreview.blockingErrors.length > 0 ? (
                  <ul className="mt-2 list-disc pl-4 text-xs text-destructive">
                    {conversionPreview.blockingErrors.map((e) => <li key={e}>{e}</li>)}
                  </ul>
                ) : null}
              </div>
              <form action={convertCateringQuoteFormAction} className="space-y-3">
                <label className="text-sm font-medium" htmlFor="depositPercent">Deposit before convert</label>
                <select id="depositPercent" name="depositPercent" defaultValue="0" className="flex h-10 w-full max-w-xs rounded-xl border border-input bg-background px-3 text-sm">
                  <option value="0">No deposit</option>
                  <option value="25">25% deposit (Stripe link in order notes)</option>
                  <option value="50">50% deposit (Stripe link in order notes)</option>
                </select>
                <input type="hidden" name="quoteId" value={quote.id} />
                <Button type="submit" disabled={!conversionPreview.ok} className="rounded-full" variant="premium">
                  Convert to draft order
                </Button>
              </form>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Workflows */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Operational handoff</CardTitle>
          <CardDescription>Workflows derived from event type + service style.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5 text-sm">
          <div className="rounded-xl border border-border/70 p-3"><strong>Delivery</strong>: {flags.delivery ? "Yes" : "No"}</div>
          <div className="rounded-xl border border-border/70 p-3"><strong>Setup</strong>: {flags.setup ? "Yes" : "No"}</div>
          <div className="rounded-xl border border-border/70 p-3"><strong>Staffing</strong>: {flags.staffing ? "Yes" : "No"}</div>
          <div className="rounded-xl border border-border/70 p-3"><strong>Packing</strong>: {flags.packing ? "Yes" : "No"}</div>
          <div className="rounded-xl border border-border/70 p-3"><strong>Production</strong>: {flags.production ? "Yes" : "No"}</div>
        </CardContent>
      </Card>

      {/* Follow-ups */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Follow-ups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quote.followUps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No follow-ups yet.</p>
          ) : (
            <div className="space-y-2">
              {quote.followUps.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{format(f.dueAt, "MMM d, yyyy h:mma")}</p>
                  </div>
                  <Badge variant="outline" className="rounded-full text-[10px]">{f.status}</Badge>
                </div>
              ))}
            </div>
          )}
          <form action={createCateringFollowUpFormAction} className="grid gap-2 md:grid-cols-3 border-t pt-4">
            <input type="hidden" name="quoteId" value={quote.id} />
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="fu-title">Title</Label>
              <Input id="fu-title" name="title" required maxLength={255} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fu-due">Due at</Label>
              <Input id="fu-due" name="dueAt" type="datetime-local" required />
            </div>
            <div className="space-y-1 md:col-span-3">
              <Label htmlFor="fu-desc">Description (optional)</Label>
              <Textarea id="fu-desc" name="description" rows={2} />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" size="sm" className="rounded-full">Add follow-up</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Versions & activity */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Activity &amp; versions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium">Latest events</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {quote.events.slice(0, 12).map((e) => (
                <li key={e.id}>
                  {format(e.createdAt, "MMM d, h:mma")} · {e.eventType}
                </li>
              ))}
              {quote.events.length === 0 ? <li>No activity yet.</li> : null}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Versions</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {quote.versions.map((v) => (
                <li key={v.id}>v{v.versionNumber} · {format(v.createdAt, "MMM d, yyyy h:mma")}{v.reason ? ` · ${v.reason}` : ""}</li>
              ))}
              {quote.versions.length === 0 ? <li>No versions yet. Use “Save version” above to snapshot.</li> : null}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
