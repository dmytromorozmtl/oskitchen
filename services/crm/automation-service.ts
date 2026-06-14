import type { CustomerFollowUpType, Prisma } from "@prisma/client";

import {
  buildCrmAutomationLane,
  buildCrmAutomationQueueItem,
  buildCrmAutomationSnapshot,
} from "@/lib/crm/automation-builders";
import {
  crmAutomationFromSettingsCenter,
  mergeCrmAutomationIntoSettingsCenter,
  parseCrmAutomationConfig,
} from "@/lib/crm/automation-settings";
import type {
  CrmAutomationConfig,
  CrmAutomationKind,
  CrmAutomationQueueItem,
  CrmAutomationSnapshot,
} from "@/lib/crm/automation-types";
import { parseFavoriteItems } from "@/lib/crm/customer-privacy";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { kitchenCustomerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import {
  parseCustomerBirthdayMmDd,
  processBirthdayRewardsForOwner,
  todayMmDd,
} from "@/services/loyalty/loyalty-2.0-service";

export type {
  CrmAutomationConfig,
  CrmAutomationSnapshot,
} from "@/lib/crm/automation-types";

const FOLLOW_UP_TYPE_BY_KIND: Record<CrmAutomationKind, CustomerFollowUpType> = {
  win_back: "REACTIVATION",
  birthday: "VIP",
  favorites: "GENERAL",
};

function customerLabel(input: {
  displayName: string | null;
  name: string | null;
  email: string;
}): string {
  return input.displayName ?? input.name ?? input.email;
}

function passesConsentGate(input: {
  config: CrmAutomationConfig;
  marketingConsent: boolean;
}): boolean {
  return !input.config.requireMarketingConsent || input.marketingConsent;
}

export async function loadCrmAutomationConfig(ownerUserId: string): Promise<CrmAutomationConfig> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  return crmAutomationFromSettingsCenter(kitchen?.settingsCenterJson);
}

export async function saveCrmAutomationConfig(
  ownerUserId: string,
  config: CrmAutomationConfig,
): Promise<CrmAutomationConfig> {
  const workspaceId = await resolveOwnerWorkspaceId(ownerUserId);
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  const merged = mergeCrmAutomationIntoSettingsCenter(
    kitchen?.settingsCenterJson,
    config,
  ) as Prisma.InputJsonValue;

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: { userId: ownerUserId, workspaceId, settingsCenterJson: merged },
    update: { settingsCenterJson: merged },
  });

  return config;
}

async function loadWinBackCandidates(
  ownerUserId: string,
  config: CrmAutomationConfig,
): Promise<CrmAutomationQueueItem[]> {
  if (!config.winBackEnabled) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - config.winBackInactiveDays);
  const customerWhere = await kitchenCustomerListWhereForOwner(ownerUserId);

  const customers = await prisma.kitchenCustomer.findMany({
    where: {
      AND: [
        customerWhere,
        {
          OR: [
            { status: "AT_RISK" },
            { lastOrderAt: { lt: cutoff } },
            { lastOrderAt: null, totalOrders: { gt: 0 } },
          ],
        },
      ],
    },
    select: {
      id: true,
      displayName: true,
      name: true,
      email: true,
      marketingConsent: true,
      lastOrderAt: true,
      totalOrders: true,
    },
    orderBy: { lastOrderAt: "asc" },
    take: 20,
  });

  return customers
    .filter((row) =>
      passesConsentGate({ config, marketingConsent: row.marketingConsent }),
    )
    .map((row) =>
      buildCrmAutomationQueueItem({
        kind: "win_back",
        customerId: row.id,
        customerName: customerLabel(row),
        message: row.lastOrderAt
          ? `Inactive since ${row.lastOrderAt.toLocaleDateString()} — win-back outreach`
          : "No recent orders — reactivation opportunity",
        requiresConsent: config.requireMarketingConsent,
        hasConsent: row.marketingConsent,
      }),
    );
}

async function loadBirthdayCandidates(
  ownerUserId: string,
  config: CrmAutomationConfig,
): Promise<CrmAutomationQueueItem[]> {
  if (!config.birthdayEnabled) return [];

  const mmdd = todayMmDd("UTC");
  const customerWhere = await kitchenCustomerListWhereForOwner(ownerUserId);
  const customers = await prisma.kitchenCustomer.findMany({
    where: customerWhere,
    select: {
      id: true,
      displayName: true,
      name: true,
      email: true,
      marketingConsent: true,
      tagsJson: true,
    },
    take: 5000,
  });

  return customers
    .filter((row) => parseCustomerBirthdayMmDd(row.tagsJson) === mmdd)
    .filter((row) =>
      passesConsentGate({ config, marketingConsent: row.marketingConsent }),
    )
    .slice(0, 20)
    .map((row) =>
      buildCrmAutomationQueueItem({
        kind: "birthday",
        customerId: row.id,
        customerName: customerLabel(row),
        message: `Birthday today (${mmdd}) — reward + personal note`,
        requiresConsent: config.requireMarketingConsent,
        hasConsent: row.marketingConsent,
      }),
    );
}

