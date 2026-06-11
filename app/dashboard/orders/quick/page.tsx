import Link from "next/link";

import { OrderCreateForm } from "@/components/dashboard/order-create-form";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { menuListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export default async function QuickOrderPage() {
  const { sessionUser, dataUserId } = await getTenantActor();

  const activeMenu = await prisma.menu.findFirst({
    where: await menuListWhereForOwnerAnd(dataUserId, { active: true, catalogOnly: false }),
  });

  const products = activeMenu
    ? await prisma.product.findMany({
        where: { menuId: activeMenu.id, active: true },
        include: { menu: true },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Phone or counter order</h1>
          <p className="mt-2 text-muted-foreground">
            Fast path to the same manual order form — ideal for walk-ins and call-ins while
            keeping catalog limited to your active menu.
          </p>
        </div>
        <Button variant="outline" className="rounded-full" asChild>
          <Link href="/dashboard/sales-channels">Sales channels</Link>
        </Button>
      </div>

      {!activeMenu ? (
        <div className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-8 text-sm text-muted-foreground">
          Activate a weekly menu under <strong className="text-foreground">Menus</strong> before
          capturing orders.
        </div>
      ) : (
        <OrderCreateForm
          products={products.map((p) => ({
            id: p.id,
            title: p.title,
            menuTitle: p.menu.title,
            price: String(p.price),
          }))}
        />
      )}
    </div>
  );
}
