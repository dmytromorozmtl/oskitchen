import { getAvtBreakdown } from "@/services/costing/avt-breakdown-service";

export async function AvtBreakdownPanel({
  userId,
  productId,
  productName,
}: {
  userId: string;
  productId: string;
  productName: string;
}) {
  const { breakdown } = await getAvtBreakdown(userId, productId);
  const total = breakdown.reduce((s, b) => s + b.cost, 0);
  if (breakdown.length === 0) return null;

  return (
    <div className="rounded-xl border p-4">
      <p className="text-sm font-medium mb-2">Waste breakdown — {productName}</p>
      <div className="space-y-1 text-sm">
        {breakdown.map((b) => (
          <div key={b.reason} className="flex justify-between gap-2">
            <span className="text-muted-foreground">{b.reason.replace(/_/g, " ")}</span>
            <span>
              ${b.cost.toFixed(2)}
              {total > 0 ? ` (${Math.round((b.cost / total) * 100)}%)` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
