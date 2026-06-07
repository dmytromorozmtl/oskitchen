import type { TableStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { restaurantTableListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export interface TableData {
  id: string;
  name: string;
  section: string | null;
  capacity: number;
  status: string;
  shape: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  currentOrderId: string | null;
  currentOrderCustomer: string | null;
}

const ACTIVE_ORDER_STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "READY"] as const;

export async function getTablesForWorkspace(userId: string): Promise<TableData[]> {
  const tableScope = await restaurantTableListWhereForOwner(userId);
  const tables = await prisma.restaurantTable.findMany({
    where: tableScope,
    include: {
      orders: {
        where: { status: { in: [...ACTIVE_ORDER_STATUSES] } },
        select: { id: true, customerName: true },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: [{ section: "asc" }, { name: "asc" }],
  });

  return tables.map((table) => ({
    id: table.id,
    name: table.name,
    section: table.section,
    capacity: table.capacity,
    status: table.status,
    shape: table.shape,
    positionX: table.positionX,
    positionY: table.positionY,
    width: table.width,
    height: table.height,
    currentOrderId: table.orders[0]?.id ?? null,
    currentOrderCustomer: table.orders[0]?.customerName ?? null,
  }));
}

export async function createTable(
  userId: string,
  data: { name: string; section?: string; capacity?: number; shape?: "RECTANGLE" | "CIRCLE" | "SQUARE" },
) {
  return prisma.restaurantTable.create({
    data: {
      userId,
      name: data.name,
      section: data.section || null,
      capacity: data.capacity ?? 4,
      shape: data.shape ?? "RECTANGLE",
    },
  });
}

export async function updateTablePosition(
  tableId: string,
  userId: string,
  data: { positionX: number; positionY: number },
) {
  const tableScope = await restaurantTableListWhereForOwner(userId);
  const row = await prisma.restaurantTable.findFirst({
    where: { AND: [tableScope, { id: tableId }] },
    select: { id: true },
  });
  if (!row) throw new Error("Table not found");

  return prisma.restaurantTable.update({
    where: { id: tableId },
    data,
  });
}

export async function updateTableStatus(tableId: string, userId: string, status: TableStatus) {
  const tableScope = await restaurantTableListWhereForOwner(userId);
  const row = await prisma.restaurantTable.findFirst({
    where: { AND: [tableScope, { id: tableId }] },
    select: { id: true },
  });
  if (!row) throw new Error("Table not found");

  return prisma.restaurantTable.update({
    where: { id: tableId },
    data: { status },
  });
}

export async function updateTableShape(
  tableId: string,
  userId: string,
  shape: "RECTANGLE" | "CIRCLE" | "SQUARE",
) {
  const tableScope = await restaurantTableListWhereForOwner(userId);
  const row = await prisma.restaurantTable.findFirst({
    where: { AND: [tableScope, { id: tableId }] },
    select: { id: true },
  });
  if (!row) throw new Error("Table not found");

  return prisma.restaurantTable.update({
    where: { id: tableId },
    data: { shape },
  });
}

export async function deleteTable(tableId: string, userId: string) {
  const tableScope = await restaurantTableListWhereForOwner(userId);
  const row = await prisma.restaurantTable.findFirst({
    where: { AND: [tableScope, { id: tableId }] },
    select: { id: true },
  });
  if (!row) throw new Error("Table not found");

  return prisma.restaurantTable.delete({
    where: { id: tableId },
  });
}
