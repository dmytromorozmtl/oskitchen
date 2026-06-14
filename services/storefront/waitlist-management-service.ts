import { prisma } from "@/lib/prisma";
import { loadKitchenSettingsCenterJson } from "@/lib/storefront/kitchen-settings-center";
import { getStorefrontForPublic } from "@/lib/storefront/public-access";
import { sendSmsNotification, type SmsSendResult } from "@/services/notifications/sms-service";
import {
  buildWaitlistQueueSummary,
  findQueueItemForEntry,
  formatWaitlistJoinedSms,
  formatWaitlistReadySms,
  parseWaitlistConfig,
  type WaitlistEntryForEstimate,
} from "@/services/storefront/waitlist-service";

export type WaitlistPublicStatus = {
  entryId: string;
  customerName: string;
  partySize: number;
  status: string;
  position: number | null;
  estimatedWaitMinutes: number | null;
  quotedMinutes: number;
};

export async function loadActiveWaitlistEntries(storefrontId: string): Promise<WaitlistEntryForEstimate[]> {
  const rows = await prisma.storefrontWaitlistEntry.findMany({
    where: { storefrontId, status: { in: ["WAITING", "NOTIFIED"] } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      partySize: true,
      createdAt: true,
      status: true,
    },
  });
  return rows;
}

export async function refreshWaitlistQuotes(storefrontId: string, settingsCenterJson: unknown) {
  const config = parseWaitlistConfig(settingsCenterJson);
  const entries = await loadActiveWaitlistEntries(storefrontId);
  const summary = buildWaitlistQueueSummary(entries, config);

  await Promise.all(
    summary.map((item) =>
      prisma.storefrontWaitlistEntry.update({
        where: { id: item.id },
        data: { quotedMinutes: item.estimatedWaitMinutes },
      }),
    ),
  );

  return summary;
}

export async function createPublicWaitlistEntry(
  storeSlug: string,
  input: { customerName: string; customerPhone: string; partySize: number },
) {
  const sf = await getStorefrontForPublic(storeSlug);
  if (!sf) {
    throw new Error("Storefront not found.");
  }

  const entry = await prisma.storefrontWaitlistEntry.create({
    data: {
      userId: sf.userId,
      storefrontId: sf.id,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      partySize: input.partySize,
      quotedMinutes: DEFAULT_QUOTED_PLACEHOLDER,
      status: "WAITING",
    },
  });

  const settingsCenterJson = await loadKitchenSettingsCenterJson(sf.userId);
  const summary = await refreshWaitlistQuotes(sf.id, settingsCenterJson);
  const queueItem = summary.find((item) => item.id === entry.id);
  const config = parseWaitlistConfig(settingsCenterJson);

  const sms = await sendWaitlistJoinedSms({
    storeName: sf.publicName,
    customerPhone: entry.customerPhone,
    position: queueItem?.position ?? 1,
    estimatedMinutes: queueItem?.estimatedWaitMinutes ?? config.baseMinutes,
  });

  const { emitWaitlistJoinedOutboundWebhook } = await import(
    "@/services/webhooks/outbound-webhook-emitters"
  );
  await emitWaitlistJoinedOutboundWebhook({
    ownerUserId: sf.userId,
    entryId: entry.id,
    storefrontId: sf.id,
    partySize: entry.partySize,
    position: queueItem?.position ?? 1,
    estimatedWaitMinutes: queueItem?.estimatedWaitMinutes ?? config.baseMinutes,
  }).catch(() => undefined);

  return {
    entry,
    position: queueItem?.position ?? 1,
    estimatedWaitMinutes: queueItem?.estimatedWaitMinutes ?? config.baseMinutes,
    sms,
  };
}

const DEFAULT_QUOTED_PLACEHOLDER = 20;

