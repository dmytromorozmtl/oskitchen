import { addDays } from "date-fns";

import type { SquareImportResult, SquareLineItemRow, SquareOrderRow } from "@/lib/integrations/square-types";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { persistResolvedOrder } from "@/services/orders/order-creation-service";

const API_BASE = process.env.SQUARE_API_BASE ?? "https://connect.squareup.com";
const SQUARE_VERSION = process.env.SQUARE_API_VERSION ?? "2024-01-18";

export function isSquareSyncConfigured(): boolean {
  return Boolean(
    process.env.SQUARE_ACCESS_TOKEN?.trim() && process.env.SQUARE_LOCATION_ID?.trim(),
  );
}

export function getSquareConfigError(): string | null {
  if (!process.env.SQUARE_ACCESS_TOKEN?.trim()) return "Set SQUARE_ACCESS_TOKEN";
  if (!process.env.SQUARE_LOCATION_ID?.trim()) return "Set SQUARE_LOCATION_ID";
  return null;
}

export function externalSquareNote(orderId: string): string {
  return `square:order:${orderId}`;
}

export function moneyCentsToDecimal(cents: number | null | undefined): number {
  if (cents == null || !Number.isFinite(cents)) return 0;
  return Math.round(cents) / 100;
}

export function mapSquareOrderState(raw: string | null | undefined): "CONFIRMED" | "COMPLETED" | "CANCELLED" {
  const value = (raw ?? "").trim().toUpperCase();
  if (value === "COMPLETED") return "COMPLETED";
  if (value === "CANCELED" || value === "CANCELLED") return "CANCELLED";
  return "CONFIRMED";
}

function readString(row: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function readMoneyCents(row: Record<string, unknown> | null | undefined): number {
  if (!row || typeof row !== "object") return 0;
  const amount = row.amount;
  if (typeof amount === "number" && Number.isFinite(amount)) return amount;
  if (typeof amount === "bigint") return Number(amount);
  if (typeof amount === "string" && amount.trim()) {
    const n = Number(amount);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function parseLineItems(rawItems: unknown): SquareLineItemRow[] {
  if (!Array.isArray(rawItems)) return [];
  const rows: SquareLineItemRow[] = [];
  for (const raw of rawItems) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const name = readString(row, ["name", "variation_name", "note"]) ?? "Square item";
    const quantity = row.quantity;
    const qty =
      typeof quantity === "string" && quantity.trim()
        ? Number(quantity)
        : typeof quantity === "number"
          ? quantity
          : 1;
    rows.push({
      uid: readString(row, ["uid", "catalog_object_id"]),
      name,
      quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
      unitPriceCents: readMoneyCents(row.base_price_money as Record<string, unknown> | undefined) || null,
      catalogObjectId: readString(row, ["catalog_object_id", "variation_id"]),
    });
  }
  return rows;
}

export function parseSquareOrderRows(payload: unknown): SquareOrderRow[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const orders = Array.isArray(root.orders)
    ? root.orders
    : Array.isArray(root.data)
      ? root.data
      : [];

  const rows: SquareOrderRow[] = [];
  for (const raw of orders) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const id = readString(row, ["id"]);
    if (!id) continue;

    const totalMoney = row.total_money as Record<string, unknown> | undefined;
    const taxMoney = row.total_tax_money as Record<string, unknown> | undefined;
    const subtotalMoney = row.total_service_charge_money as Record<string, unknown> | undefined;

    rows.push({
      id,
      locationId: readString(row, ["location_id"]),
      state: readString(row, ["state"]),
      createdAt: readString(row, ["created_at", "updated_at"]),
      customerName: null,
      customerEmail: null,
      customerPhone: null,
      lineItems: parseLineItems(row.line_items),
      subtotalCents: readMoneyCents(subtotalMoney) || readMoneyCents(totalMoney),
      taxCents: readMoneyCents(taxMoney),
      totalCents: readMoneyCents(totalMoney),
      currency: readString(totalMoney ?? {}, ["currency"]) ?? "USD",
      note: readString(row, ["note"]),
    });
  }
  return rows;
}

export function buildSquareOrderSearchBody(locationId: string, startAt: Date, endAt: Date) {
  return {
    location_ids: [locationId],
    query: {
      filter: {
        date_time_filter: {
          created_at: {
            start_at: startAt.toISOString(),
            end_at: endAt.toISOString(),
          },
        },
        state_filter: {
          states: ["OPEN", "COMPLETED"],
        },
      },
      sort: {
        sort_field: "CREATED_AT",
        sort_order: "DESC",
      },
    },
    limit: 100,
  };
}

export async function fetchSquareOrders(
  start: Date,
  end: Date,
): Promise<{ ok: true; orders: SquareOrderRow[] } | { ok: false; message: string }> {
  const configError = getSquareConfigError();
  if (configError) return { ok: false, message: configError };

  const token = process.env.SQUARE_ACCESS_TOKEN!.trim();
  const locationId = process.env.SQUARE_LOCATION_ID!.trim();
  const body = buildSquareOrderSearchBody(locationId, start, end);

  const res = await fetch(`${API_BASE}/v2/orders/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Square-Version": SQUARE_VERSION,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const errors = json.errors;
    const detail =
      Array.isArray(errors) && errors.length
        ? errors.map((e) => (e as { detail?: string }).detail ?? "Square API error").join("; ")
        : `HTTP ${res.status}`;
    return { ok: false, message: detail };
  }

  return { ok: true, orders: parseSquareOrderRows(json) };
}

export async function importOrdersFromSquare(userId: string): Promise<SquareImportResult> {
  const configError = getSquareConfigError();
  if (configError) {
    return { ok: false, message: configError, fetched: 0, imported: 0 };
  }

  const end = new Date();
  const start = addDays(end, -14);
  const fetched = await fetchSquareOrders(start, end);
  if (!fetched.ok) {
    return { ok: false, message: fetched.message, fetched: 0, imported: 0 };
  }

  const workspaceId = await resolveOwnerWorkspaceId(userId);
  let imported = 0;
  let skippedExisting = 0;

  for (const row of fetched.orders) {
    const tag = externalSquareNote(row.id);
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
    const statusKey = mapSquareOrderState(row.state);

    await persistResolvedOrder(
      { userId, workspaceId },
      {
        orderType: "SALES_CHANNEL_ORDER",
        creationSource: "CHANNEL_IMPORT",
        statusKey,
        paymentMode: "PAID",
        customerName: row.customerName ?? "Square guest",
        customerEmail: row.customerEmail ?? `square-import@${userId.slice(0, 8)}.local`,
        customerPhone: row.customerPhone,
        fulfillmentDetail: "PICKUP",
        notes: [row.note, tag].filter(Boolean).join(" · ") || tag,
        subtotal,
        taxAmount: tax,
        feesAmount: 0,
        total,
        channelProvider: "SQUARE",
        externalOrderId: row.id,
        sourceMetadataJson: {
          provider: "square",
          locationId: row.locationId,
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
            sku: li.catalogObjectId ?? undefined,
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
    message: `Imported ${imported} Square orders (${skippedExisting} already synced, ${fetched.orders.length} fetched).`,
  };
}
