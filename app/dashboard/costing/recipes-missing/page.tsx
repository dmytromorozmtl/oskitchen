import Link from "next/link";

import { PlanGate } from "@/components/plans/plan-gate";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { productListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export default async function CostingRecipesMissingPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const missing = await prisma.product.findMany({
    where: await productListWhereForOwnerAnd(dataUserId, {
      active: true,
      recipe: { is: null },
    }),
    include: { menu: { select: { title: true } } },
    orderBy: { title: "asc" },
    take: 400,
  });

  const zeroLabor = await prisma.recipe.findMany({
    where: { userId: dataUserId, active: true, laborMinutes: 0 },
    include: { product: { select: { title: true, id: true } } },
    take: 200,
  });

  return (
    <PlanGate userId={dataUserId} feature="costing" title="Recipes missing">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recipes & data gaps</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Items without recipes cannot receive costing lines. Recipes with zero labor minutes still cost but may
            understate labor.
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">Items without recipe ({missing.length})</h2>
          <ul className="divide-y rounded-lg border border-border/80 text-sm">
            {missing.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                <span>
                  <span className="font-medium">{p.title}</span>
                  <span className="text-muted-foreground"> · {p.menu.title}</span>
                </span>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link href="/dashboard/products">Open catalog</Link>
                </Button>
              </li>
            ))}
            {missing.length === 0 ? (
              <li className="px-3 py-6 text-center text-muted-foreground">All catalog items have recipes.</li>
            ) : null}
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">Recipes with zero labor minutes ({zeroLabor.length})</h2>
          <ul className="divide-y rounded-lg border border-border/80 text-sm">
            {zeroLabor.map((r) => (
              <li key={r.id} className="px-3 py-2">
                <span className="font-medium">{r.product.title}</span>
                <span className="text-muted-foreground"> — add prep/cook labor for better estimates.</span>
              </li>
            ))}
            {zeroLabor.length === 0 ? (
              <li className="px-3 py-6 text-center text-muted-foreground">No zero-labor recipes flagged.</li>
            ) : null}
          </ul>
        </section>
      </div>
    </PlanGate>
  );
}
