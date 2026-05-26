import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listInvoices } from "@/services/billing/subscription-service";
import { getStripeConfigState } from "@/lib/billing/stripe-config";

function fmtCents(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() })
    .format(cents / 100);
}

export default async function InvoicesPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const invoices = await listInvoices(dataUserId);
  const state = getStripeConfigState();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <p className="text-sm text-muted-foreground">
          {invoices.length === 0
            ? "No invoices yet. Invoices appear after Stripe creates them for this workspace."
            : `${invoices.length} invoice${invoices.length === 1 ? "" : "s"} on file.`}
        </p>
      </div>

      {state !== "configured" ? (
        <Card className="border-amber-300 bg-amber-50/40">
          <CardHeader>
            <CardTitle className="text-base text-amber-900">Stripe not configured</CardTitle>
            <CardDescription className="text-amber-900/80">
              Invoices are local-only until Stripe is configured. No invoices will be created or
              persisted from this environment.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {invoices.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No invoices yet</CardTitle>
            <CardDescription>Stripe will post invoices here via webhooks.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent invoices</CardTitle>
            <CardDescription>Most recent first.</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-3">Number</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Issued</th>
                  <th className="py-2 pr-3">Paid</th>
                  <th className="py-2 pr-3">Links</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b">
                    <td className="py-2 pr-3 font-mono text-xs">{inv.number ?? inv.stripeInvoiceId ?? inv.id.slice(0, 8)}</td>
                    <td className="py-2 pr-3"><Badge variant="outline">{inv.status}</Badge></td>
                    <td className="py-2 pr-3 tabular-nums">{fmtCents(inv.amountDueCents, inv.currency)}</td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">{inv.issuedAt?.toISOString().slice(0, 10) ?? "—"}</td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">{inv.paidAt?.toISOString().slice(0, 10) ?? "—"}</td>
                    <td className="py-2 pr-3 text-xs">
                      {inv.hostedInvoiceUrl ? <a className="underline" href={inv.hostedInvoiceUrl} target="_blank" rel="noreferrer">Hosted</a> : null}
                      {inv.hostedInvoiceUrl && inv.invoicePdfUrl ? " · " : null}
                      {inv.invoicePdfUrl ? <a className="underline" href={inv.invoicePdfUrl} target="_blank" rel="noreferrer">PDF</a> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
