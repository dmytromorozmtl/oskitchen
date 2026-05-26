import type { UserRole } from "@prisma/client";

import { getBillingAccess } from "@/lib/billing/access";
import type { KitchenScreenBundleDTO, KitchenWorkRowDTO, KitchenLegacyRowDTO, KitchenStaffOptionDTO } from "@/lib/kitchen-screen/kitchen-screen-types";
import { productListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

function toIso(d: Date | null): string | null {
  return d ? d.toISOString() : null;
}

export async function loadKitchenScreenBundle(opts: {
  userId: string;
  sessionEmail: string | null;
  profileBusinessType: import("@prisma/client").BusinessType | null;
  userRole: UserRole;
}): Promise<KitchenScreenBundleDTO> {
  const billing = await getBillingAccess(opts.userId);

  const productWhere = await productListWhereForOwner(opts.userId);

  const [workRows, tasks, staffMembers, myStaff] = await Promise.all([
    prisma.productionWorkItem.findMany({
      where: {
        userId: opts.userId,
        status: { notIn: ["DONE", "CANCELLED"] },
      },
      include: {
        order: { select: { id: true, customerName: true, status: true } },
        brand: { select: { name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: [{ dueAt: "asc" }, { updatedAt: "desc" }],
      take: 120,
    }),
    prisma.productionTask.findMany({
      where: { product: productWhere },
      include: { product: { include: { menu: true } } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.staffMember.findMany({
      where: { userId: opts.userId, active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    opts.sessionEmail
      ? prisma.staffMember.findFirst({
          where: {
            userId: opts.userId,
            email: { equals: opts.sessionEmail, mode: "insensitive" },
            active: true,
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  const workItems: KitchenWorkRowDTO[] = workRows.map((w) => ({
    id: w.id,
    title: w.title,
    quantity: w.quantity,
    station: w.station,
    stage: w.stage,
    status: w.status,
    priority: w.priority,
    sourceType: w.sourceType,
    dueAt: toIso(w.dueAt),
    startedAt: toIso(w.startedAt),
    requiresPacking: w.requiresPacking,
    requiresLabel: w.requiresLabel,
    allergenWarning: w.allergenWarning,
    notes: w.notes,
    orderId: w.orderId,
    orderLabel: w.order ? `${w.order.customerName} · ${w.order.status}` : null,
    brandName: w.brand?.name ?? null,
    assignedToId: w.assignedToId,
    assignedToName: w.assignedTo?.name ?? null,
  }));

  const legacyOpen: KitchenLegacyRowDTO[] = tasks
    .filter((t) => !(t.cooked && t.packed && t.labeled))
    .map((t) => ({
      productId: t.productId,
      productTitle: t.product.title,
      menuTitle: t.product.menu.title,
      cooked: t.cooked,
      packed: t.packed,
      labeled: t.labeled,
      preparedDate: toIso(t.product.preparedDate),
      pickupDate: toIso(t.product.pickupDate),
    }));

  const staff: KitchenStaffOptionDTO[] = staffMembers.map((s) => ({ id: s.id, name: s.name }));

  return {
    workItems,
    legacyOpen,
    staffMembers: staff,
    viewerStaffId: myStaff?.id ?? null,
    businessType: opts.profileBusinessType,
    userRole: opts.userRole === "STAFF" ? "STAFF" : "OWNER",
    platformBypass: billing.platformBypass === true,
  };
}
