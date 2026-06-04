import { addDays } from "date-fns";

import type { CloverImportResult, CloverLineItemRow, CloverOrderRow } from "@/lib/integrations/clover-types";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { persistResolvedOrder } from "@/services/orders/order-creation-service";

const API_BASE = process.env.CLOVER_API_BASE ?? "https://api.clover.com";

export function isCloverSyncConfigured(): boolean {
  return Boolean(
    process.env.CLOVER_ACCESS_TOKEN?.trim() && process.env.CLOVER_MERCHANT_ID?.trim(),
  );
}

export function getCloverConfigError(): string | null {
  if (!process.env.CLOVER_ACCESS_TOKEN?.trim()) return "Set CLOVER_ACCESS_TOKEN";
  if (!process.env.CLOVER_MERCHANT_ID?.trim()) return "Set CLOVER_MERCHANT_ID";
  return null;
}

export function externalCloverNote(orderId: string): string {
  return `clover:order:${orderId}`;
}

export function moneyCentsToDecimal(cents: number | null | undefined): number {
  if (cents == null || !Number.isFinite(cents)) return 0;
  return Math.round(cents) / 100;
}

export function mapCloverOrderState(raw: string | null | undefined): "CONFIRMED" | "COMPLETED" | "CANCELLED" {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "paid" || value === "locked") return "COMPLETED";
  if (value === "voided" || value === "cancelled" || value === "canceled") return "CANCELLED";
  return "CONFIRMED";
}

function readString(row: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function readNumber(row: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
  }
  return 0;
}

function parseLineItems(rawLineItems: unknown): CloverLineItemRow[] {
  const elements =
    rawLineItems && typeof rawLineItems === "object" && "elements" in rawLineItems
      ? (rawLineItems as { elements?: unknown }).elements
      : rawLineItems;
  if (!Array.isArray(elements)) return [];

  const rows: CloverLineItemRow[] = [];
  for (const raw of elements) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const name = readString(row, ["name", "note"]) ?? "Clover item";
    const qty = readNumber(row, ["unitQty", "quantity"]) || 1;
    rows.push({
      id: readString(row, ["id"]),
      name,
      quantity: qty > 0 ? qty : 1,
      unitPriceCents: readNumber(row, ["price", "unitPrice"]) || null,
      itemId: readString(row, ["item", "itemId"]) ?? readString((row.item as Record<string, unknown> | undefined) ?? {}, ["id"]),
    });
  }
  return rows;
}

export function parseCloverOrderRows(payload: unknown): CloverOrderRow[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const orders =
    "elements" in root && Array.isArray(root.elements)
      ? root.elements
      : Array.isArray(root.orders)
        ? root.orders
        : Array.isArray(root.data)
          ? root.data
          : Array.isArray(payload)
            ? payload
            : [];

  const rows: CloverOrderRow[] = [];
  for (const raw of orders) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const id = readString(row, ["id", "uuid"]);
    if (!id) continue;

    const createdMs = readNumber(row, ["createdTime", "modifiedTime"]);
    const createdAt = createdMs > 0 ? new Date(createdMs).toISOString() : null;

    rows.push({
      id,
      merchantId: readString(row, ["merchant", "merchantId"]) ?? readString((row.merchant as Record<string, unknown> | undefined) ?? {}, ["id"]),
      state: readString(row, ["state", "paymentState"]),
      createdAt,
      customerName: null,
      customerEmail: null,
      customerPhone: null,
      lineItems: parseLineItems(row.lineItems),
      subtotalCents: readNumber(row, ["subtotal", "total"]),
      taxCents: readNumber(row, ["taxAmount", "tax"]),
      totalCents: readNumber(row, ["total"]),
      currency: readString(row, ["currency"]) ?? "USD",
      note: readString(row, ["note", "title"]),
    });
  }
  return rows;
}

export function buildCloverOrdersFilter(start: Date): string {
  return `createdTime>=${start.getTime()}`;
}

export async function fetchCloverOrders(
  start: Date,
): Promise<{ ok: true; orders: CloverOrderRow[] } | { ok: false; message: string }> {
  const configError = getCloverConfigError();
  if (configError) return { ok: false, message: configError };

  const token = process.env.CLOVER_ACCESS_TOKEN!.trim();
  const merchantId = process.env.CLOVER_MERCHANT_ID!.trim();
  const filter = buildCloverOrdersFilter(start);
  const params = new URLSearchParams({
    filter,
    expand: "lineItems",
    limit: "100",
  });

  const res = await fetch(`${API_BASE}/v3/merchants/${merchantId}/orders?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    const detail =
      json && typeof json === "object" && "message" in json
        ? String((json as { message?: string }).message)
        : `HTTP ${res.status}`;
    return { ok: false, message: detail };
  }

  return { ok: true, orders: parseCloverOrderRows(json) };
}

export async function importOrdersFromClover(userId: string): Promise<CloverImportResult> {
  const configError = getCloverConfigError();
  if (configError) {
    return { ok: false, message: configError, fetched: 0, imported: 0 };
  }

  const start = addDays(new Date(), -14);
  const fetched = await fetchCloverOrders(start);
  if (!fetched.ok) {
    return { ok: false, message: fetched.message, fetched: 0, imported: 0 };
  }

  const workspaceId = await resolveOwnerWorkspaceId(userId);
  let imported = 0;
  let skippedExisting = 0;

  for (const row of fetched.orders) {
    const tag = externalCloverNote(row.id);
    const existing = await prisma.order.findFirst({
      where: {
        userId,
        notes: { contains: tag },
      },
      select: { id: true },
    });
    if (existing) {
      skippedExisting++;
      continue;
    }

    const subtotal = moneyCentsToDecimal(row.subtotalCents || row.totalCents);
    const tax = moneyCentsToDecimal(row.taxCents);
    const total = moneyCentsToDecimal(row.totalCents);
    const statusKey = mapCloverOrderState(row.state);

    await persistResolvedOrder(
      { userId, workspaceId },
      {
        orderType: "SALES_CHANNEL_ORDER",
        creationSource: "CHANNEL_IMPORT",
        statusKey,
        paymentMode: "PAID_EXTERNALLY",
        customerName: row.customerName ?? "Clover guest",
        customerEmail: row.customerEmail ?? `clover-import@${userId.slice(0, 8)}.local`,
        customerPhone: row.customerPhone,
        fulfillmentDetail: "PICKUP",
        notes: [row.note, tag].filter(Boolean).join(" · ") || tag,
        subtotal,
        taxAmount: tax,
        feesAmount: 0,
        total,
        channelProvider: "CLOVER",
        externalOrderId: row.id,
        sourceMetadataJson: {
          provider: "clover",
          merchantId: row.merchantId,
          currency: row.currency,
          lineItems: row.lineItems,
        },
        lines: row.lineItems.map((li) => {
          const unitPrice =
            li.unitPriceCents != null
              ? moneyCentsToDecimal(li.unitPriceCents)
              : subtotal / Math.max(row.lineItems.length, 1);
          return {
            productId: null,
            title: li.name,
            sku: li.itemId ?? undefined,
            quantity: li.quantity,
            unitPrice,
            lineTotal: unitPrice * li.quantity,
            notes: undefined,
            preparedDate: null,
            modifiersJson: null,
            sourceMappingId: null,
          };
        }),
      },
    );
    imported++;
  }

  return {
    ok: true,
    fetched: fetched.orders.length,
    imported,
    skippedExisting,
    message: `Imported ${imported} Clover orders (${skippedExisting} already synced, ${fetched.orders.length} fetched).`,
  };
}
