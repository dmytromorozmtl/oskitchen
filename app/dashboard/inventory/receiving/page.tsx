import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getPendingReceivingPOs } from "@/services/inventory/receiving-reconciliation-service";

export default async function InventoryReceivingPage() {
  const { dataUserId } = await getTenantActor();
  const pos = await getPendingReceivingPOs(dataUserId);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-semibold">Receiving reconciliation</h1>
      <p className="text-sm text-muted-foreground">
        Expected PO lines vs received quantities and supplier invoice variance.
      </p>

      {pos.map((po) => (
        <Card key={po.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {po.orderNumber} — {po.supplier.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            {po.lines.map((line) => {
              const expected = Number(line.quantity);
              const received = Number(line.receivedQuantity);
              const variance = received - expected;
              return (
                <div
                  key={line.id}
                  className={`flex flex-wrap justify-between gap-2 border-b py-2 ${variance !== 0 ? "text-amber-700" : ""}`}
                >
                  <span>{line.ingredient.name}</span>
                  <span>
                    Expected {expected} {line.unit} · Received {received}
                    {variance !== 0 ? ` · Δ ${variance}` : ""}
                  </span>
                </div>
              );
            })}
            {po.invoiceLines.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                {po.invoiceLines.length} linked invoice line(s) for three-way match
              </p>
            ) : null}
          </CardContent>
        </Card>
      ))}
      {pos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No open POs awaiting receiving.</p>
      ) : null}
    </div>
  );
}