async function loadFavoritesCandidates(
  ownerUserId: string,
  config: CrmAutomationConfig,
): Promise<CrmAutomationQueueItem[]> {
  if (!config.favoritesEnabled) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - config.favoritesInactiveDays);
  const customerWhere = await kitchenCustomerListWhereForOwner(ownerUserId);

  const customers = await prisma.kitchenCustomer.findMany({
    where: {
      AND: [
        customerWhere,
        {
          OR: [{ lastOrderAt: { lt: cutoff } }, { lastOrderAt: null }],
        },
      ],
    },
    select: {
      id: true,
      displayName: true,
      name: true,
      email: true,
      marketingConsent: true,
      favoriteItemsJson: true,
      lastOrderAt: true,
    },
    orderBy: { lastOrderAt: "asc" },
    take: 50,
  });

  return customers
    .map((row) => {
      const favorites = parseFavoriteItems(row.favoriteItemsJson);
      if (favorites.length === 0) return null;
      if (!passesConsentGate({ config, marketingConsent: row.marketingConsent })) return null;
      return buildCrmAutomationQueueItem({
        kind: "favorites",
        customerId: row.id,
        customerName: customerLabel(row),
        message: `Missed favorites: ${favorites.slice(0, 2).join(", ")}${favorites.length > 2 ? "…" : ""}`,
        requiresConsent: config.requireMarketingConsent,
        hasConsent: row.marketingConsent,
      });
    })
    .filter((row): row is CrmAutomationQueueItem => row != null)
    .slice(0, 20);
}

async function countFollowUpsCreatedToday(ownerUserId: string): Promise<number> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return prisma.customerFollowUp.count({
    where: {
      userId: ownerUserId,
      createdAt: { gte: start },
      reason: { contains: "CRM Automation" },
    },
  });
}

export async function loadCrmAutomationSnapshot(
  ownerUserId: string,
): Promise<CrmAutomationSnapshot> {
  const config = await loadCrmAutomationConfig(ownerUserId);
  const [winBack, birthday, favorites, followUpsCreatedToday] = await Promise.all([
    loadWinBackCandidates(ownerUserId, config),
    loadBirthdayCandidates(ownerUserId, config),
    loadFavoritesCandidates(ownerUserId, config),
    countFollowUpsCreatedToday(ownerUserId),
  ]);

  const lanes = [
    buildCrmAutomationLane({ kind: "win_back", enabled: config.winBackEnabled, items: winBack }),
    buildCrmAutomationLane({ kind: "birthday", enabled: config.birthdayEnabled, items: birthday }),
    buildCrmAutomationLane({
      kind: "favorites",
      enabled: config.favoritesEnabled,
      items: favorites,
    }),
  ];

  return buildCrmAutomationSnapshot({
    config,
    lanes,
    followUpsCreatedToday,
  });
}

async function hasOpenAutomationFollowUp(input: {
  customerId: string;
  kind: CrmAutomationKind;
}): Promise<boolean> {
  const existing = await prisma.customerFollowUp.findFirst({
    where: {
      customerId: input.customerId,
      status: "OPEN",
      type: FOLLOW_UP_TYPE_BY_KIND[input.kind],
      reason: { contains: "CRM Automation" },
    },
    select: { id: true },
  });
  return existing != null;
}

export async function runCrmAutomationScan(ownerUserId: string): Promise<{
  followUpsCreated: number;
  birthdayRewardsAwarded: number;
}> {
  const snapshot = await loadCrmAutomationSnapshot(ownerUserId);
  const workspaceId = await resolveOwnerWorkspaceId(ownerUserId);
  let followUpsCreated = 0;

  for (const lane of snapshot.lanes) {
    if (!lane.enabled) continue;
    for (const item of lane.items) {
      if (item.requiresConsent && !item.hasConsent) continue;
      const exists = await hasOpenAutomationFollowUp({
        customerId: item.customerId,
        kind: item.kind,
      });
      if (exists) continue;

      await prisma.customerFollowUp.create({
        data: {
          userId: ownerUserId,
          workspaceId,
          customerId: item.customerId,
          title: `${lane.label}: ${item.customerName}`,
          reason: `CRM Automation — ${item.message}`,
          type: FOLLOW_UP_TYPE_BY_KIND[item.kind],
          dueAt: new Date(),
          status: "OPEN",
        },
      });
      followUpsCreated += 1;
    }
  }

  let birthdayRewardsAwarded = 0;
  if (snapshot.config.birthdayEnabled) {
    const birthdayResult = await processBirthdayRewardsForOwner(ownerUserId);
    birthdayRewardsAwarded = birthdayResult.awarded;
  }

  return { followUpsCreated, birthdayRewardsAwarded };
}

export function parseCrmAutomationConfigFromRaw(raw: unknown): CrmAutomationConfig {
  return parseCrmAutomationConfig(raw);
}
