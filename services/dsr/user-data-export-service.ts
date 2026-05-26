import { prisma } from "@/lib/prisma";
import { kitchenCustomerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import {
  auditLogListWhereForOwner,
  integrationConnectionListWhereForOwner,
  menuListWhereForOwner,
  orderListWhereForOwner,
  productListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { auditLog } from "@/services/audit/audit-service";

const ROW_CAP = 500;

/** Manual DSR export bundle — no automatic deletion. */
export async function buildUserDataExportBundle(targetUserId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { id: targetUserId },
    select: { id: true, email: true, companyName: true, role: true, createdAt: true },
  });
  if (!profile) return { ok: false as const, error: "user_not_found" as const };

  const workspace = await prisma.workspace.findFirst({
    where: { ownerUserId: targetUserId },
    select: { id: true, name: true },
  });

  const [orderWhere, customerWhere, menuWhere, productWhere, integrationWhere, auditWhere] =
    await Promise.all([
      orderListWhereForOwner(targetUserId),
      kitchenCustomerListWhereForOwner(targetUserId),
      menuListWhereForOwner(targetUserId),
      productListWhereForOwner(targetUserId),
      integrationConnectionListWhereForOwner(targetUserId),
      auditLogListWhereForOwner(targetUserId),
    ]);

  const [orders, customers, menus, products, integrations, auditRows] = await Promise.all([
    prisma.order.findMany({
      where: orderWhere,
      take: ROW_CAP,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        total: true,
        customerEmail: true,
        createdAt: true,
        workspaceId: true,
      },
    }),
    prisma.kitchenCustomer.findMany({
      where: customerWhere,
      take: ROW_CAP,
      orderBy: { updatedAt: "desc" },
      select: { id: true, email: true, name: true, phone: true, workspaceId: true },
    }),
    prisma.menu.findMany({
      where: menuWhere,
      take: ROW_CAP,
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, workspaceId: true },
    }),
    prisma.product.findMany({
      where: productWhere,
      take: ROW_CAP,
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, workspaceId: true, menuId: true },
    }),
    prisma.integrationConnection.findMany({
      where: integrationWhere,
      take: ROW_CAP,
      select: { id: true, provider: true, status: true, workspaceId: true },
    }),
    prisma.auditLog.findMany({
      where: auditWhere,
      take: ROW_CAP,
      orderBy: { createdAt: "desc" },
      select: { id: true, action: true, createdAt: true, entityType: true, entityId: true },
    }),
  ]);

  return {
    ok: true as const,
    exportedAt: new Date().toISOString(),
    subject: profile,
    workspace,
    counts: {
      orders: orders.length,
      customers: customers.length,
      products: products.length,
      menus: menus.length,
      integrations: integrations.length,
      auditLogs: auditRows.length,
    },
    data: { orders, customers, products, menus, integrations, auditLogs: auditRows },
    truncated: {
      orders: orders.length >= ROW_CAP,
      customers: customers.length >= ROW_CAP,
      products: products.length >= ROW_CAP,
      menus: menus.length >= ROW_CAP,
      integrations: integrations.length >= ROW_CAP,
      auditLogs: auditRows.length >= ROW_CAP,
    },
  };
}

export async function logDsrExportRequested(params: {
  actorUserId: string;
  targetUserId: string;
  workspaceId: string | null;
}): Promise<void> {
  await auditLog({
    action: "dsr.export_requested",
    category: "SECURITY",
    source: "API",
    severity: "CRITICAL",
    actor: { userId: params.actorUserId },
    entity: { type: "User", id: params.targetUserId },
    workspaceId: params.workspaceId ?? undefined,
    metadata: { targetUserId: params.targetUserId, manualProcess: true },
  });
}
