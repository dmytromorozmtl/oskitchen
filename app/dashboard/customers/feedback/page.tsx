import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { listCustomerFeedback } from "@/services/customers/feedback-service";

export default async function CustomerFeedbackPage() {
  const { userId } = await requireTenantActor();
  const rows = await listCustomerFeedback(userId);

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Customer feedback</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ratings ≤2 are flagged for manager routing. Review requests send ~24h after delivery.
        </p>
      </div>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li
            key={r.id}
            className={`rounded-xl border p-4 text-sm ${r.negativeRouted ? "border-amber-300/80 bg-amber-50/50 dark:bg-amber-950/20" : ""}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{r.rating}/5</span>
              {r.negativeRouted ? (
                <span className="rounded bg-amber-200/80 px-2 py-0.5 text-xs dark:bg-amber-900/50">
                  Routed to manager
                </span>
              ) : null}
              <span className="text-muted-foreground">
                {r.customer?.displayName ?? r.customer?.name ?? r.customer?.email ?? "Guest"}
              </span>
            </div>
            {r.comment ? <p className="mt-2">{r.comment}</p> : null}
          </li>
        ))}
        {!rows.length ? <p className="text-sm text-muted-foreground">No feedback yet.</p> : null}
      </ul>
      <p className="mt-6 text-sm">
        <Link href="/dashboard/customers" className="text-primary underline-offset-4 hover:underline">
          ← Customers
        </Link>
      </p>
    </PageShell>
  );
}
