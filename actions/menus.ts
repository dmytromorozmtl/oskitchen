"use server";


import { fail, ok } from "@/lib/action-result";
import { startOfDay } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MenuStrategy, Prisma } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  menuByIdWhereForOwner,
  menuListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { menuCreateSchema, menuWizardCreateSchema } from "@/lib/schemas";
import { safeError } from "@/lib/security";
import { countMenusForUser, getEffectivePlan } from "@/lib/plans";
import { recordLifecycleEventSafe } from "@/lib/lifecycle-events";
import { trackUsageEvent } from "@/lib/usage";
import { assertCollectionSlugUnique, validateCollectionSlugFormat } from "@/lib/menus/collection-slug";
import { menuStrategyDefinition } from "@/lib/menus/menu-strategies";
import { MENU_TEMPLATE_IDS, menuTemplatePayload, type MenuTemplateId } from "@/lib/menus/menu-templates";

async function requireMenuMutationPermission(
  operation: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const permission: PermissionKey = "products.edit";
  const access = await requireMutationPermission(permission);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "menus.permission_denied",
      entityType: "Menu",
      metadata: { operation, requiredPermission: permission },
    });
    return { ok: false, error: access.error };
  }
  return { ok: true };
}

function parseMenuForm(formData: FormData) {
  const rawStrategy = formData.get("strategy")?.toString().trim();
  return menuCreateSchema.safeParse({
    title: formData.get("title"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    preorderDeadline: formData.get("preorderDeadline"),
    strategy:
      rawStrategy && (Object.values(MenuStrategy) as string[]).includes(rawStrategy)
        ? (rawStrategy as MenuStrategy)
        : undefined,
    description: formData.get("description")?.toString() ?? null,
    collectionSlug: formData.get("collectionSlug")?.toString() ?? "",
  });
}

function parseWizardMenuForm(formData: FormData) {
  return menuWizardCreateSchema.safeParse({
    title: formData.get("title"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    preorderDeadline: formData.get("preorderDeadline"),
    strategy: formData.get("strategy")?.toString().trim(),
    description: formData.get("description")?.toString() ?? null,
  });
}

export async function createMenu(formData: FormData) {
  try {
    const gate = await requireMenuMutationPermission("menus.create");
    if (!gate.ok) return { error: gate.error };

    const { sessionUser, userId, workspaceId } = await requireTenantActor();
    const prevMenuCount = await countMenusForUser(userId);
    const { limits } = await getEffectivePlan(userId);

    if (limits.maxMenus != null) {
      const count = prevMenuCount;
      if (count >= limits.maxMenus) {
        return {
          error: `Starter plan allows ${limits.maxMenus} menu. Upgrade to add more.`,
        };
      }
    }

    const parsed = parseMenuForm(formData);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors;
      return {
        error: Object.values(msg).flat()[0] ?? "Invalid menu details",
      };
    }

    const { title, startDate, endDate, preorderDeadline, strategy, description } = parsed.data;

    await prisma.menu.create({
      data: {
        userId,
        workspaceId: workspaceId ?? undefined,
        title,
        startDate,
        endDate,
        preorderDeadline,
        active: false,
        strategy: strategy ?? MenuStrategy.WEEKLY_PREORDER,
        description: description ?? null,
      },
    });

    if (prevMenuCount === 0) {
      void recordLifecycleEventSafe(sessionUser.id, "first_menu_created");
    }

    void trackUsageEvent({
      userId,
      eventName: "menu_created",
      route: "/dashboard/menus",
    });

    revalidatePath("/dashboard/menus");
    return ok(undefined);
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createMenuFromWizard(formData: FormData) {
  try {
    const gate = await requireMenuMutationPermission("menus.create_wizard");
    if (!gate.ok) return { error: gate.error };

    const { userId, workspaceId } = await requireTenantActor();
    const prevMenuCount = await countMenusForUser(userId);
    const { limits } = await getEffectivePlan(userId);

    if (limits.maxMenus != null && prevMenuCount >= limits.maxMenus) {
      return {
        error: `Starter plan allows ${limits.maxMenus} menu. Upgrade to add more.`,
      };
    }

    const parsed = parseWizardMenuForm(formData);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors;
      return {
        error: Object.values(msg).flat()[0] ?? "Invalid menu details",
      };
    }

    const { title, startDate, endDate, preorderDeadline, strategy, description } = parsed.data;
    const def = menuStrategyDefinition(strategy);
    const displaySettingsJson = {
      defaultCategories: [...def.defaultCategories],
      defaultSections: [...def.defaultSections],
    };

    await prisma.menu.create({
      data: {
        userId,
        workspaceId: workspaceId ?? undefined,
        title,
        startDate,
        endDate,
        preorderDeadline,
        active: false,
        strategy,
        description: description ?? null,
        displaySettingsJson: displaySettingsJson as Prisma.InputJsonValue,
      },
    });

    void trackUsageEvent({
      userId,
      eventName: "menu_created",
      route: "/dashboard/menus/new",
    });

    revalidatePath("/dashboard/menus");
    revalidatePath("/dashboard/menus/new");
    return ok(undefined);
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function applyMenuTemplate(templateId: string): Promise<void> {
  const gate = await requireMenuMutationPermission("menus.apply_template");
  if (!gate.ok) return;

  const { userId, workspaceId } = await requireTenantActor();
  if (!MENU_TEMPLATE_IDS.includes(templateId as MenuTemplateId)) {
    redirect("/dashboard/menus/templates?error=invalid");
  }
  const prevMenuCount = await countMenusForUser(userId);
  const { limits } = await getEffectivePlan(userId);
  if (limits.maxMenus != null && prevMenuCount >= limits.maxMenus) {
    redirect("/dashboard/menus/templates?error=limit");
  }

  const payload = menuTemplatePayload(templateId as MenuTemplateId);
  await prisma.menu.create({
    data: {
      userId,
      workspaceId: workspaceId ?? undefined,
      title: payload.title,
      startDate: payload.startDate,
      endDate: payload.endDate,
      preorderDeadline: payload.preorderDeadline,
      active: false,
      strategy: payload.strategy,
      description: payload.description ?? null,
      displaySettingsJson: payload.displaySettingsJson as Prisma.InputJsonValue | undefined,
      availabilityJson: payload.availabilityJson as Prisma.InputJsonValue | undefined,
      fulfillmentRulesJson: payload.fulfillmentRulesJson as Prisma.InputJsonValue | undefined,
    },
  });

  revalidatePath("/dashboard/menus");
  revalidatePath("/dashboard/menus/templates");
  redirect("/dashboard/menus");
}

export async function updateMenu(menuId: string, formData: FormData) {
  try {
    const gate = await requireMenuMutationPermission("menus.update");
    if (!gate.ok) return { error: gate.error };

    const { userId } = await requireTenantActor();

    const menu = await prisma.menu.findFirst({
      where: await menuByIdWhereForOwner(userId, menuId),
    });
    if (!menu) return { error: "Menu not found" };

    const parsed = parseMenuForm(formData);
    if (!parsed.success) {
      return {
        error:
          Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
          "Invalid menu details",
      };
    }

    const { title, startDate, endDate, preorderDeadline, strategy, description, collectionSlug: collectionSlugRaw } =
      parsed.data;

    const slugCheck = validateCollectionSlugFormat(collectionSlugRaw ?? "");
    if (!slugCheck.ok) return { error: slugCheck.error };
    const collectionSlug = slugCheck.slug || null;
    const unique = await assertCollectionSlugUnique(userId, collectionSlug, menuId);
    if (!unique.ok) return { error: unique.error };

    const heroImageUrl = formData.get("collectionHeroImageUrl")?.toString().trim() ?? "";
    const heroTitle = formData.get("collectionHeroTitle")?.toString().trim() ?? "";
    const heroSubtitle = formData.get("collectionHeroSubtitle")?.toString().trim() ?? "";
    const prevSf =
      menu.storefrontSettingsJson && typeof menu.storefrontSettingsJson === "object" && !Array.isArray(menu.storefrontSettingsJson)
        ? (menu.storefrontSettingsJson as Record<string, unknown>)
        : {};
    const storefrontSettingsJson = {
      ...prevSf,
      ...(heroImageUrl ? { heroImageUrl } : { heroImageUrl: null }),
      ...(heroTitle ? { heroTitle } : {}),
      ...(heroSubtitle ? { heroSubtitle } : {}),
    };

    await prisma.menu.update({
      where: { id: menuId },
      data: {
        title,
        startDate,
        endDate,
        preorderDeadline,
        ...(strategy ? { strategy } : {}),
        description: description ?? null,
        collectionSlug,
        storefrontSettingsJson: storefrontSettingsJson as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/dashboard/menus");
    revalidatePath(`/dashboard/menus/${menuId}`);
    const sf = await prisma.storefrontSettings.findFirst({ where: { userId }, orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
      select: { storeSlug: true },
    });
    if (sf) revalidatePath(`/s/${sf.storeSlug}`);
    return ok(undefined);
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function setMenuActive(menuId: string, active: boolean) {
  try {
    const gate = await requireMenuMutationPermission("menus.set_active");
    if (!gate.ok) return { error: gate.error };

    const { userId } = await requireTenantActor();

    const menu = await prisma.menu.findFirst({
      where: await menuByIdWhereForOwner(userId, menuId),
    });
    if (!menu) return { error: "Menu not found" };

    const today = startOfDay(new Date());
    if (active && menu.endDate < today) {
      return {
        error:
          "This menu’s service window has already ended. Extend the dates or duplicate the menu.",
      };
    }

    await prisma.$transaction(async (tx) => {
      if (active) {
        await tx.menu.updateMany({
          where: await menuListWhereForOwner(userId),
          data: { active: false },
        });
      }
      await tx.menu.updateMany({
        where: await menuByIdWhereForOwner(userId, menuId),
        data: { active },
      });
    });

    revalidatePath("/dashboard/menus");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/menus/${menuId}`);
    return ok(undefined);
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function duplicateMenu(menuId: string) {
  try {
    const gate = await requireMenuMutationPermission("menus.duplicate");
    if (!gate.ok) return { error: gate.error };

    const { userId, workspaceId } = await requireTenantActor();
    const { limits } = await getEffectivePlan(userId);

    if (limits.maxMenus != null) {
      const count = await countMenusForUser(userId);
      if (count >= limits.maxMenus) {
        return {
          error: `Starter plan allows ${limits.maxMenus} menu. Upgrade to duplicate.`,
        };
      }
    }

    const source = await prisma.menu.findFirst({
      where: await menuByIdWhereForOwner(userId, menuId),
      include: { products: { orderBy: { sortOrder: "asc" } } },
    });
    if (!source) return { error: "Menu not found" };
    if (source.catalogOnly) {
      return { error: "The item catalog cannot be duplicated." };
    }

    const copy = await prisma.menu.create({
      data: {
        userId,
        workspaceId: workspaceId ?? undefined,
        title: `${source.title} (copy)`,
        startDate: source.startDate,
        endDate: source.endDate,
        preorderDeadline: source.preorderDeadline,
        active: false,
        sortOrder: source.sortOrder + 1,
        strategy: source.strategy,
        description: source.description,
        published: false,
        preparedDatesJson: source.preparedDatesJson as Prisma.InputJsonValue | undefined,
        availabilityJson: source.availabilityJson as Prisma.InputJsonValue | undefined,
        fulfillmentRulesJson: source.fulfillmentRulesJson as Prisma.InputJsonValue | undefined,
        displaySettingsJson: source.displaySettingsJson as Prisma.InputJsonValue | undefined,
        storefrontSettingsJson: source.storefrontSettingsJson as Prisma.InputJsonValue | undefined,
      },
    });

    for (const p of source.products) {
      const product = await prisma.product.create({
        data: {
          menuId: copy.id,
          workspaceId: workspaceId ?? undefined,
          title: p.title,
          description: p.description,
          category: p.category,
          allergens: p.allergens,
          ingredients: p.ingredients,
          portionSize: p.portionSize,
          reheatingInstructions: p.reheatingInstructions,
          kitchenNotes: p.kitchenNotes,
          preparedDate: p.preparedDate,
          pickupDate: p.pickupDate,
          deliveryAvailable: p.deliveryAvailable,
          active: p.active,
          price: p.price,
          image: p.image,
          sortOrder: p.sortOrder,
        },
      });
      await prisma.productionTask.create({
        data: { productId: product.id },
      });
    }

    revalidatePath("/dashboard/menus");
    revalidatePath(`/dashboard/menus/${copy.id}`);
    return ok(undefined);
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function deleteMenu(menuId: string) {
  try {
    const gate = await requireMenuMutationPermission("menus.delete");
    if (!gate.ok) return { error: gate.error };

    const { userId } = await requireTenantActor();
    const target = await prisma.menu.findFirst({
      where: await menuByIdWhereForOwner(userId, menuId),
      select: { catalogOnly: true },
    });
    if (!target) return { error: "Menu not found" };
    if (target.catalogOnly) {
      return { error: "The item catalog cannot be deleted." };
    }
    await prisma.menu.deleteMany({
      where: await menuByIdWhereForOwner(userId, menuId),
    });
    revalidatePath("/dashboard/menus");
    return ok(undefined);
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function reorderMenus(orderedIds: string[]) {
  try {
    const gate = await requireMenuMutationPermission("menus.reorder");
    if (!gate.ok) return { error: gate.error };

    const { userId } = await requireTenantActor();
    const updates = await Promise.all(
      orderedIds.map(async (id, index) => ({
        where: await menuByIdWhereForOwner(userId, id),
        data: { sortOrder: index },
      })),
    );
    await prisma.$transaction(updates.map((u) => prisma.menu.updateMany(u)));
    revalidatePath("/dashboard/menus");
    return ok(undefined);
  } catch (e) {
    return { error: safeError(e) };
  }
}
