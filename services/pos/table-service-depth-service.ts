import { prisma } from "@/lib/prisma";
import {
  computeServerBankingSummary,
  reconcileTips,
  type ClosedTabTipRow,
  type ServerBankingRow,
  type TipsReconciliationResult,
  validateMergeTabs,
  validateTransferSeat,
} from "@/lib/pos/table-service-depth-operations";
import { ownerScopedAnd, posTabByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function mergeTabs(
  userId: string,
  sourceTabId: string,
  targetTabId: string,
): Promise<{ mergedItemCount: number; targetTabId: string }> {
  const sourceWhere = await posTabByIdWhereForOwner(userId, sourceTabId);
  const targetWhere = await posTabByIdWhereForOwner(userId, targetTabId);

  const [source, target] = await Promise.all([
    prisma.posTab.findFirst({ where: sourceWhere, include: { items: true } }),
    prisma.posTab.findFirst({ where: targetWhere, include: { items: true } }),
  ]);

  if (!source || !target) throw new Error("Tab not found");

  const validation = validateMergeTabs({
    sourceTabId,
    targetTabId,
    sourceStatus: source.status,
    targetStatus: target.status,
  });
  if (!validation.ok) throw new Error(validation.reason);

  await prisma.$transaction(async (tx) => {
    if (source.items.length > 0) {
      await tx.posTabItem.updateMany({
        where: { tabId: source.id },
        data: { tabId: target.id },
      });
    }

    const items = await tx.posTabItem.findMany({ where: { tabId: target.id } });
    const subtotal = items.reduce((sum, item) => sum + Number(item.totalPrice), 0);

    await tx.posTab.update({
      where: { id: target.id },
      data: { subtotal },
    });

    await tx.posTab.update({
      where: { id: source.id },
      data: {
        status: "MERGED",
        subtotal: 0,
        tax: 0,
        tip: 0,
        total: 0,
      },
    });
  });

  return { mergedItemCount: source.items.length, targetTabId };
}

export async function transferSeatOnTab(
  userId: string,
  tabId: string,
  fromSeatId: string,
  toSeatId: string,
): Promise<{ updatedCount: number }> {
  const tabWhere = await posTabByIdWhereForOwner(userId, tabId);
  const tab = await prisma.posTab.findFirst({
    where: { ...tabWhere, status: "OPEN" },
    include: { items: true },
  });
  if (!tab) throw new Error("Tab not found");

  const matching = tab.items.filter((item) => item.paidById === fromSeatId);
  const validation = validateTransferSeat({
    fromSeatId,
    toSeatId,
    itemCount: matching.length,
  });
  if (!validation.ok) throw new Error(validation.reason);

  const result = await prisma.posTabItem.updateMany({
    where: { tabId: tab.id, paidById: fromSeatId },
    data: { paidById: toSeatId },
  });

  return { updatedCount: result.count };
}

export async function mergeRestaurantTables(
  userId: string,
  sourceTableId: string,
  targetTableId: string,
): Promise<{ mergedTabCount: number }> {
  if (sourceTableId === targetTableId) {
    throw new Error("Cannot merge a table with itself.");
  }

  const tableScope = await ownerScopedAnd(userId, {});
  const tables = await prisma.restaurantTable.findMany({
    where: { AND: [tableScope, { id: { in: [sourceTableId, targetTableId] } }] },
    select: { id: true },
  });
  if (tables.length !== 2) throw new Error("One or both tables not found.");

  const tabWhere = await ownerScopedAnd(userId, { status: "OPEN" });
  const openTabs = await prisma.posTab.findMany({
    where: {
      ...tabWhere,
      tableId: { in: [sourceTableId, targetTableId] },
    },
    orderBy: { createdAt: "asc" },
  });

  if (openTabs.length < 2) {
    throw new Error("Need open tabs on both tables to merge.");
  }

  const targetTab = openTabs.find((tab) => tab.tableId === targetTableId) ?? openTabs[0]!;
  const sourceTabs = openTabs.filter((tab) => tab.id !== targetTab.id);

  let merged = 0;
  for (const sourceTab of sourceTabs) {
    await mergeTabs(userId, sourceTab.id, targetTab.id);
    merged += 1;
  }

  await prisma.restaurantTable.update({
    where: { id: sourceTableId },
    data: { status: "AVAILABLE" },
  });
  await prisma.restaurantTable.update({
    where: { id: targetTableId },
    data: { status: "OCCUPIED" },
  });

  return { mergedTabCount: merged };
}

export async function listClosedTabTips(userId: string, limit = 50): Promise<ClosedTabTipRow[]> {
  const where = await ownerScopedAnd(userId, { status: "CLOSED" });
  const tabs = await prisma.posTab.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: { name: true, tip: true, total: true, updatedAt: true },
  });

  return tabs.map((tab) => ({
    tabName: tab.name,
    tip: Number(tab.tip),
    total: Number(tab.total),
    closedAt: tab.updatedAt.toISOString(),
  }));
}

export async function getServerBankingSummary(userId: string): Promise<ServerBankingRow[]> {
  const rows = await listClosedTabTips(userId);
  return computeServerBankingSummary(rows);
}

export async function getTipsReconciliation(
  userId: string,
  declaredTips: number,
): Promise<TipsReconciliationResult> {
  const rows = await listClosedTabTips(userId);
  const recordedTips = rows.reduce((sum, row) => sum + row.tip, 0);
  return reconcileTips({ declaredTips, recordedTips });
}
