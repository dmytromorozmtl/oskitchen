import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { listChurnRiskCustomers } from "@/services/customers/churn-prediction-service";

export default async function ChurnRiskPage() {
  const { userId } = await requireTenantActor();
  const rows = await listChurnRiskCustomers(userId);

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Churn risk</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Score 0–100 from recency, order frequency, and open support tickets.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="p-3">Customer</th>
              <th className="p-3">Score</th>
              <th className="p-3">Days since order</th>
              <th className="p-3">Tickets</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.customerId} className="border-b">
                <td className="p-3">{r.displayName ?? r.email}</td>
                <td className="p-3 font-medium">{r.churnScore}</td>
                <td className="p-3">{r.daysSinceLastOrder ?? "—"}</td>
                <td className="p-3">{r.supportTickets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm">
        <Link href="/dashboard/customers" className="text-primary underline-offset-4 hover:underline">
          ← Customers
        </Link>
      </p>
    </PageShell>
  );
}
