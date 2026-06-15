import { addYears, startOfDay } from "date-fns";

import { menuCreateBaseForOwner } from "@/lib/products/menu-create-base";
import { prisma } from "@/lib/prisma";

const CATALOG_SORT_ORDER = -10_000;

/**
 * Ensures a hidden per-user menu exists for catalog / library products.
 * Items stay in the relational model (menuId required) without forcing a service menu first.
 */
export async function ensureCatalogMenu(userId: string) {
  const base = await menuCreateBaseForOwner(userId);
  const existing = await prisma.menu.findFirst({
    where: { workspaceId: base.workspaceId, catalogOnly: true },
  });
  if (existing) return existing;

  const today = startOfDay(new Date());
  const end = addYears(today, 5);

  return prisma.menu.create({
    data: {
      ...base,
      title: "Item library",
      catalogOnly: true,
      strategy: "WEEKLY_PREORDER",
      startDate: today,
      endDate: end,
      preorderDeadline: today,
      active: false,
      published: false,
      sortOrder: CATALOG_SORT_ORDER,
    },
  });
}
