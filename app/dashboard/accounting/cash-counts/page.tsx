import { submitCashCountAction } from "@/actions/accounting/cash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getCashVarianceHistory } from "@/services/accounting/cash-management-service";
import { cn } from "@/lib/utils";

export default async function CashCountsPage() {
  const { dataUserId } = await getTenantActor();
  const history = await getCashVarianceHistory(dataUserId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Cash management</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Safe count</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={submitCashCountAction} className="grid gap-3 max-w-md">
            <input
              name="expectedAmount"
              type="number"
              step="0.01"
              placeholder="Expected (POS)"
              className="h-10 rounded-xl border px-3 text-sm"
              required
            />
            <input
              name="countedAmount"
              type="number"
              step="0.01"
              placeholder="Counted"
              className="h-10 rounded-xl border px-3 text-sm"
              required
            />
            <input name="shiftId" placeholder="Shift ID (optional)" className="h-10 rounded-xl border px-3 text-sm" />
            <textarea name="notes" placeholder="Notes" className="rounded-xl border px-3 py-2 text-sm" rows={2} />
            <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">
              Submit count
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {history.map((c) => {
            const v = Number(c.variance);
            return (
              <div
                key={c.id}
                className={cn(
                  "flex justify-between border-b py-2",
                  Math.abs(v) > 20 && "text-rose-600",
                )}
              >
                <span>{c.createdAt.toISOString().slice(0, 16)}</span>
                <span>
                  Expected ${Number(c.expectedAmount).toFixed(2)} · Counted $
                  {Number(c.countedAmount).toFixed(2)} · Var ${v.toFixed(2)}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
