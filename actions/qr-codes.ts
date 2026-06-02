"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { createTable, getTablesForWorkspace } from "@/services/restaurant/table-service";
import { createQRCode } from "@/services/qr/qr-ordering-service";
import { prisma } from "@/lib/prisma";

export async function listQrTablesAction() {
  const access = await requireMutationPermission("products.edit");
  if (!access.ok) return fail(access.error);
  const { userId } = await requireTenantActor();
  const [tables, storefront] = await Promise.all([
    getTablesForWorkspace(userId),
    prisma.storefrontSettings.findFirst({
      where: { userId, enabled: true, published: true },
      orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
      select: { storeSlug: true, publicName: true },
    }),
  ]);
  return ok({ tables, storeSlug: storefront?.storeSlug ?? null, publicName: storefront?.publicName });
}

const generateSchema = z.object({
  storeSlug: z.string().min(1).max(100),
  tableRouteId: z.string().min(1).max(80),
});

export async function generateQrCodeAction(input: z.infer<typeof generateSchema>) {
  try {
    const access = await requireMutationPermission("products.edit");
    if (!access.ok) return fail(access.error);
    const parsed = generateSchema.safeParse(input);
    if (!parsed.success) return fail("Invalid table.");
    const { userId } = await requireTenantActor();
    const result = await createQRCode(userId, parsed.data);
    if ("error" in result) return fail(result.error);
    revalidatePath("/dashboard/qr-codes");
    return ok(result);
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function createQrTableAction(input: { name: string; section?: string }) {
  try {
    const access = await requireMutationPermission("products.edit");
    if (!access.ok) return fail(access.error);
    const name = input.name.trim();
    if (!name) return fail("Table name is required.");
    const { userId } = await requireTenantActor();
    const table = await createTable(userId, { name, section: input.section?.trim() });
    revalidatePath("/dashboard/qr-codes");
    return ok({ id: table.id, name: table.name });
  } catch (e) {
    return fail(safeError(e));
  }
}
