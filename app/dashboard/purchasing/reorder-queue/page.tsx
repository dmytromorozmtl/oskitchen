import { format } from "date-fns";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function ReorderQueuePage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const items = await prisma.reorderQueueItem.findMany({
    where: { userId: dataUserId, status: "OPEN" },
    orderBy: [{ requiredByDate: "asc" }],
    take: 200,
    include: {
      ingredient: { select: { name: true, unit: true } },
      supplier: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reorder queue"
        description="Open items from shortages, par targets, or future demand feeds. Add to PO from the purchase order workflow (next iteration)."
      />
      <Card>
        <CardContent className="overflow-x-auto pt-6">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open reorder items — use “Generate from demand” on Overview.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Ingredient</th>
                  <th className="pb-2 pr-4">Supplier</th>
                  <th className="pb-2 pr-4">Required by</th>
                  <th className="pb-2 text-right">Suggested</th>
                  <th className="pb-2 pl-4">Urgency</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b border-border/60">
                    <td className="py-2 pr-4 font-medium">{i.ingredient.name}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{i.supplier?.name ?? "—"}</td>
                    <td className="py-2 pr-4">{format(i.requiredByDate, "MMM d, yyyy")}</td>
                    <td className="py-2 text-right tabular-nums">
                      {Number(i.suggestedPurchaseQuantity).toFixed(2)} {i.unit}
                    </td>
                    <td className="py-2 pl-4">
                      <Badge variant="outline" className="rounded-full text-xs">
                        {i.urgency}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
