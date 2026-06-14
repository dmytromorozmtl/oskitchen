import type { Prisma } from "@prisma/client";

import { buildFranchiseSuiteDashboard, buildFranchiseUnitRows } from "@/lib/enterprise/franchise-builders";
import { readFranchiseSuiteSettings, FRANCHISE_SUITE_STORAGE_KEY } from "@/lib/enterprise/franchise-storage";
import type {
  FranchiseRoyaltyPeriod,
  FranchiseSuiteDashboard,
  FranchiseSuiteSettings,
} from "@/lib/enterprise/franchise-types";
import { DEFAULT_FRANCHISE_SUITE_SETTINGS } from "@/lib/enterprise/franchise-types";
import { prisma } from "@/lib/prisma";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { calculateRoyalties } from "@/services/franchise/franchise-service";

export type { FranchiseSuiteDashboard } from "@/lib/enterprise/franchise-types";

async function loadFranchiseSuiteSettingsRaw(ownerUserId: string): Promise<FranchiseSuiteSettings> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  return readFranchiseSuiteSettings(kitchen?.settingsCenterJson ?? null);
}

async function saveFranchiseSuiteSettings(
  ownerUserId: string,
  settings: FranchiseSuiteSettings,
): Promise<void> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });

  const center =
    kitchen?.settingsCenterJson && typeof kitchen.settingsCenterJson === "object" && !Array.isArray(kitchen.settingsCenterJson)
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};

  center[FRANCHISE_SUITE_STORAGE_KEY] = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: { userId: ownerUserId, settingsCenterJson: center as Prisma.InputJsonValue },
    update: { settingsCenterJson: center as Prisma.InputJsonValue },
  });
}

async function loadCanonicalMenuItems(ownerUserId: string): Promise<string[]> {
  const menu = await prisma.menu.findFirst({
    where: {
      userId: ownerUserId,
      active: true,
      catalogOnly: false,
    },
    orderBy: { updatedAt: "desc" },
    select: {
      products: {
        where: { active: true },
        select: { title: true },
        take: 80,
      },
    },
  });

  const names = menu?.products.map((p) => p.title.trim()).filter(Boolean) ?? [];
  return [...new Set(names)];
}

async function loadProductNamesByFranchisee(franchiseeIds: string[]): Promise<Map<string, string[]>> {
  if (franchiseeIds.length === 0) return new Map();

  const products = await prisma.product.findMany({
    where: {
      active: true,
      menu: { userId: { in: franchiseeIds } },
    },
    select: { title: true, menu: { select: { userId: true } } },
    take: 2000,
  });

  const map = new Map<string, string[]>();
  for (const product of products) {
    const ownerId = product.menu.userId;
    const list = map.get(ownerId) ?? [];
    list.push(product.title);
    map.set(ownerId, list);
  }
  return map;
}

async function mergeBrandFromWorkspace(
  workspaceId: string,
  settings: FranchiseSuiteSettings,
): Promise<FranchiseSuiteSettings> {
  const brand = await prisma.brand.findFirst({
    where: { workspaceId, lifecycleStatus: "ACTIVE" },
    orderBy: { name: "asc" },
    select: {
      name: true,
      logoUrl: true,
      brandColor: true,
      positioning: true,
    },
  });

  if (!brand) return settings;

  return {
    ...settings,
    brandControl: {
      ...settings.brandControl,
      brandName: settings.brandControl.brandName ?? brand.name,
      logoUrl: settings.brandControl.logoUrl ?? brand.logoUrl,
      brandColor: settings.brandControl.brandColor ?? brand.brandColor,
      tagline: settings.brandControl.tagline ?? brand.positioning,
    },
  };
}

export async function loadFranchiseSuiteDashboard(input: {
  workspaceId: string;
  period?: FranchiseRoyaltyPeriod;
}): Promise<FranchiseSuiteDashboard> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(input.workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${input.workspaceId}`);

  const period = input.period ?? "month";

  const [royalties, settingsRaw, canonicalMenuItems] = await Promise.all([
    calculateRoyalties(ownerUserId, period),
    loadFranchiseSuiteSettingsRaw(ownerUserId),
    loadCanonicalMenuItems(ownerUserId),
  ]);

  const settings = await mergeBrandFromWorkspace(input.workspaceId, settingsRaw);
  if (settings.menuEnforcement.requiredItemCount === 0 && canonicalMenuItems.length > 0) {
    settings.menuEnforcement.requiredItemCount = canonicalMenuItems.length;
  }

  const franchiseeIds = royalties.franchises.map((f) => f.franchiseeId);
  const productNamesByFranchisee = await loadProductNamesByFranchisee(franchiseeIds);

  const units = buildFranchiseUnitRows({
    royalties,
    productNamesByFranchisee,
    settings,
    canonicalMenuItems,
  });

  return buildFranchiseSuiteDashboard({
    workspaceId: input.workspaceId,
    royalties,
    settings,
    units,
  });
}

export async function updateFranchiseBrandControl(
  workspaceId: string,
  patch: Partial<FranchiseSuiteSettings["brandControl"]>,
): Promise<FranchiseSuiteSettings> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const current = await loadFranchiseSuiteSettingsRaw(ownerUserId);
  const next: FranchiseSuiteSettings = {
    ...current,
    brandControl: { ...current.brandControl, ...patch },
  };
  await saveFranchiseSuiteSettings(ownerUserId, next);
  return next;
}

export async function updateFranchiseMenuEnforcement(
  workspaceId: string,
  patch: Partial<FranchiseSuiteSettings["menuEnforcement"]> & { lockedMenuItems?: string[] },
): Promise<FranchiseSuiteSettings> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const current = await loadFranchiseSuiteSettingsRaw(ownerUserId);
  const lockedMenuItems =
    patch.lockedMenuItems?.map((s) => s.trim()).filter(Boolean) ?? current.menuEnforcement.lockedMenuItems;

  const next: FranchiseSuiteSettings = {
    ...current,
    menuEnforcement: {
      ...current.menuEnforcement,
      ...patch,
      lockedMenuItems,
      requiredItemCount: lockedMenuItems.length,
    },
    brandControl: {
      ...current.brandControl,
      enforcementMode: patch.mode ?? current.menuEnforcement.mode,
    },
  };

  await saveFranchiseSuiteSettings(ownerUserId, next);
  return next;
}

export async function seedFranchiseMenuEnforcementFromCatalog(workspaceId: string): Promise<string[]> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const items = await loadCanonicalMenuItems(ownerUserId);
  const unique = [...new Set(items.map((n) => n.trim()).filter(Boolean))];

  await updateFranchiseMenuEnforcement(workspaceId, {
    lockedMenuItems: unique,
    requiredItemCount: unique.length,
  });

  return unique;
}

export async function getDefaultFranchiseSuiteSettings(): Promise<FranchiseSuiteSettings> {
  return { ...DEFAULT_FRANCHISE_SUITE_SETTINGS };
}
