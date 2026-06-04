import { addDays } from "date-fns";

import type { ToastImportResult, ToastLineItemRow, ToastOrderRow } from "@/lib/integrations/toast-types";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { persistResolvedOrder } from "@/services/orders/order-creation-service";

const API_BASE = process.env.TOAST_API_BASE ?? "https://ws-api.toasttab.com";

export function isToastSyncConfigured(): boolean {
  return Boolean(
    process.env.TOAST_ACCESS_TOKEN?.trim() && process.env.TOAST_RESTAURANT_GUID?.trim(),
  );
}

export function getToastConfigError(): string | null {
  if (!process.env.TOAST_ACCESS_TOKEN?.trim()) return "Set TOAST_ACCESS_TOKEN";
  if (!process.env.TOAST_RESTAURANT_GUID?.trim()) return "Set TOAST_RESTAURANT_GUID";
  return null;
}

export function externalToastNote(orderId: string): string {
  return `toast:order:${orderId}`;
}

export function mapToastOrderState(raw: string | null | undefined): "CONFIRMED" | "COMPLETED" | "CANCELLED" {
  const value = (raw ?? "").trim().toUpperCase();
  if (value.includes("CLOSED") || value.includes("COMPLETED")) return "COMPLETED";
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

function readMoney(row: Record<string, unknown> | null | undefined): number {
  if (!row || typeof row !== "object") return 0;
  return readNumber(row, ["amount", "value", "total"]);
}

function parseSelections(rawSelections: unknown): ToastLineItemRow[] {
  if (!Array.isArray(rawSelections)) return [];
  const rows: ToastLineItemRow[] = [];
  for (const raw of rawSelections) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const item = (row.item ?? row.menuItem ?? row) as Record<string, unknown>;
    const name =
      readString(item, ["name", "displayName", "itemName"]) ??
      readString(row, ["displayName", "name"]) ??
      "Toast item";
    const qty = readNumber(row, ["quantity", "qty"]) || 1;
    rows.push({
      guid: readString(row, ["guid", "selectionGuid", "id"]),
      name,
      quantity: qty > 0 ? qty : 1,
      unitPrice: readMoney(row.price as Record<string, unknown> | undefined) || null,
      itemGuid: readString(item, ["guid", "itemGuid", "id"]),
    });
  }
  return rows;
}

function parseChecks(rawChecks: unknown): {
  lineItems: ToastLineItemRow[];
  subtotal: number;
  tax: number;
  total: number;
} {
  if (!Array.isArray(rawChecks) || rawChecks.length === 0) {
    return { lineItems: [], subtotal: 0, tax: 0, total: 0 };
  }

  const lineItems: ToastLineItemRow[] = [];
  let subtotal = 0;
  let tax = 0;
  let total = 0;

  for (const raw of rawChecks) {
    if (!raw || typeof raw !== "object") continue;
    const check = raw as Record<string, unknown>;
    lineItems.push(...parseSelections(check.selections ?? check.lineItems));
    subtotal += readMoney(check.amount as Record<string, unknown> | undefined);
    tax += readMoney(check.taxAmount as Record<string, unknown> | undefined);
    total += readMoney(check.totalAmount as Record<string, unknown> | undefined);
  }

  return { lineItems, subtotal, tax, total };
}

