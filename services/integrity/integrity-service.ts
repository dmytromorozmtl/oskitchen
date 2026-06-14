import { Prisma } from "@prisma/client";

import type { IntegrityIssueKind } from "@/lib/integrity/integrity-rules";
import { prisma } from "@/lib/prisma";
import { externalProductListWhereForOwner } from "@/lib/scope/workspace-channel-scope";
import { orderListWhereForOwner, orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";

export type { IntegrityIssueKind } from "@/lib/integrity/integrity-rules";

export type IntegrityIssue = {
  id: string;
  kind: IntegrityIssueKind;
  severity: "warning" | "error";
  title: string;
  detail: string;
  href: string;
};

export async function countIntegrityIssues(userId: string): Promise<number> {
  const externalProductWhere = await externalProductListWhereForOwner(userId);
  const [emptyOrderWhere, deliveryNoAddrWhere] = await Promise.all([
    orderListWhereForOwnerAnd(userId, { orderItems: { none: {} } }),
    orderListWhereForOwnerAnd(userId, {
      fulfillmentType: "DELIVERY",
      deliveryAddressJson: { equals: Prisma.DbNull },
      status: { notIn: ["COMPLETED", "CANCELLED"] },
    }),
  ]);
  const orderScope = await orderListWhereForOwner(userId);
  const [emptyOrders, deliveryNoAddr, badLines, unmapped] = await Promise.all([
    prisma.order.count({ where: emptyOrderWhere }),
    prisma.order.count({ where: deliveryNoAddrWhere }),
    prisma.orderItem.count({
      where: {
        order: orderScope,
        OR: [{ unitPrice: null }, { lineTotal: null }],
      },
    }),
    prisma.externalProduct.count({
      where: { AND: [externalProductWhere, { mappedProductId: null }] },
    }),
  ]);
  return emptyOrders + deliveryNoAddr + badLines + unmapped;
}

export async function listIntegrityIssues(userId: string, limit = 40): Promise<IntegrityIssue[]> {
  const externalProductWhere = await externalProductListWhereForOwner(userId);
  const [emptyOrderWhere, deliveryNoAddrWhere, orderScope] = await Promise.all([
    orderListWhereForOwnerAnd(userId, { orderItems: { none: {} } }),
    orderListWhereForOwnerAnd(userId, {
      fulfillmentType: "DELIVERY",
      deliveryAddressJson: { equals: Prisma.DbNull },
      status: { notIn: ["COMPLETED", "CANCELLED"] },
    }),
    orderListWhereForOwner(userId),
  ]);
  const issues: IntegrityIssue[] = [];

  const emptyOrders = await prisma.order.findMany({
    where: emptyOrderWhere,
    take: 12,
    select: { id: true, customerName: true },
  });
  for (const o of emptyOrders) {
    issues.push({
      id: `order-no-items-${o.id}`,
      kind: "ORDER_NO_ITEMS",
      severity: "error",
      title: "Order has no line items",
      detail: `${o.customerName} (${o.id.slice(0, 8)}…)`,
      href: `/dashboard/orders/${o.id}`,
    });
  }

  const deliveryRows = await prisma.order.findMany({
    where: deliveryNoAddrWhere,
    take: 12,
    select: { id: true, customerName: true },
  });
  for (const o of deliveryRows) {
    issues.push({
      id: `delivery-addr-${o.id}`,
      kind: "DELIVERY_NO_ADDRESS",
      severity: "error",
      title: "Delivery order missing address",
      detail: o.customerName,
      href: `/dashboard/orders/${o.id}`,
    });
  }

  const badLines = await prisma.orderItem.findMany({
    where: {
      order: orderScope,
      OR: [{ unitPrice: null }, { lineTotal: null }],
    },
    take: 12,
    select: { id: true, orderId: true, title: true },
  });
  for (const li of badLines) {
    issues.push({
      id: `line-price-${li.id}`,
      kind: "ORDER_LINE_NO_PRICE",
      severity: "warning",
      title: "Order line missing price",
      detail: li.title ?? li.id.slice(0, 8),
      href: `/dashboard/orders/${li.orderId}`,
    });
  }

  const unmapped = await prisma.externalProduct.findMany({
    where: { AND: [externalProductWhere, { mappedProductId: null }] },
    take: 12,
    select: { id: true, title: true },
  });
  for (const e of unmapped) {
    issues.push({
      id: `ext-${e.id}`,
      kind: "UNMAPPED_EXTERNAL_PRODUCT",
      severity: "warning",
      title: "Unmapped external catalog row",
      detail: e.title ?? e.id.slice(0, 8),
      href: "/dashboard/product-mapping",
    });
  }

  return issues.slice(0, limit);
}
