import Link from "next/link";
import { notFound } from "next/navigation";

import {
  archiveCustomerFormAction,
  createCustomerFollowUpFormAction,
  createCustomerNoteFormAction,
  updateCustomerConsentFormAction,
  updateCustomerDietaryFormAction,
  updateCustomerProfileFormAction,
} from "@/actions/customers";
import { CustomerB2bArOverdueSummary } from "@/components/customers/customer-b2b-ar-overdue-summary";
import { Badge } from "@/components/ui/badge";
import { isShopifyMarketsB2bArAgingEnabled } from "@/lib/commercial/shopify-market-b2b-ar-aging";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  CUSTOMER_STATUS_BADGE,
  CUSTOMER_STATUS_LABEL,
  CUSTOMER_STATUS_VALUES,
} from "@/lib/crm/customer-status";
import { centsToDollars } from "@/lib/crm/customer-metrics";
import {
  CUSTOMER_SOURCE_LABEL,
  CUSTOMER_TYPE_LABEL,
  CUSTOMER_TYPE_VALUES,
} from "@/lib/crm/customer-types";
import {
  parseAllergies,
  parseDietaryPreferences,
  parseDislikes,
  parseFavoriteItems,
  parseTags,
} from "@/lib/crm/customer-privacy";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import {
  getCustomerForUser,
  listOrdersForCustomer,
} from "@/services/crm/customer-service";
import { listB2bArAgingRowsForCustomer } from "@/services/integrations/shopify-b2b-ar-aging-service";
import {
  CustomerConsentType,
  CustomerFollowUpType,
  CustomerNoteVisibility,
} from "@prisma/client";

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { userId } = await requireTenantActor();
  const { customerId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(customerId)) notFound();
  const customer = await getCustomerForUser({ userId }, customerId);
  if (!customer) notFound();

  const orders = await listOrdersForCustomer({ userId }, customer.email, 50);
  const mealPlans = await prisma.mealPlan.findMany({
    where: { userId, customerId: customer.id },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });
  const allergies = parseAllergies(customer.allergiesJson);
  const dietary = parseDietaryPreferences(customer.dietaryPreferencesJson);
  const dislikes = parseDislikes(customer.dislikesJson);
  const favorites = parseFavoriteItems(customer.favoriteItemsJson);
  const tags = parseTags(customer.tagsJson);

  const b2bArRows =
    isShopifyMarketsB2bArAgingEnabled() && customer.type === "OFFICE_CLIENT"
      ? await listB2bArAgingRowsForCustomer({ userId, customerEmail: customer.email })
      : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/dashboard/customers" className="text-sm text-muted-foreground hover:underline">
            ← all customers
          </Link>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {customer.displayName ?? customer.name ?? customer.email}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {CUSTOMER_TYPE_LABEL[customer.type]} · {CUSTOMER_SOURCE_LABEL[customer.source]} · {customer.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={`/dashboard/customers/unified-profile/${customer.id}`}>Unified profile</Link>
          </Button>
          <Badge variant={CUSTOMER_STATUS_BADGE[customer.status]} className="rounded-full">
            {CUSTOMER_STATUS_LABEL[customer.status]}
          </Badge>
          {customer.companyName ? (
            <Badge variant="outline" className="rounded-full">{customer.companyName}</Badge>
          ) : null}
        </div>
      </div>

      <CustomerB2bArOverdueSummary rows={b2bArRows} customerType={customer.type} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Orders" value={customer.totalOrders} />
        <Kpi label="LTV" value={formatCurrency(centsToDollars(customer.lifetimeValueCents))} />
        <Kpi label="AOV" value={formatCurrency(centsToDollars(customer.averageOrderValueCents))} />
        <Kpi label="Last order" value={customer.lastOrderAt?.toLocaleDateString() ?? "—"} />
        <Kpi label="First order" value={customer.firstOrderAt?.toLocaleDateString() ?? "—"} />
        <Kpi label="At-risk score" value={customer.atRiskScore ?? "—"} />
        <Kpi label="Open follow-ups" value={customer.followUps.filter((f) => f.status === "OPEN").length} />
        <Kpi label="Allergies" value={allergies.length} />
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Edit basics. Email is the dedupe key and stays read-only.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateCustomerProfileFormAction} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="customerId" value={customer.id} />
            <div className="space-y-2 md:col-span-2">
              <Label>Email (read only)</Label>
              <Input value={customer.email} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" defaultValue={customer.firstName ?? ""} maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" defaultValue={customer.lastName ?? ""} maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" name="displayName" defaultValue={customer.displayName ?? ""} maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={customer.phone ?? ""} maxLength={64} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company</Label>
              <Input id="companyName" name="companyName" defaultValue={customer.companyName ?? ""} maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job title</Label>
              <Input id="jobTitle" name="jobTitle" defaultValue={customer.jobTitle ?? ""} maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue={customer.type}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CUSTOMER_TYPE_VALUES.map((v) => (
                  <option key={v} value={v}>{CUSTOMER_TYPE_LABEL[v]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={customer.status}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CUSTOMER_STATUS_VALUES.map((v) => (
                  <option key={v} value={v}>{CUSTOMER_STATUS_LABEL[v]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="deliveryNotes">Delivery notes (visible to driver)</Label>
              <Textarea id="deliveryNotes" name="deliveryNotes" defaultValue={customer.deliveryNotes ?? ""} rows={2} maxLength={2000} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Internal notes</Label>
              <Textarea id="notes" name="notes" defaultValue={customer.notes ?? ""} rows={3} maxLength={4000} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="rounded-full">Save profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Allergies / dietary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Allergies &amp; dietary preferences</CardTitle>
          <CardDescription>
            Comma-separated lists. Kitchen-relevant flags surface on the order, packing slip, and kitchen screen.
            The operator is responsible for verifying this information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateCustomerDietaryFormAction} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="customerId" value={customer.id} />
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input id="allergies" name="allergies" defaultValue={allergies.join(", ")} placeholder="peanuts, shellfish" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dietary">Dietary preferences</Label>
              <Input id="dietary" name="dietary" defaultValue={dietary.join(", ")} placeholder="vegetarian, halal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dislikes">Dislikes</Label>
              <Input id="dislikes" name="dislikes" defaultValue={dislikes.join(", ")} placeholder="cilantro" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="favorites">Favorite items</Label>
              <Input id="favorites" name="favorites" defaultValue={favorites.join(", ")} placeholder="house salad, lemon tart" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" size="sm">Save dietary info</Button>
            </div>
          </form>

          {tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1">
              {tags.map((t) => (
                <Badge key={t} variant="secondary" className="rounded-full">{t}</Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Meal plans */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meal plans</CardTitle>
          <CardDescription>{mealPlans.length} plan(s) for this customer</CardDescription>
        </CardHeader>
        <CardContent>
          {mealPlans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No meal plans yet. <Link href="/dashboard/meal-plans/new" className="underline">Create one</Link>.
            </p>
          ) : (
            <ul className="space-y-2">
              {mealPlans.map((plan) => (
                <li key={plan.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 p-3">
                  <div>
                    <Link href={`/dashboard/meal-plans/${plan.id}`} className="font-medium hover:underline">
                      {plan.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {plan.frequency} · {plan.mealsPerCycle} meals/cycle · {plan.fulfillmentMode}
                      {plan.nextOrderDate ? ` · next ${plan.nextOrderDate.toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full">{plan.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orders</CardTitle>
          <CardDescription>{orders.length} order(s) on file</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet for this email.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr className="border-b border-border/70">
                    <th className="py-2 pr-2">Order</th>
                    <th className="py-2 pr-2">Status</th>
                    <th className="py-2 pr-2">Fulfillment</th>
                    <th className="py-2 pr-2 text-right">Total</th>
                    <th className="py-2 pr-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-border/40">
                      <td className="py-2 pr-2">
                        <Link href={`/dashboard/orders/${o.id}`} className="font-medium hover:underline">
                          {o.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="py-2 pr-2 text-muted-foreground">{o.status}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{o.fulfillmentType}</td>
                      <td className="py-2 pr-2 text-right tabular-nums">{formatCurrency(Number(o.total))}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{o.createdAt.toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
          <CardDescription>Pick visibility — kitchen / delivery / sales / internal.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCustomerNoteFormAction} className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
            <input type="hidden" name="customerId" value={customer.id} />
            <Input name="note" required maxLength={4000} placeholder="Add a note" />
            <select
              name="visibility"
              defaultValue={CustomerNoteVisibility.INTERNAL}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value={CustomerNoteVisibility.INTERNAL}>Internal</option>
              <option value={CustomerNoteVisibility.SALES}>Sales</option>
              <option value={CustomerNoteVisibility.KITCHEN}>Kitchen</option>
              <option value={CustomerNoteVisibility.DELIVERY}>Delivery</option>
            </select>
            <Button type="submit" size="sm">Add</Button>
          </form>

          {customer.crmNotes.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {customer.crmNotes.map((n) => (
                <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 p-2">
                  <span>{n.note}</span>
                  <span className="text-xs text-muted-foreground">
                    <Badge variant="outline" className="mr-2 rounded-full">{n.visibility}</Badge>
                    {n.createdAt.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Follow-ups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Follow-ups</CardTitle>
          <CardDescription>Schedule a quote / VIP / reactivation / allergy confirmation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCustomerFollowUpFormAction} className="grid gap-2 md:grid-cols-4">
            <input type="hidden" name="customerId" value={customer.id} />
            <Input name="title" required maxLength={255} placeholder="Follow up about catering quote" className="md:col-span-2" />
            <select
              name="type"
              defaultValue={CustomerFollowUpType.GENERAL}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {Object.values(CustomerFollowUpType).map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <Input name="dueAt" type="date" />
            <Textarea name="reason" rows={2} maxLength={4000} placeholder="Optional notes" className="md:col-span-3" />
            <Button type="submit" size="sm">Add follow-up</Button>
          </form>

          {customer.followUps.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No follow-ups yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {customer.followUps.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded-md border border-border/60 p-2">
                  <span>
                    <strong>{f.title}</strong>
                    <span className="ml-2 text-xs text-muted-foreground">{f.type} · {f.status}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{f.dueAt?.toLocaleDateString() ?? "no due date"}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Consent */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Marketing consent</CardTitle>
          <CardDescription>
            OS Kitchen records consent but never sends marketing automatically — only export consented lists into
            a real integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground">
              Email marketing:{" "}
              <Badge variant={customer.marketingConsent ? "default" : "outline"} className="rounded-full">
                {customer.marketingConsent ? "granted" : "not granted"}
              </Badge>{" "}
              · SMS:{" "}
              <Badge variant={customer.smsConsent ? "default" : "outline"} className="rounded-full">
                {customer.smsConsent ? "granted" : "not granted"}
              </Badge>
            </span>
            {customer.consentAt ? (
              <span className="ml-2 text-xs">
                last change {customer.consentAt.toLocaleString()}
                {customer.consentSource ? ` · ${customer.consentSource}` : ""}
              </span>
            ) : null}
          </p>

          <div className="grid gap-2 md:grid-cols-2">
            <form action={updateCustomerConsentFormAction} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="customerId" value={customer.id} />
              <input type="hidden" name="consentType" value={CustomerConsentType.EMAIL_MARKETING} />
              <select name="value" defaultValue={customer.marketingConsent ? "on" : "off"} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                <option value="on">Grant email marketing</option>
                <option value="off">Revoke email marketing</option>
              </select>
              <Input name="source" placeholder="Source (e.g. CSV / verbal / form)" className="h-9 md:flex-1" />
              <Button type="submit" size="sm">Update</Button>
            </form>

            <form action={updateCustomerConsentFormAction} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="customerId" value={customer.id} />
              <input type="hidden" name="consentType" value={CustomerConsentType.SMS_MARKETING} />
              <select name="value" defaultValue={customer.smsConsent ? "on" : "off"} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                <option value="on">Grant SMS</option>
                <option value="off">Revoke SMS</option>
              </select>
              <Input name="source" placeholder="Source" className="h-9 md:flex-1" />
              <Button type="submit" size="sm">Update</Button>
            </form>
          </div>

          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-muted-foreground">Consent history</summary>
            <ul className="mt-2 space-y-1 text-xs">
              {customer.consentEvents.length === 0 ? (
                <li className="text-muted-foreground">No history yet.</li>
              ) : null}
              {customer.consentEvents.map((e) => (
                <li key={e.id} className="flex justify-between border-b border-border/40 py-1">
                  <span>
                    {e.consentType} → {e.value ? "granted" : "revoked"}
                    {e.source ? ` · ${e.source}` : ""}
                    {e.performedBy ? ` · ${e.performedBy}` : ""}
                  </span>
                  <span className="text-muted-foreground">{e.createdAt.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </details>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.timelineEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No timeline events yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {customer.timelineEvents.map((e) => (
                <li key={e.id} className="flex justify-between border-b border-border/40 py-1">
                  <span>
                    <Badge variant="outline" className="mr-2 rounded-full">{e.eventType}</Badge>
                    {e.summary ?? "—"}
                  </span>
                  <span className="text-xs text-muted-foreground">{e.createdAt.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Settings / danger */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base">Danger zone</CardTitle>
          <CardDescription>Archiving stops new outreach. Order history is preserved.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={archiveCustomerFormAction}>
            <input type="hidden" name="customerId" value={customer.id} />
            <Button type="submit" variant="destructive" size="sm">Archive customer</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
