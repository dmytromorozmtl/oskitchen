import { createCateringQuoteFormAction } from "@/actions/catering-quotes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  CATERING_EVENT_TYPE_LABEL,
  CATERING_EVENT_TYPE_VALUES,
  CATERING_PRICING_MODE_LABEL,
  CATERING_PRICING_MODE_VALUES,
  CATERING_SERVICE_STYLE_LABEL,
  CATERING_SERVICE_STYLE_VALUES,
} from "@/lib/catering/quote-types";
import { prisma } from "@/lib/prisma";

export default async function NewQuotePage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const [brands, locations] = await Promise.all([
    prisma.brand.findMany({ where: { workspaceId: dataUserId }, select: { id: true, name: true }, take: 50 }),
    prisma.location.findMany({ where: { userId: dataUserId }, select: { id: true, name: true }, take: 50 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New catering quote</h1>
        <p className="text-muted-foreground">
          Capture the client, event, service, and starter line — you can refine lines, fees, and the
          public proposal in the detail editor afterwards.
        </p>
      </div>

      <form action={createCateringQuoteFormAction} className="space-y-6">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Step 1 · Client</CardTitle>
            <CardDescription>The CRM customer is created or updated automatically.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer name</Label>
              <Input id="customerName" name="customerName" required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input id="customerEmail" name="customerEmail" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone</Label>
              <Input id="customerPhone" name="customerPhone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company</Label>
              <Input id="companyName" name="companyName" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Step 2 · Event details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event name</Label>
              <Input id="eventName" name="eventName" placeholder="Q3 All-hands lunch" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventType">Event type</Label>
              <select id="eventType" name="eventType" className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                {CATERING_EVENT_TYPE_VALUES.map((v) => (
                  <option key={v} value={v}>{CATERING_EVENT_TYPE_LABEL[v]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event date</Label>
              <Input id="eventDate" name="eventDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestCount">Guests</Label>
              <Input id="guestCount" name="guestCount" type="number" min={0} />
            </div>
            {brands.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="brandId">Brand</Label>
                <select id="brandId" name="brandId" className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="">— None —</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            ) : null}
            {locations.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="locationId">Location</Label>
                <select id="locationId" name="locationId" className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="">— None —</option>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Step 3 · Service style &amp; logistics</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="serviceStyle">Service style</Label>
              <select id="serviceStyle" name="serviceStyle" className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                {CATERING_SERVICE_STYLE_VALUES.map((v) => (
                  <option key={v} value={v}>{CATERING_SERVICE_STYLE_LABEL[v]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricingMode">Pricing mode</Label>
              <select id="pricingMode" name="pricingMode" className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                {CATERING_PRICING_MODE_VALUES.map((v) => (
                  <option key={v} value={v}>{CATERING_PRICING_MODE_LABEL[v]}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-4 md:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="deliveryRequired" className="h-4 w-4" /> Delivery required
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="setupRequired" className="h-4 w-4" /> Setup required
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="staffingRequired" className="h-4 w-4" /> Staffing required
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Step 4 · Starter line (optional)</CardTitle>
            <CardDescription>Add a first line to seed totals — you can add more in the editor.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="lineTitle">Title</Label>
              <Input id="lineTitle" name="lineTitle" placeholder="Buffet package per person" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lineQty">Quantity</Label>
              <Input id="lineQty" name="lineQty" type="number" min={1} defaultValue={1} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="lineUnitPrice">Unit price</Label>
              <Input id="lineUnitPrice" name="lineUnitPrice" type="number" min={0} step="0.01" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Step 5 · Fees &amp; pricing</CardTitle>
            <CardDescription>Optional — refine in the detail editor.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="serviceFee">Service fee</Label>
              <Input id="serviceFee" name="serviceFee" type="number" min={0} step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryFee">Delivery fee</Label>
              <Input id="deliveryFee" name="deliveryFee" type="number" min={0} step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setupFee">Setup fee</Label>
              <Input id="setupFee" name="setupFee" type="number" min={0} step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffingFee">Staffing fee</Label>
              <Input id="staffingFee" name="staffingFee" type="number" min={0} step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount</Label>
              <Input id="discount" name="discount" type="number" min={0} step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax">Tax (placeholder)</Label>
              <Input id="tax" name="tax" type="number" min={0} step="0.01" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Step 6 · Dietary / allergy notes</CardTitle>
            <CardDescription>
              Captured separately so kitchen, packing, and delivery teams always see them. The business
              is responsible for verifying dietary and allergy information with the client.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dietaryNotes">Dietary notes</Label>
              <Textarea id="dietaryNotes" name="dietaryNotes" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergyNotes">Allergy notes</Label>
              <Textarea id="allergyNotes" name="allergyNotes" rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Step 7 · Proposal settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid until</Label>
              <Input id="validUntil" name="validUntil" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientNotes">Client notes (shown on public link)</Label>
              <Textarea id="clientNotes" name="clientNotes" rows={3} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="internalNotes">Internal notes (never shown publicly)</Label>
              <Textarea id="internalNotes" name="internalNotes" rows={3} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Legacy notes field</Label>
              <Textarea id="notes" name="notes" rows={2} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="rounded-full" variant="premium">
          Save quote
        </Button>
      </form>
    </div>
  );
}
