import {
  approveInvoiceAction,
  createInvoiceAction,
  markPaidInvoiceAction,
  matchInvoiceAction,
} from "@/actions/accounting/ap";
import { InvoiceScannerClient } from "@/components/inventory/invoice-scanner-client";
import { AiHonestyBanner } from "@/components/ui/ai-honesty-label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isCopilotLlmConfigured } from "@/lib/ai/copilot-llm-routing";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { getAPSummary, listInvoices } from "@/services/accounting/ap-service";
import { listInvoiceScanHistory } from "@/services/ai/invoice-scanner-service";

export default async function SupplierInvoicesPage() {
  const { dataUserId } = await getTenantActor();
  const [invoices, suppliers, pos, summary, scanHistory, aiConfigured] = await Promise.all([
    listInvoices(dataUserId),
    prisma.supplier.findMany({
      where: { userId: dataUserId, active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.purchaseOrder.findMany({
      where: { userId: dataUserId, status: { in: ["SENT", "PARTIALLY_RECEIVED", "RECEIVED"] } },
      select: { id: true, orderNumber: true, supplierId: true, total: true },
      take: 50,
      orderBy: { createdAt: "desc" },
    }),
    getAPSummary(dataUserId),
    listInvoiceScanHistory(dataUserId, 5),
    Promise.resolve(isCopilotLlmConfigured()),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Accounts payable</h1>
      <p className="text-sm text-muted-foreground">Supplier invoices, PO matching, approval workflow.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending AP</CardTitle>
            <p className="text-2xl font-semibold">${summary.pendingAmount.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">{summary.pendingCount} invoices</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Approved (unpaid)</CardTitle>
            <p className="text-2xl font-semibold">${summary.approvedAmount.toFixed(0)}</p>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photo-first invoice capture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AiHonestyBanner moduleId="invoice-scanner" compact />
          <p className="text-sm text-muted-foreground">
            Photograph a supplier receipt → AI extracts line items → create a draft purchase order
            for review. Requires OPENAI_API_KEY on the server.
          </p>
          <InvoiceScannerClient history={scanHistory} aiConfigured={aiConfigured} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createInvoiceAction} className="grid gap-2 sm:grid-cols-3">
            <select name="supplierId" required className="rounded-md border px-2 py-1.5 text-sm">
              <option value="">Supplier…</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input name="invoiceNumber" required placeholder="Invoice #" className="rounded-md border px-2 py-1.5 text-sm" />
            <input name="invoiceDate" type="date" required className="rounded-md border px-2 py-1.5 text-sm" />
            <input name="dueDate" type="date" className="rounded-md border px-2 py-1.5 text-sm" />
            <input name="totalAmount" type="number" step="0.01" required placeholder="Total" className="rounded-md border px-2 py-1.5 text-sm" />
            <input name="taxAmount" type="number" step="0.01" placeholder="Tax" className="rounded-md border px-2 py-1.5 text-sm" />
            <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground sm:col-span-3">
              Create invoice
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4">Supplier</th>
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const poOptions = pos.filter((p) => p.supplierId === inv.supplierId);
                const hasVariance = inv.lineItems.some(
                  (l) => l.varianceQty != null && Number(l.varianceQty) !== 0,
                );
                return (
                  <tr key={inv.id} className={`border-b ${hasVariance ? "bg-amber-500/10" : ""}`}>
                    <td className="py-2 pr-4">{inv.supplier.name}</td>
                    <td className="py-2 pr-4">{inv.invoiceNumber}</td>
                    <td className="py-2 pr-4">${Number(inv.totalAmount).toFixed(2)}</td>
                    <td className="py-2 pr-4">{inv.status}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-1">
                        {inv.status === "PENDING" && poOptions[0] && (
                          <form action={matchInvoiceAction}>
                            <input type="hidden" name="invoiceId" value={inv.id} />
                            <input type="hidden" name="purchaseOrderId" value={poOptions[0].id} />
                            <button type="submit" className="rounded border px-2 py-0.5 text-xs">Match PO</button>
                          </form>
                        )}
                        {(inv.status === "PENDING" || inv.status === "MATCHED") && (
                          <form action={approveInvoiceAction}>
                            <input type="hidden" name="invoiceId" value={inv.id} />
                            <button type="submit" className="rounded border px-2 py-0.5 text-xs">Approve</button>
                          </form>
                        )}
                        {inv.status === "APPROVED" && (
                          <form action={markPaidInvoiceAction}>
                            <input type="hidden" name="invoiceId" value={inv.id} />
                            <button type="submit" className="rounded border px-2 py-0.5 text-xs">Paid</button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
