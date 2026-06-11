import {
  importBankCsvAction,
  reconcileBankTxAction,
} from "@/actions/accounting/bank-reconciliation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import {
  getReconciliationSummary,
  getUnreconciledTransactions,
} from "@/services/accounting/bank-reconciliation-service";

export default async function BankReconciliationPage() {
  const { dataUserId } = await getTenantActor();
  const [unreconciled, summary, orders, invoices] = await Promise.all([
    getUnreconciledTransactions(dataUserId),
    getReconciliationSummary(dataUserId),
    prisma.order.findMany({
      where: { userId: dataUserId },
      select: { id: true, customerName: true, total: true },
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplierInvoice.findMany({
      where: { userId: dataUserId },
      select: { id: true, invoiceNumber: true, totalAmount: true },
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6" data-testid="bank-reconciliation-panel">
      <h1 className="text-2xl font-semibold">Bank reconciliation</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Unreconciled</CardTitle>
            <p className="text-2xl font-semibold">{summary.unreconciledCount}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Net cash flow</CardTitle>
            <p className="text-2xl font-semibold">${summary.netCashFlow.toFixed(0)}</p>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={importBankCsvAction} className="space-y-2">
            <textarea
              name="csv"
              rows={4}
              placeholder="date,description,amount,type,category"
              className="w-full rounded-xl border px-3 py-2 text-sm font-mono"
            />
            <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">
              Import
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Unreconciled transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {unreconciled.map((tx) => (
            <div
              key={tx.id}
              data-testid="bank-reconcile-tx-row"
              data-tx-description={tx.description}
              className="flex flex-wrap items-end gap-2 border-b pb-3 text-sm"
            >
              <div className="min-w-[200px]">
                <p className="font-medium">{tx.description}</p>
                <p className="text-muted-foreground">
                  {tx.date.toISOString().slice(0, 10)} · ${Number(tx.amount).toFixed(2)} · {tx.type}
                </p>
              </div>
              <form action={reconcileBankTxAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="txId" value={tx.id} />
                <select name="matchType" className="h-9 rounded-lg border px-2 text-xs">
                  <option value="order">Order</option>
                  <option value="invoice">Invoice</option>
                </select>
                <select name="matchId" className="h-9 min-w-[180px] rounded-lg border px-2 text-xs">
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.customerName} ${Number(o.total).toFixed(0)}
                    </option>
                  ))}
                  {invoices.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.invoiceNumber} ${Number(i.totalAmount).toFixed(0)}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  data-testid="bank-reconcile-btn"
                  className="rounded-lg border px-3 py-1 text-xs"
                >
                  Reconcile
                </button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
