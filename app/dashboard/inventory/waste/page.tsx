import Link from "next/link";

import { logWasteEventAction } from "@/actions/inventory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { getWasteSummary } from "@/services/inventory/waste-service";

const REASONS = [
  "SPOILAGE",
  "PREP_WASTE",
  "OVER_PRODUCTION",
  "THEFT",
  "DAMAGED",
  "EXPIRED",
  "OTHER",
] as const;

export default async function InventoryWastePage() {
  const { dataUserId } = await getTenantActor();
  const [summary, ingredients] = await Promise.all([
    getWasteSummary(dataUserId),
    prisma.ingredient.findMany({
      where: { userId: dataUserId, active: true },
      select: { id: true, name: true, unit: true, costPerUnit: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Waste tracking</h1>
          <p className="text-sm text-muted-foreground">
            Log spoilage and prep waste to tighten food cost control.
          </p>
        </div>
        <Link href="/dashboard/inventory/counts" className="text-sm text-primary hover:underline">
          Physical counts →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>30-day events</CardDescription>
            <CardTitle className="text-2xl">{summary.totalEvents}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>30-day cost</CardDescription>
            <CardTitle className="text-2xl">${summary.totalCost.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Top reason</CardDescription>
            <CardTitle className="text-lg">
              {Object.entries(summary.byReason).sort((a, b) => b[1].totalCost - a[1].totalCost)[0]?.[0] ??
                "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log waste event</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={logWasteEventAction} className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Ingredient
              <select name="ingredientId" required className="rounded-md border px-2 py-1.5">
                <option value="">Select…</option>
                {ingredients.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.unit})
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Quantity
              <input name="quantity" type="number" step="0.01" min="0.01" required className="rounded-md border px-2 py-1.5" />
            </label>
            <label className="grid gap-1 text-sm">
              Unit
              <input name="unit" required className="rounded-md border px-2 py-1.5" placeholder="lb, kg, each" />
            </label>
            <label className="grid gap-1 text-sm">
              Reason
              <select name="reason" required className="rounded-md border px-2 py-1.5">
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Cost ($)
              <input name="cost" type="number" step="0.01" min="0" className="rounded-md border px-2 py-1.5" />
            </label>
            <label className="grid gap-1 text-sm sm:col-span-2">
              Notes
              <input name="notes" className="rounded-md border px-2 py-1.5" />
            </label>
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:col-span-2">
              Log waste
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent events</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Ingredient</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2 pr-4">Reason</th>
                <th className="py-2">Cost</th>
              </tr>
            </thead>
            <tbody>
              {summary.events.map((e) => (
                <tr key={e.id} className="border-b border-border/60">
                  <td className="py-2 pr-4">{e.createdAt.toLocaleDateString()}</td>
                  <td className="py-2 pr-4">{e.ingredient.name}</td>
                  <td className="py-2 pr-4">
                    {Number(e.quantity)} {e.unit}
                  </td>
                  <td className="py-2 pr-4">{e.reason}</td>
                  <td className="py-2">${Number(e.cost).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
