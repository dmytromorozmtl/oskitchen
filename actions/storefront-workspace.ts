"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { requireStorefrontAdminPermission } from "@/lib/storefront/storefront-admin-access";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { safeError } from "@/lib/security";

const linkWorkspaceSchema = z.object({
  workspaceId: z.string().uuid(),
});

/** Link current storefront to an existing workspace (multi-store scaffold). */
export async function linkStorefrontToWorkspaceAction(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const parsed = linkWorkspaceSchema.safeParse({
      workspaceId: formData.get("workspaceId")?.toString(),
    });
    if (!parsed.success) return { error: "Invalid workspace id." };

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId, workspaceId: parsed.data.workspaceId },
    });
    if (!membership) return { error: "You are not a member of this workspace." };

    const access = await requireStorefrontAdminPermission("storefront.settings");
    const sf = await prisma.storefrontSettings.findUnique({
      where: { id: access.storefront.id },
    });
    if (!sf) return { error: "Save storefront overview first." };

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { workspaceId: parsed.data.workspaceId },
    });

    revalidateStorefrontDashboardAndPublic(sf.storeSlug, "settings", {
      storefrontId: sf.id,
      ownerUserId: user.id,
    });
    revalidatePath("/dashboard/storefront/workspace");
    revalidatePath("/dashboard/storefront/team");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

const linkBrandSchema = z.object({
  brandId: z.string().uuid(),
});

export async function linkStorefrontToBrandAction(formData: FormData) {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const parsed = linkBrandSchema.safeParse({
      brandId: formData.get("brandId")?.toString(),
    });
    if (!parsed.success) return { error: "Select a brand." };

    const access = await requireStorefrontAdminPermission("storefront.settings");
    const sf = await prisma.storefrontSettings.findUnique({
      where: { id: access.storefront.id },
    });
    if (!sf?.workspaceId) return { error: "Link a workspace first." };

    const brand = await prisma.brand.findFirst({
      where: { id: parsed.data.brandId, workspaceId: sf.workspaceId },
    });
    if (!brand) return { error: "Brand not found in this workspace." };

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { brandId: brand.id },
    });

    revalidateStorefrontDashboardAndPublic(sf.storeSlug, "settings", {
      storefrontId: sf.id,
      ownerUserId: user.id,
    });
    revalidatePath("/dashboard/storefront/workspace");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createWorkspaceForStorefrontAction() {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const profile = await prisma.userProfile.findUnique({ where: { id: user.id } });
    if (!profile) return { error: "Profile missing." };

    const access = await requireStorefrontAdminPermission("storefront.settings");
    const sf = await prisma.storefrontSettings.findUnique({
      where: { id: access.storefront.id },
    });
    if (!sf) return { error: "Save storefront overview first." };
    if (sf.workspaceId) return { error: "Workspace already linked." };

    const ws = await prisma.workspace.create({
      data: {
        name: profile.companyName?.trim() || profile.fullName || "My kitchen",
        ownerUserId: user.id,
        members: {
          create: { userId, role: "OWNER" },
        },
      },
    });

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { workspaceId: ws.id },
    });

    revalidateStorefrontDashboardAndPublic(sf.storeSlug, "settings", {
      storefrontId: sf.id,
      ownerUserId: user.id,
    });
    revalidatePath("/dashboard/storefront/workspace");
    return { ok: true as const, workspaceId: ws.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}
