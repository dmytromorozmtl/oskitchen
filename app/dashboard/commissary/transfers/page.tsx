import { createTransferAction } from "@/actions/commissary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { listTransfers } from "@/services/commissary/transfer-service";

export default async function CommissaryTransfersPage() {
  const { dataUserId } = await getTenantActor();
  const [transfers, locations, ingredients] = await Promise.all([
    listTransfers(dataUserId),
    prisma.location.findMany({
      where: { userId: dataUserId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.ingredient.findMany({
      where: { userId: dataUserId, active: true },
      select: { id: true, name: true, unit: true },
      take: 50,
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-semibold">Commissary transfers</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New transfer</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTransferAction} className="grid gap-2 max-w-md">
            <select name="fromLocationId" required className="h-10 rounded-xl border px-2 text-sm">
              <option value="">From location</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <select name="toLocationId" required className="h-10 rounded-xl border px-2 text-sm">
              <option value="">To location</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <select name="ingredientId" required className="h-10 rounded-xl border px-2 text-sm">
              {ingredients.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
            <input name="quantity" type="number" step="0.01" required placeholder="Qty" className="h-10 rounded-xl border px-3 text-sm" />
            <input name="unit" defaultValue="each" className="h-10 rounded-xl border px-3 text-sm" />
            <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">
              Create transfer
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transfer history</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {transfers.map((t) => (
            <div key={t.id} className="border-b pb-2">
              <p className="font-medium">{t.status}</p>
              <p className="text-muted-foreground">
                {t.lines.length} line(s) · {t.createdAt.toISOString().slice(0, 10)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