export function parseToastOrderRows(payload: unknown): ToastOrderRow[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const orders = Array.isArray(root)
    ? root
    : Array.isArray(root.orders)
      ? root.orders
      : Array.isArray(root.data)
        ? root.data
        : [];

  const rows: ToastOrderRow[] = [];
  for (const raw of orders) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const id = readString(row, ["guid", "orderGuid", "id"]);
    if (!id) continue;

    const checks = parseChecks(row.checks);
    const customer = (row.customer ?? row.deliveryInfo ?? {}) as Record<string, unknown>;
    const firstLast = [readString(customer, ["firstName"]), readString(customer, ["lastName"])]
      .filter(Boolean)
      .join(" ")
      .trim();

    rows.push({
      id,
      displayNumber: readString(row, ["displayNumber", "orderNumber", "number"]),
      businessDate: readString(row, ["businessDate", "openedDate"]),
      openedAt: readString(row, ["openedDate", "createdDate", "createdAt"]),
      state: readString(row, ["voided", "deleted"]) === "true" ? "VOIDED" : readString(row, ["status", "state"]),
      customerName: readString(customer, ["firstName", "name"]) ?? (firstLast || null),
      customerEmail: readString(customer, ["email"]),
      customerPhone: readString(customer, ["phone", "phoneNumber"]),
      lineItems: checks.lineItems,
      subtotal: checks.subtotal || readMoney(row.totalAmount as Record<string, unknown> | undefined),
      tax: checks.tax,
      total: checks.total || readMoney(row.totalAmount as Record<string, unknown> | undefined),
      currency: readString(row, ["currency", "currencyCode"]) ?? "USD",
      note: readString(row, ["note", "memo"]),
    });
  }
  return rows;
}

export function buildToastOrdersQuery(start: Date, end: Date) {
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    pageSize: 100,
  };
}

export async function fetchToastOrders(
  start: Date,
  end: Date,
): Promise<{ ok: true; orders: ToastOrderRow[] } | { ok: false; message: string }> {
  const configError = getToastConfigError();
  if (configError) return { ok: false, message: configError };

  const token = process.env.TOAST_ACCESS_TOKEN!.trim();
  const restaurantGuid = process.env.TOAST_RESTAURANT_GUID!.trim();
  const query = buildToastOrdersQuery(start, end);
  const params = new URLSearchParams({
    startDate: query.startDate,
    endDate: query.endDate,
    pageSize: String(query.pageSize),
  });

  const res = await fetch(`${API_BASE}/orders/v2/orders?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Toast-Restaurant-External-ID": restaurantGuid,
      "Content-Type": "application/json",
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

  return { ok: true, orders: parseToastOrderRows(json) };
}

export async function importOrdersFromToast(userId: string): Promise<ToastImportResult> {
  const configError = getToastConfigError();
  if (configError) {
    return { ok: false, message: configError, fetched: 0, imported: 0 };
  }

  const end = new Date();
  const start = addDays(end, -14);
  const fetched = await fetchToastOrders(start, end);
  if (!fetched.ok) {
    return { ok: false, message: fetched.message, fetched: 0, imported: 0 };
  }

  const workspaceId = await resolveOwnerWorkspaceId(userId);
  let imported = 0;
  let skippedExisting = 0;

  for (const row of fetched.orders) {
    const tag = externalToastNote(row.id);
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
    const statusKey = mapToastOrderState(row.state);

    await persistResolvedOrder(
      { userId, workspaceId },
      {
        orderType: "SALES_CHANNEL_ORDER",
        creationSource: "CHANNEL_IMPORT",
        statusKey,
        paymentMode: "PAID_EXTERNALLY",
        customerName: row.customerName ?? "Toast guest",
        customerEmail: row.customerEmail ?? `toast-import@${userId.slice(0, 8)}.local`,
        customerPhone: row.customerPhone,
        fulfillmentDetail: "PICKUP",
        notes: [row.note, tag].filter(Boolean).join(" · ") || tag,
        subtotal,
        taxAmount: tax,
        feesAmount: 0,
        total,
        channelProvider: "TOAST",
        externalOrderId: row.id,
        sourceMetadataJson: {
          provider: "toast",
          displayNumber: row.displayNumber,
          businessDate: row.businessDate,
          currency: row.currency,
          lineItems: row.lineItems,
        },
        lines: row.lineItems.map((li) => {
          const unitPrice =
            li.unitPrice != null ? li.unitPrice : subtotal / Math.max(row.lineItems.length, 1);
          return {
            productId: null,
            title: li.name,
            sku: li.itemGuid ?? undefined,
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
    message: `Imported ${imported} Toast orders (${skippedExisting} already synced, ${fetched.orders.length} fetched).`,
  };
}