export async function loadPublicWaitlistStatus(
  storeSlug: string,
  entryId: string,
): Promise<WaitlistPublicStatus | null> {
  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug },
    select: {
      id: true,
      enabled: true,
      published: true,
      userId: true,
    },
  });
  if (!sf?.enabled || !sf.published) return null;

  const entry = await prisma.storefrontWaitlistEntry.findFirst({
    where: { id: entryId, storefrontId: sf.id },
  });
  if (!entry) return null;

  const entries = await loadActiveWaitlistEntries(sf.id);
  const config = parseWaitlistConfig(await loadKitchenSettingsCenterJson(sf.userId));
  const queueItem =
    entry.status === "WAITING" ? findQueueItemForEntry(entry.id, entries, config) : null;

  return {
    entryId: entry.id,
    customerName: entry.customerName,
    partySize: entry.partySize,
    status: entry.status,
    position: queueItem?.position ?? null,
    estimatedWaitMinutes: queueItem?.estimatedWaitMinutes ?? entry.quotedMinutes,
    quotedMinutes: entry.quotedMinutes,
  };
}

export async function notifyWaitlistGuestWithSms(
  ownerUserId: string,
  entryId: string,
): Promise<{ entry: Awaited<ReturnType<typeof prisma.storefrontWaitlistEntry.update>>; sms: SmsSendResult }> {
  const row = await prisma.storefrontWaitlistEntry.findFirst({
    where: { id: entryId, userId: ownerUserId },
    include: {
      storefront: {
        select: {
          id: true,
          publicName: true,
          userId: true,
        },
      },
    },
  });
  if (!row) throw new Error("Waitlist entry not found.");
  if (row.status === "SEATED" || row.status === "CANCELLED") {
    throw new Error("Waitlist entry is no longer active.");
  }

  const settingsCenterJson = await loadKitchenSettingsCenterJson(row.storefront.userId);
  const config = parseWaitlistConfig(settingsCenterJson);
  const sms = await sendWaitlistReadySms({
    storeName: row.storefront.publicName,
    customerPhone: row.customerPhone,
    graceMinutes: config.notifyGraceMinutes,
  });

  const entry = await prisma.storefrontWaitlistEntry.update({
    where: { id: entryId },
    data: { status: "NOTIFIED" },
  });

  await refreshWaitlistQuotes(row.storefront.id, settingsCenterJson);

  return { entry, sms };
}

export async function sendWaitlistJoinedSms(params: {
  storeName: string;
  customerPhone: string;
  position: number;
  estimatedMinutes: number;
}): Promise<SmsSendResult> {
  return sendSmsNotification({
    to: params.customerPhone,
    body: formatWaitlistJoinedSms({
      storeName: params.storeName,
      position: params.position,
      estimatedMinutes: params.estimatedMinutes,
    }),
  });
}

export async function sendWaitlistReadySms(params: {
  storeName: string;
  customerPhone: string;
  graceMinutes: number;
}): Promise<SmsSendResult> {
  return sendSmsNotification({
    to: params.customerPhone,
    body: formatWaitlistReadySms({
      storeName: params.storeName,
      graceMinutes: params.graceMinutes,
    }),
  });
}

export async function addOwnerWaitlistEntryWithEstimates(
  ownerUserId: string,
  storefrontId: string,
  settingsCenterJson: unknown,
  input: { customerName: string; customerPhone: string; partySize: number },
) {
  const entry = await prisma.storefrontWaitlistEntry.create({
    data: {
      userId: ownerUserId,
      storefrontId,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      partySize: input.partySize,
      quotedMinutes: DEFAULT_QUOTED_PLACEHOLDER,
      status: "WAITING",
    },
  });

  const summary = await refreshWaitlistQuotes(storefrontId, settingsCenterJson);
  const queueItem = summary.find((item) => item.id === entry.id);

  const { emitWaitlistJoinedOutboundWebhook } = await import(
    "@/services/webhooks/outbound-webhook-emitters"
  );
  await emitWaitlistJoinedOutboundWebhook({
    ownerUserId,
    entryId: entry.id,
    storefrontId,
    partySize: entry.partySize,
    position: queueItem?.position ?? 1,
    estimatedWaitMinutes: queueItem?.estimatedWaitMinutes ?? DEFAULT_QUOTED_PLACEHOLDER,
  }).catch(() => undefined);

  return {
    entry: await prisma.storefrontWaitlistEntry.findUniqueOrThrow({ where: { id: entry.id } }),
    position: queueItem?.position ?? 1,
    estimatedWaitMinutes: queueItem?.estimatedWaitMinutes ?? DEFAULT_QUOTED_PLACEHOLDER,
  };
}
