import { EdiOrderPanel } from "@/components/purchasing/edi-order-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { isEdiConfigured } from "@/services/purchasing/edi-service";

export const dynamic = "force-dynamic";

export default async function DirectOrderingPage() {
  const { dataUserId } = await getTenantActor();
  const pos = await prisma.purchaseOrder.findMany({
    where: { userId: dataUserId, status: { in: ["SENT", "DRAFT"] } },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { supplier: true },
  });

  const poRows = pos.map((po) => ({
    id: po.id,
    orderNumber: po.orderNumber,
    supplierName: po.supplier.name,
    status: po.status,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-semibold">Direct ordering (EDI)</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sysco</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {isEdiConfigured("SYSCO") ? (
              <p className="text-emerald-600">SYSCO_API_KEY detected</p>
            ) : (
              <p className="text-muted-foreground">Set SYSCO_API_KEY on Vercel</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">US Foods</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {isEdiConfigured("US_FOODS") ? (
              <p className="text-emerald-600">USFOODS_API_KEY detected</p>
            ) : (
              <p className="text-muted-foreground">Set USFOODS_API_KEY on Vercel</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Purchase orders — EDI 850</CardTitle>
        </CardHeader>
        <CardContent>
          <EdiOrderPanel purchaseOrders={poRows} />
        </CardContent>
      </Card>
    </div>
  );
}
