import { addDays } from "date-fns";

import type {
  LightspeedImportResult,
  LightspeedLineItemRow,
  LightspeedOrderRow,
} from "@/lib/integrations/lightspeed-types";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { persistResolvedOrder } from "@/services/orders/order-creation-service";

const API_BASE = process.env.LIGHTSPEED_API_BASE ?? "https://api.lsk.lightspeed.app";

export function isLightspeedSyncConfigured(): boolean {
  return Boolean(
    process.env.LIGHTSPEED_ACCESS_TOKEN?.trim() &&
      process.env.LIGHTSPEED_BUSINESS_LOCATION_ID?.trim(),
  );
}

export function getLightspeedConfigError(): string | null {
  if (!process.env.LIGHTSPEED_ACCESS_TOKEN?.trim()) return "Set LIGHTSPEED_ACCESS_TOKEN";
  if (!process.env.LIGHTSPEED_BUSINESS_LOCATION_ID?.trim()) {
    return "Set LIGHTSPEED_BUSINESS_LOCATION_ID";
  }
  return null;
}

export function externalLightspeedNote(orderId: string): string {
  return `lightspeed:order:${orderId}`;
}

export function mapLightspeedOrderState(raw: string | null | undefined): "CONFIRMED" | "COMPLETED" | "CANCELLED" {
  const value = (raw ?? "").trim().toUpperCase();
  if (value.includes("CLOSED") || value.includes("COMPLETED") || value.includes("PAID")) {
    return "COMPLETED";
  }
  if (value.includes("VOID") || value.includes("CANCEL")) return "CANCELLED";
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

function parseLineItems(rawItems: unknown): LightspeedLineItemRow[] {
  const list = Array.isArray(rawItems)
    ? rawItems
    : rawItems && typeof rawItems === "object" && "data" in rawItems
      ? (rawItems as { data?: unknown }).data
      : rawItems && typeof rawItems === "object" && "items" in rawItems
        ? (rawItems as { items?: unknown }).items
        : [];
  if (!Array.isArray(list)) return [];

  const rows: LightspeedLineItemRow[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const product = (row.product ?? row.item ?? {}) as Record<string, unknown>;
    const name =
      readString(row, ["name", "productName", "description"]) ??
      readString(product, ["name", "description"]) ??
      "Lightspeed item";
    const qty = readNumber(row, ["quantity", "qty", "amount"]) || 1;
    rows.push({
      id: readString(row, ["id", "lineId", "uuid"]),
      name,
      quantity: qty > 0 ? qty : 1,
      unitPrice: readNumber(row, ["unitPrice", "price", "amount"]) || null,
      productId: readString(product, ["id", "productId"]) ?? readString(row, ["productId"]),
    });
  }
  return rows;
}

export function parseLightspeedOrderRows(payload: unknown): LightspeedOrderRow[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const sales = Array.isArray(root)
    ? root
    : Array.isArray(root.data)
      ? root.data
      : Array.isArray(root.sales)
        ? root.sales
        : Array.isArray(root.results)
          ? root.results
          : [];

  const rows: LightspeedOrderRow[] = [];
  for (const raw of sales) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const id = readString(row, ["id", "saleId", "uuid", "receiptId"]);
    if (!id) continue;

    const customer = (row.customer ?? row.client ?? {}) as Record<string, unknown>;
    const lineItems = parseLineItems(row.lines ?? row.lineItems ?? row.items ?? row.products);
    const subtotal = readNumber(row, ["subtotal", "netAmount", "amountExTax"]);
    const tax = readNumber(row, ["tax", "taxAmount", "totalTax"]);
    const total = readNumber(row, ["total", "totalAmount", "amount"]);
    const firstLast = [readString(customer, ["firstName"]), readString(customer, ["lastName"])]
      .filter(Boolean)
      .join(" ")
      .trim();

    rows.push({
      id,
      businessLocationId: readString(row, ["businessLocationId", "locationId"]),
      state: readString(row, ["status", "state", "saleStatus"]),
      createdAt: readString(row, ["createdAt", "creationDate", "timeClosed", "timeOpened"]),
      customerName: readString(customer, ["name", "fullName"]) ?? (firstLast || null),
      customerEmail: readString(customer, ["email"]),
      customerPhone: readString(customer, ["phone", "phoneNumber"]),
      lineItems,
      subtotal: subtotal || total,
      tax,
      total: total || subtotal,
      currency: readString(row, ["currency", "currencyCode"]) ?? "USD",
      note: readString(row, ["note", "comment", "memo"]),
    });
  }
  return rows;
}

