import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { isMelioConfigured, listVendorPaymentsQueue } from "@/services/accounting/vendor-payment-service";

export default async function VendorPaymentsPage() {
  const { dataUserId } = await requireTenantActor();
  const queue = await listVendorPaymentsQueue(dataUserId);

  return (
    <PageShell>
      <h1 className="text-2xl font-semibold tracking-tight">Vendor payments</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Melio automation for approved purchase orders. {isMelioConfigured() ? "API ready." : "Set MELIO_API_KEY."}
      </p>
      <ul className="mt-6 space-y-2">
        {queue.map((po) => (
          <li key={po.id} className="rounded-xl border px-4 py-3 text-sm flex justify-between">
            <span>{po.supplier.name}</span>
            <span>${Number(po.total).toFixed(2)}</span>
          </li>
        ))}
        {!queue.length ? <p className="text-muted-foreground">No approved POs in queue.</p> : null}
      </ul>
      <p className="mt-6 text-sm">
        <Link href="/dashboard/accounting" className="text-primary underline-offset-4 hover:underline">
          ← Accounting
        </Link>
      </p>
    </PageShell>
  );
}
