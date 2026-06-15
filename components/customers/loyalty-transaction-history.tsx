import type { LoyaltyTransactionType } from "@prisma/client";

export type LoyaltyTransactionRow = {
  id: string;
  type: LoyaltyTransactionType;
  points: number;
  notes: string | null;
  createdAt: Date;
  customerLabel: string;
};

export function LoyaltyTransactionHistory({ transactions }: { transactions: LoyaltyTransactionRow[] }) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <h2 className="text-base font-semibold">Transaction history</h2>
      <p className="text-sm text-muted-foreground mt-1">Recent earn and redeem events across members.</p>

      {transactions.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No transactions yet — points accrue on POS and storefront orders when a customer is linked.
        </p>
      ) : (
        <ul className="mt-4 divide-y text-sm">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <div>
                <p className="font-medium">{tx.customerLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {tx.type} · {new Date(tx.createdAt).toLocaleString()}
                </p>
                {tx.notes ? <p className="text-xs text-muted-foreground mt-0.5">{tx.notes}</p> : null}
              </div>
              <span className={tx.points >= 0 ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                {tx.points >= 0 ? "+" : ""}
                {tx.points} pts
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
