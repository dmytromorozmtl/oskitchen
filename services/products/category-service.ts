import type { OperatingMode } from "@/lib/operating-modes/types";
import { formatCategoryCodeLabel, normalizeCategoryCode } from "@/lib/products/category-code";
import {
  getBuiltinCategoryCodes,
  getProductCategoryLabel,
  isBuiltinCategoryCode,
} from "@/lib/products/product-form-config";
import { prisma } from "@/lib/prisma";
import { workspaceProductCategoryListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type ProductCategoryOption = {
  code: string;
  label: string;
  custom: boolean;
};

export async function getCustomCategories(userId: string) {
  const scope = await workspaceProductCategoryListWhereForOwner(userId);
  return prisma.workspaceProductCategory.findMany({
    where: scope,
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });
}

export async function getCategoryOptionsForWorkspace(
  userId: string,
  operatingMode: OperatingMode,
): Promise<ProductCategoryOption[]> {
  const builtins = getBuiltinCategoryCodes(operatingMode).map((code) => ({
    code,
    label: getProductCategoryLabel(code),
    custom: false,
  }));
  const customs = await getCustomCategories(userId);
  const seen = new Set<string>(builtins.map((b) => b.code));
  const customOptions: ProductCategoryOption[] = [];
  for (const row of customs) {
    if (seen.has(row.code)) continue;
    seen.add(row.code);
    customOptions.push({ code: row.code, label: row.label, custom: true });
  }
  return [...builtins, ...customOptions];
}

export async function getAllowedCategoryCodes(
  userId: string,
  operatingMode: OperatingMode,
): Promise<string[]> {
  const options = await getCategoryOptionsForWorkspace(userId, operatingMode);
  return options.map((o) => o.code);
}

export async function createCustomCategory(
  userId: string,
  displayName: string,
): Promise<{ ok: true; code: string; label: string } | { ok: false; error: string }> {
  const label = displayName.trim();
  if (!label) return { ok: false, error: "Category name is required." };
  if (label.length > 120) return { ok: false, error: "Category name is too long." };

  const code = normalizeCategoryCode(label);
  if (isBuiltinCategoryCode(code)) {
    return { ok: false, error: "This name matches a built-in category. Pick it from the list." };
  }

  const existing = await prisma.workspaceProductCategory.findUnique({
    where: { userId_code: { userId, code } },
  });
  if (existing) return { ok: false, error: "This category already exists." };

  const categoryScope = await workspaceProductCategoryListWhereForOwner(userId);
  const count = await prisma.workspaceProductCategory.count({ where: categoryScope });
  await prisma.workspaceProductCategory.create({
    data: {
      userId,
      code,
      label: label.length > 0 ? label : formatCategoryCodeLabel(code),
      sortOrder: count,
    },
  });

  return { ok: true, code, label: label.length > 0 ? label : formatCategoryCodeLabel(code) };
}

export async function deleteCustomCategory(
  categoryId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const row = await prisma.workspaceProductCategory.findFirst({
    where: { id: categoryId, userId },
  });
  if (!row) return { ok: false, error: "Category not found." };
  await prisma.workspaceProductCategory.delete({ where: { id: row.id } });
  return { ok: true };
}