export function buildLightspeedSalesQuery(start: Date, end: Date) {
  return {
    from: start.toISOString(),
    to: end.toISOString(),
    pageSize: 100,
  };
}

export async function fetchLightspeedOrders(
  start: Date,
  end: Date,
): Promise<{ ok: true; orders: LightspeedOrderRow[] } | { ok: false; message: string }> {
  const configError = getLightspeedConfigError();
  if (configError) return { ok: false, message: configError };

  const token = process.env.LIGHTSPEED_ACCESS_TOKEN!.trim();
  const locationId = process.env.LIGHTSPEED_BUSINESS_LOCATION_ID!.trim();
  const query = buildLightspeedSalesQuery(start, end);
  const params = new URLSearchParams({
    businessLocationId: locationId,
    from: query.from,
    to: query.to,
    pageSize: String(query.pageSize),
  });

  const res = await fetch(`${API_BASE}/v1.0/sales?${params.toString()}`, {
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

  return { ok: true, orders: parseLightspeedOrderRows(json) };
}

export async function importOrdersFromLightspeed(userId: string): Promise<LightspeedImportResult> {
  const configError = getLightspeedConfigError();
  if (configError) {
    return { ok: false, message: configError, fetched: 0, imported: 0 };
  }

  const end = new Date();
  const start = addDays(end, -14);
  const fetched = await fetchLightspeedOrders(start, end);
  if (!fetched.ok) {
    return { ok: false, message: fetched.message, fetched: 0, imported: 0 };
  }

  const workspaceId = await resolveOwnerWorkspaceId(userId);
  let imported = 0;
  let skippedExisting = 0;

  for (const row of fetched.orders) {
    const tag = externalLightspeedNote(row.id);
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

    const subtotal = row.subtotal || row.total;
    const tax = row.tax;
    const total = row.total || subtotal;
    const statusKey = mapLightspeedOrderState(row.state);

    await persistResolvedOrder(
      { userId, workspaceId },
      {
        orderType: "SALES_CHANNEL_ORDER",
        creationSource: "CHANNEL_IMPORT",
        statusKey,
        paymentMode: "PAID_EXTERNALLY",
        customerName: row.customerName ?? "Lightspeed guest",
        customerEmail: row.customerEmail ?? `lightspeed-import@${userId.slice(0, 8)}.local`,
        customerPhone: row.customerPhone,
        fulfillmentDetail: "PICKUP",
        notes: [row.note, tag].filter(Boolean).join(" · ") || tag,
        subtotal,
        taxAmount: tax,
        feesAmount: 0,
        total,
        channelProvider: "LIGHTSPEED",
        externalOrderId: row.id,
        sourceMetadataJson: {
          provider: "lightspeed",
          businessLocationId: row.businessLocationId,
          currency: row.currency,
          lineItems: row.lineItems,
        },
        lines: row.lineItems.map((li) => {
          const unitPrice =
            li.unitPrice != null ? li.unitPrice : subtotal / Math.max(row.lineItems.length, 1);
          return {
            productId: null,
            title: li.name,
            sku: li.productId ?? undefined,
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
    message: `Imported ${imported} Lightspeed orders (${skippedExisting} already synced, ${fetched.orders.length} fetched).`,
  };
}
