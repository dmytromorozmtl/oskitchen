import { randomBytes } from "crypto";

import type { GiftCardStatus, Prisma } from "@prisma/client";

import {
  DEFAULT_GIFT_CARD_PROGRAM,
  encodeGiftCardNotes,
  giftCardProgramFromSettingsCenter,
  mergeGiftCardProgramIntoSettingsCenter,
  parseGiftCardNotes,
  type GiftCardDeliveryType,
  type GiftCardMetadata,
  parseGiftCardProgramSettings,
  type GiftCardProgramSettings,
} from "@/lib/loyalty/gift-cards-settings";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  createGiftCard,
  listGiftCards,
  lookupGiftCard,
  redeemGiftCard,
} from "@/services/gift-cards/gift-card-service";

export type EnrichedGiftCard = {
  id: string;
  code: string;
  balance: number;
  initialBalance: number;
  status: GiftCardStatus;
  delivery: GiftCardDeliveryType;
  recipientEmail?: string;
  batchId?: string;
  printed: boolean;
  label?: string;
  userNote?: string;
  updatedAt: Date;
};

export type GiftCardHubSummary = {
  program: GiftCardProgramSettings;
  digitalActive: number;
  physicalActive: number;
  physicalUnprinted: number;
  outstandingBalance: number;
  redeemedCount: number;
};

function generatePhysicalCode(prefix: string): string {
  const body = randomBytes(5).toString("hex").toUpperCase();
  return `${prefix}${body}`.slice(0, 32);
}

function newBatchId(): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `BATCH-${stamp}-${randomBytes(2).toString("hex").toUpperCase()}`;
}

function enrichCard(card: {
  id: string;
  code: string;
  balance: unknown;
  initialBalance: unknown;
  status: GiftCardStatus;
  notes: string | null;
  updatedAt: Date;
}): EnrichedGiftCard {
  const { meta, userNote } = parseGiftCardNotes(card.notes);
  return {
    id: card.id,
    code: card.code,
    balance: Number(card.balance),
    initialBalance: Number(card.initialBalance),
    status: card.status,
    delivery: meta.delivery,
    recipientEmail: meta.recipientEmail,
    batchId: meta.batchId,
    printed: meta.printed === true,
    label: meta.label,
    userNote,
    updatedAt: card.updatedAt,
  };
}

export async function loadGiftCardProgram(ownerUserId: string): Promise<GiftCardProgramSettings> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  return giftCardProgramFromSettingsCenter(kitchen?.settingsCenterJson);
}

export async function saveGiftCardProgram(
  ownerUserId: string,
  program: GiftCardProgramSettings,
): Promise<GiftCardProgramSettings> {
  const workspaceId = await resolveOwnerWorkspaceId(ownerUserId);
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  const merged = mergeGiftCardProgramIntoSettingsCenter(
    kitchen?.settingsCenterJson,
    program,
  ) as Prisma.InputJsonValue;
  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: { userId: ownerUserId, workspaceId, settingsCenterJson: merged },
    update: { settingsCenterJson: merged },
  });
  return parseGiftCardProgramSettings(program);
}

export async function issueDigitalGiftCard(
  ownerUserId: string,
  input: {
    amount: number;
    recipientEmail?: string;
    notes?: string;
    code?: string;
  },
) {
  const program = await loadGiftCardProgram(ownerUserId);
  if (!program.digitalEnabled) {
    throw new Error("Digital gift cards are disabled for this workspace.");
  }
  const meta: GiftCardMetadata = {
    delivery: "digital",
    recipientEmail: input.recipientEmail?.trim() || undefined,
  };
  return createGiftCard(ownerUserId, {
    amount: input.amount,
    purchaserEmail: input.recipientEmail,
    notes: encodeGiftCardNotes(meta, input.notes),
    code: input.code,
  });
}

export async function issuePhysicalGiftCardBatch(
  ownerUserId: string,
  input: {
    amount: number;
    count: number;
    label?: string;
  },
): Promise<{ batchId: string; cards: EnrichedGiftCard[] }> {
  const program = await loadGiftCardProgram(ownerUserId);
  if (!program.physicalEnabled) {
    throw new Error("Physical gift cards are disabled for this workspace.");
  }
  const count = Math.min(Math.max(1, Math.round(input.count)), 50);
  const batchId = newBatchId();
  const label = input.label?.trim() || `$${input.amount} physical card`;
  const cards: EnrichedGiftCard[] = [];

  for (let i = 0; i < count; i += 1) {
    const meta: GiftCardMetadata = {
      delivery: "physical",
      batchId,
      printed: false,
      label,
    };
    const created = await createGiftCard(ownerUserId, {
      amount: input.amount,
      notes: encodeGiftCardNotes(meta),
      code: generatePhysicalCode(program.physicalCodePrefix),
    });
    cards.push(enrichCard(created));
  }

  return { batchId, cards };
}

export async function markPhysicalGiftCardsPrinted(
  ownerUserId: string,
  batchId: string,
): Promise<number> {
  const cards = await listEnrichedGiftCards(ownerUserId);
  const inBatch = cards.filter((c) => c.batchId === batchId && c.delivery === "physical");
  let updated = 0;
  for (const card of inBatch) {
    if (card.printed) continue;
    const meta: GiftCardMetadata = {
      delivery: "physical",
      batchId: card.batchId,
      printed: true,
      label: card.label,
    };
    await prisma.giftCard.updateMany({
      where: { id: card.id, userId: ownerUserId },
      data: { notes: encodeGiftCardNotes(meta, card.userNote) },
    });
    updated += 1;
  }
  return updated;
}

export async function listEnrichedGiftCards(ownerUserId: string): Promise<EnrichedGiftCard[]> {
  const cards = await listGiftCards(ownerUserId);
  return cards.map(enrichCard);
}

export async function getGiftCardHubSummary(ownerUserId: string): Promise<GiftCardHubSummary> {
  const [program, cards] = await Promise.all([
    loadGiftCardProgram(ownerUserId),
    listEnrichedGiftCards(ownerUserId),
  ]);
  const active = cards.filter(
    (c) => c.status === "ACTIVE" || c.status === "PARTIALLY_REDEEMED",
  );
  const digitalActive = active.filter((c) => c.delivery === "digital").length;
  const physicalActive = active.filter((c) => c.delivery === "physical").length;
  const physicalUnprinted = active.filter(
    (c) => c.delivery === "physical" && !c.printed,
  ).length;
  const outstandingBalance = active.reduce((sum, c) => sum + c.balance, 0);
  const redeemedCount = cards.filter((c) => c.status === "REDEEMED").length;
  return {
    program,
    digitalActive,
    physicalActive,
    physicalUnprinted,
    outstandingBalance,
    redeemedCount,
  };
}

export { lookupGiftCard, redeemGiftCard, DEFAULT_GIFT_CARD_PROGRAM, parseGiftCardNotes };
