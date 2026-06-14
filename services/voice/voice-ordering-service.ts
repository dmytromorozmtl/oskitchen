import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";

import {
  buildVoiceOrderSourceMetadata,
  type VoiceOrderChannel,
} from "@/lib/voice/voice-order-meta";
import {
  mergeVoiceIntoSettingsCenter,
  voiceSettingsFromSettingsCenter,
  type VoiceIntegrationSettings,
} from "@/lib/voice/voice-settings";
import { prisma } from "@/lib/prisma";
import { productListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { restaurantTableListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { createOrderViaCenter } from "@/services/orders/order-creation-service";

export type VoiceOrderLine = {
  productId: string;
  title: string;
  quantity: number;
  modifiers?: string;
};

export type ParsedVoiceOrder = {
  tableLabel: string;
  tableRouteId: string;
  lines: VoiceOrderLine[];
  confidence: number;
  raw: string;
};

export type ProcessVoiceOrderInput = {
  ownerUserId: string;
  channel: VoiceOrderChannel;
  utterance?: string;
  slots?: {
    table?: string;
    item?: string;
    quantity?: number | string;
    modifiers?: string;
  };
};

export type ProcessVoiceOrderResult =
  | {
      ok: true;
      orderId: string;
      speech: string;
      parsed: ParsedVoiceOrder;
    }
  | { ok: false; error: string; speech: string };

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

function normalizeUtterance(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseQuantity(token: string): number {
  const n = Number(token);
  if (Number.isFinite(n) && n > 0) return Math.min(99, Math.floor(n));
  return NUMBER_WORDS[token] ?? 1;
}

export function parseVoiceUtterance(utterance: string): Omit<ParsedVoiceOrder, "lines"> & {
  itemPhrase: string;
  quantity: number;
  modifiers?: string;
} {
  const raw = utterance.trim();
  const text = normalizeUtterance(raw);

  let tableRouteId = "1";
  const tableMatch =
    text.match(/(?:table|tab)\s*#?\s*([a-z0-9-]+)/i) ??
    text.match(/\bfor\s+table\s*#?\s*([a-z0-9-]+)/i);
  if (tableMatch?.[1]) tableRouteId = tableMatch[1];

  let quantity = 1;
  const qtyMatch = text.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/);
  if (qtyMatch?.[1]) quantity = parseQuantity(qtyMatch[1]);

  let itemPhrase = text
    .replace(/^(?:alexa[, ]*)?(?:ask\s+)?os\s+kitchen[, ]*/i, "")
    .replace(/^(?:ok\s+google[, ]*|hey\s+google[, ]*)/i, "")
    .replace(/(?:please\s+)?(?:add|order|get|put)\s+/i, "")
    .replace(/(?:to|for)\s+table\s*#?\s*[a-z0-9-]+/gi, "")
    .replace(/table\s*#?\s*[a-z0-9-]+/gi, "")
    .replace(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/gi, "")
    .replace(/\bwith\b.+$/i, "")
    .trim();

  const modMatch = text.match(/\bwith\s+(.+)$/i);
  const modifiers = modMatch?.[1]?.trim();

  const tableLabel = /^\d+$/.test(tableRouteId) ? `Table ${tableRouteId}` : tableRouteId;

  const confidence =
    itemPhrase.length >= 2 && tableRouteId ? (modifiers ? 88 : 82) : itemPhrase ? 62 : 40;

  return {
    raw,
    tableLabel,
    tableRouteId,
    itemPhrase,
    quantity,
    modifiers,
    confidence,
  };
}

export async function matchProductsForVoicePhrase(
  ownerUserId: string,
  itemPhrase: string,
  limit = 5,
): Promise<Array<{ id: string; title: string; price: number }>> {
  const phrase = itemPhrase.trim().toLowerCase();
  if (!phrase) return [];

  const products = await prisma.product.findMany({
    where: await productListWhereForOwner(ownerUserId),
    select: { id: true, title: true, price: true, active: true },
    take: 200,
  });

  const scored = products
    .filter((p) => p.active)
    .map((p) => {
      const title = p.title.toLowerCase();
      let score = 0;
      if (title === phrase) score = 100;
      else if (title.includes(phrase)) score = 80;
      else {
        const tokens = phrase.split(/\s+/).filter(Boolean);
        const hits = tokens.filter((t) => title.includes(t)).length;
        score = hits * 15;
      }
      return { id: p.id, title: p.title, price: Number(p.price), score };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ id, title, price }) => ({ id, title, price }));
}

export async function resolveVoiceOrderLines(
  ownerUserId: string,
  itemPhrase: string,
  quantity: number,
  modifiers?: string,
): Promise<VoiceOrderLine[]> {
  const matches = await matchProductsForVoicePhrase(ownerUserId, itemPhrase, 3);
  if (matches.length === 0) return [];
  const best = matches[0]!;
  return [
    {
      productId: best.id,
      title: best.title,
      quantity: Math.max(1, quantity),
      modifiers,
    },
  ];
}

export async function loadVoiceSettings(ownerUserId: string): Promise<VoiceIntegrationSettings> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  return voiceSettingsFromSettingsCenter(kitchen?.settingsCenterJson);
}

export async function saveVoiceSettings(
  ownerUserId: string,
  patch: Partial<VoiceIntegrationSettings>,
): Promise<VoiceIntegrationSettings> {
  const current = await loadVoiceSettings(ownerUserId);
  const next: VoiceIntegrationSettings = {
    ...current,
    ...patch,
    webhookSecret: patch.webhookSecret ?? current.webhookSecret,
  };
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  const merged = mergeVoiceIntoSettingsCenter(kitchen?.settingsCenterJson, next);
  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: {
      userId: ownerUserId,
      settingsCenterJson: merged as Prisma.InputJsonValue,
    },
    update: { settingsCenterJson: merged as Prisma.InputJsonValue },
  });
  return next;
}

export async function verifyVoiceWebhookSecret(
  ownerUserId: string,
  provided: string | null,
): Promise<boolean> {
  if (!provided?.trim()) return false;
  const settings = await loadVoiceSettings(ownerUserId);
  return settings.enabled && provided === settings.webhookSecret;
}

function formatTableLabel(tableRouteId: string, tableName?: string | null): string {
  if (tableName?.trim()) return tableName.trim();
  const decoded = decodeURIComponent(tableRouteId).trim();
  return decoded.match(/^\d+$/) ? `Table ${decoded}` : decoded;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveRestaurantTable(
  ownerUserId: string,
  tableRouteId: string,
): Promise<{ id: string; name: string } | null> {
  const scope = await restaurantTableListWhereForOwner(ownerUserId);
  const decoded = decodeURIComponent(tableRouteId).trim();
  if (UUID_RE.test(decoded)) {
    const row = await prisma.restaurantTable.findFirst({
      where: { AND: [scope, { id: decoded }] },
      select: { id: true, name: true },
    });
    if (row) return row;
  }
  const byName = await prisma.restaurantTable.findFirst({
    where: { AND: [scope, { name: decoded }] },
    select: { id: true, name: true },
  });
  if (byName) return byName;
  return prisma.restaurantTable.findFirst({
    where: {
      AND: [scope, { name: { equals: decoded, mode: "insensitive" } }],
    },
    select: { id: true, name: true },
  });
}

export async function parseVoiceOrder(
  ownerUserId: string,
  input: { utterance?: string; slots?: ProcessVoiceOrderInput["slots"] },
): Promise<ParsedVoiceOrder | { error: string }> {
  let tableRouteId = "1";
  let tableLabel = "Table 1";
  let itemPhrase = "";
  let quantity = 1;
  let modifiers: string | undefined;
  let confidence = 70;
  let raw = "";

  if (input.slots?.table) {
    tableRouteId = String(input.slots.table).trim();
    tableLabel = formatTableLabel(tableRouteId);
    itemPhrase = String(input.slots.item ?? "").trim();
    quantity =
      typeof input.slots.quantity === "number"
        ? input.slots.quantity
        : parseQuantity(String(input.slots.quantity ?? "1"));
    modifiers = input.slots.modifiers?.trim() || undefined;
    raw = `slots:table=${tableRouteId},item=${itemPhrase},qty=${quantity}`;
    confidence = 92;
  } else if (input.utterance?.trim()) {
    const parsed = parseVoiceUtterance(input.utterance);
    tableRouteId = parsed.tableRouteId;
    tableLabel = parsed.tableLabel;
    itemPhrase = parsed.itemPhrase;
    quantity = parsed.quantity;
    modifiers = parsed.modifiers;
    confidence = parsed.confidence;
    raw = parsed.raw;
  } else {
    return { error: "Provide an utterance or structured slots." };
  }

  if (!itemPhrase) return { error: "Could not detect a menu item in the voice command." };

  const lines = await resolveVoiceOrderLines(ownerUserId, itemPhrase, quantity, modifiers);
  if (lines.length === 0) {
    return { error: `No menu item matched "${itemPhrase}".` };
  }

  return { tableLabel, tableRouteId, lines, confidence, raw };
}

export async function processVoiceOrder(
  input: ProcessVoiceOrderInput,
): Promise<ProcessVoiceOrderResult> {
  const settings = await loadVoiceSettings(input.ownerUserId);
  if (!settings.enabled) {
    return {
      ok: false,
      error: "Voice ordering is disabled.",
      speech: "Voice ordering is not enabled for this restaurant.",
    };
  }
  if (input.channel === "alexa" && !settings.alexaEnabled) {
    return { ok: false, error: "Alexa disabled.", speech: "Alexa is not connected." };
  }
  if (input.channel === "google_home" && !settings.googleEnabled) {
    return {
      ok: false,
      error: "Google Home disabled.",
      speech: "Google Home is not connected.",
    };
  }

  const parsed = await parseVoiceOrder(input.ownerUserId, {
    utterance: input.utterance,
    slots: input.slots,
  });
  if ("error" in parsed) {
    return { ok: false, error: parsed.error, speech: parsed.error };
  }

  const table = await resolveRestaurantTable(input.ownerUserId, parsed.tableRouteId);
  const tableLabel = formatTableLabel(parsed.tableRouteId, table?.name);

  const lineSummary = parsed.lines
    .map((l) => `${l.quantity}× ${l.title}${l.modifiers ? ` (${l.modifiers})` : ""}`)
    .join(", ");

  const metadata = buildVoiceOrderSourceMetadata({
    channel: input.channel,
    utterance: input.utterance ?? parsed.raw,
    tableLabel,
    confidence: parsed.confidence,
    parsedSummary: lineSummary,
  });

  const guestToken = randomUUID().slice(0, 8);
  const created = await createOrderViaCenter(
    { userId: input.ownerUserId },
    {
      orderType: "RESTAURANT_ORDER",
      statusKey: "IN_PRODUCTION",
      fulfillmentDetail: "DINE_IN",
      paymentMode: "PAY_LATER",
      customerName: `Voice · ${tableLabel}`,
      customerEmail: `voice-guest-${guestToken}@table.local`,
      channelProvider: "voice",
      creationSourceOverride: "voice_assistant",
      sourceMetadataJson: JSON.stringify(metadata),
      notes: `Voice order (AI-assisted parse, ${parsed.confidence}% confidence): ${lineSummary}`,
      kitchenNotes: parsed.lines
        .map((l) => (l.modifiers ? `${l.title}: ${l.modifiers}` : null))
        .filter(Boolean)
        .join("; "),
      lines: parsed.lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
      })),
    },
  );

  if (!created.ok) {
    return {
      ok: false,
      error: created.error,
      speech: "Sorry, I could not send that order to the kitchen.",
    };
  }

  if (table?.id) {
    await prisma.order.update({
      where: { id: created.orderId },
      data: { tableId: table.id },
    });
  }

  const speech = `Got it. ${lineSummary} for ${tableLabel}. The kitchen received your order.`;

  return {
    ok: true,
    orderId: created.orderId,
    speech,
    parsed: { ...parsed, tableLabel },
  };
}

export async function listRecentVoiceOrders(ownerUserId: string, limit = 20) {
  const orders = await prisma.order.findMany({
    where: {
      userId: ownerUserId,
      creationSource: "voice_assistant",
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      customerName: true,
      tableId: true,
      status: true,
      createdAt: true,
      sourceMetadataJson: true,
    },
  });
  return orders;
}
