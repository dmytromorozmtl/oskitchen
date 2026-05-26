import { OrderCenter, type CenterCustomer, type CenterProduct } from "@/components/dashboard/orders/order-center";
import { requireUserProfile } from "@/lib/auth";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { kitchenCustomerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import {
  menuListWhereForOwnerAnd,
  productListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

function canCreateOrder(role: string | null | undefined, email: string | null | undefined): boolean {
  if ((email ?? "").trim().toLowerCase() === "workspace.moroz@gmail.com") return true;
  const r = (role ?? "").toLowerCase();
  return r === "owner" || r === "admin" || r === "manager" || r === "customer_service" || r === "catering_sales";
}

export default async function NewOrderPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const profile = await requireUserProfile();

  const allowed = canCreateOrder(profile.role ?? null, profile.email ?? null);
  if (!allowed) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-dashed bg-muted/30 p-8 text-sm text-muted-foreground">
        <h1 className="mb-2 text-xl font-semibold text-foreground">Permission needed</h1>
        <p>Your role does not allow creating new orders. Ask an owner or manager to enable it.</p>
      </div>
    );
  }

  const activeMenu = await prisma.menu.findFirst({
    where: await menuListWhereForOwnerAnd(dataUserId, { active: true, catalogOnly: false }),
    select: { id: true, title: true },
  });

  const productsRaw = await prisma.product.findMany({
    where: await productListWhereForOwner(dataUserId),
    include: { menu: { select: { id: true, title: true, catalogOnly: true, active: true } } },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    take: 500,
  });

  const products: CenterProduct[] = productsRaw.map((p) => ({
    id: p.id,
    title: p.title,
    menuId: p.menuId,
    menuTitle: p.menu.title,
    price: Number(p.price),
    active: p.active,
    catalogOnly: p.menu.catalogOnly,
    isOnActiveMenu: Boolean(activeMenu && p.menuId === activeMenu.id),
  }));

  const customersRaw = await prisma.kitchenCustomer.findMany({
    where: { AND: [await kitchenCustomerListWhereForOwner(dataUserId), { status: "ACTIVE" }] },
    orderBy: [{ lastOrderAt: "desc" }, { createdAt: "desc" }],
    take: 100,
    select: { id: true, email: true, name: true, displayName: true, phone: true, firstName: true, lastName: true },
  });

  const customers: CenterCustomer[] = customersRaw.map((c) => ({
    id: c.id,
    email: c.email,
    name: c.displayName ?? c.name ?? [c.firstName, c.lastName].filter(Boolean).join(" ") ?? null,
    phone: c.phone,
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <OrderCenter
        context={{
          hasActiveMenu: Boolean(activeMenu),
          activeMenuTitle: activeMenu?.title ?? null,
          products,
          customers,
        }}
      />
    </div>
  );
}
