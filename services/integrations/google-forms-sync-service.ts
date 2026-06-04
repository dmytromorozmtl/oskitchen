import type {
  GoogleFormsImportResult,
  GoogleFormsSubmissionRow,
} from "@/lib/integrations/google-forms-types";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { persistResolvedOrder } from "@/services/orders/order-creation-service";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

export function isGoogleFormsSyncConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_FORMS_SHEET_ACCESS_TOKEN?.trim() &&
      process.env.GOOGLE_FORMS_SHEET_ID?.trim(),
  );
}

export function getGoogleFormsConfigError(): string | null {
  if (!process.env.GOOGLE_FORMS_SHEET_ACCESS_TOKEN?.trim()) {
    return "Set GOOGLE_FORMS_SHEET_ACCESS_TOKEN";
  }
  if (!process.env.GOOGLE_FORMS_SHEET_ID?.trim()) return "Set GOOGLE_FORMS_SHEET_ID";
  return null;
}

export function externalGoogleFormsNote(rowNumber: number): string {
  return `google-forms:row:${rowNumber}`;
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function cell(row: string[], index: number): string | null {
  const value = row[index];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function findColumnIndex(headers: string[], candidates: string[]): number {
  const normalized = headers.map(normalizeHeader);
  for (const candidate of candidates) {
    const idx = normalized.indexOf(normalizeHeader(candidate));
    if (idx >= 0) return idx;
  }
  return -1;
}

export function parseGoogleFormsSheetValues(values: unknown): GoogleFormsSubmissionRow[] {
  if (!Array.isArray(values) || values.length < 2) return [];
  const headerRow = values[0];
  if (!Array.isArray(headerRow)) return [];

  const headers = headerRow.map((h) => String(h ?? ""));
  const tsIdx = findColumnIndex(headers, ["timestamp", "submitted_at", "date", "time"]);
  const nameIdx = findColumnIndex(headers, ["name", "customer_name", "full_name", "your_name"]);
  const emailIdx = findColumnIndex(headers, ["email", "email_address", "your_email"]);
  const phoneIdx = findColumnIndex(headers, ["phone", "phone_number", "mobile"]);
  const itemIdx = findColumnIndex(headers, [
    "order",
    "items",
    "item",
    "menu",
    "product",
    "what_would_you_like",
  ]);
  const totalIdx = findColumnIndex(headers, ["total", "amount", "price", "order_total"]);
  const notesIdx = findColumnIndex(headers, ["notes", "note", "comments", "special_requests"]);

  const rows: GoogleFormsSubmissionRow[] = [];
  for (let i = 1; i < values.length; i++) {
    const raw = values[i];
    if (!Array.isArray(raw) || raw.every((c) => !String(c ?? "").trim())) continue;

    const row = raw.map((c) => String(c ?? ""));
    const itemSummary =
      (itemIdx >= 0 ? cell(row, itemIdx) : null) ??
      row.find((c) => c.trim().length > 0) ??
      "Google Forms submission";
    const totalRaw = totalIdx >= 0 ? cell(row, totalIdx) : null;
    const total = totalRaw ? Number(totalRaw.replace(/[^0-9.-]/g, "")) : 0;

    rows.push({
      rowNumber: i + 1,
      submittedAt: tsIdx >= 0 ? cell(row, tsIdx) : null,
      customerName: nameIdx >= 0 ? cell(row, nameIdx) : null,
      customerEmail: emailIdx >= 0 ? cell(row, emailIdx) : null,
      customerPhone: phoneIdx >= 0 ? cell(row, phoneIdx) : null,
      itemSummary,
      total: Number.isFinite(total) ? total : 0,
      notes: notesIdx >= 0 ? cell(row, notesIdx) : null,
    });
  }

  return rows;
}

export function buildGoogleFormsSheetRange(): string {
  return process.env.GOOGLE_FORMS_SHEET_RANGE?.trim() || "Form Responses 1!A:Z";
}

export async function fetchGoogleFormsSubmissions(): Promise<
  { ok: true; rows: GoogleFormsSubmissionRow[] } | { ok: false; message: string }
> {
  const configError = getGoogleFormsConfigError();
  if (configError) return { ok: false, message: configError };

  const token = process.env.GOOGLE_FORMS_SHEET_ACCESS_TOKEN!.trim();
  const sheetId = process.env.GOOGLE_FORMS_SHEET_ID!.trim();
  const range = encodeURIComponent(buildGoogleFormsSheetRange());

  const res = await fetch(`${SHEETS_API}/${sheetId}/values/${range}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const detail =
      typeof json.error === "object" && json.error && "message" in json.error
        ? String((json.error as { message?: string }).message)
        : `HTTP ${res.status}`;
    return { ok: false, message: detail };
  }

  return { ok: true, rows: parseGoogleFormsSheetValues(json.values) };
}

export async function importSubmissionsFromGoogleForms(
  userId: string,
): Promise<GoogleFormsImportResult> {
  const configError = getGoogleFormsConfigError();
  if (configError) {
    return { ok: false, message: configError, fetched: 0, imported: 0 };
  }

  const fetched = await fetchGoogleFormsSubmissions();
  if (!fetched.ok) {
    return { ok: false, message: fetched.message, fetched: 0, imported: 0 };
  }

  const workspaceId = await resolveOwnerWorkspaceId(userId);
  let imported = 0;
  let skippedExisting = 0;

  for (const row of fetched.rows) {
    const tag = externalGoogleFormsNote(row.rowNumber);
    const existing = await prisma.order.findFirst({
      where: { userId, notes: { contains: tag } },
      select: { id: true },
    });
    if (existing) {
      skippedExisting++;
      continue;
    }

    const total = row.total > 0 ? row.total : 0;
    await persistResolvedOrder(
      { userId, workspaceId },
      {
        orderType: "SALES_CHANNEL_ORDER",
        creationSource: "CHANNEL_IMPORT",
        statusKey: "CONFIRMED",
        paymentMode: "PAY_LATER",
        customerName: row.customerName ?? "Google Forms guest",
        customerEmail: row.customerEmail ?? `google-forms@${userId.slice(0, 8)}.local`,
        customerPhone: row.customerPhone,
        fulfillmentDetail: "PICKUP",
        notes: [row.notes, row.submittedAt ? `Submitted ${row.submittedAt}` : null, tag]
          .filter(Boolean)
          .join(" · ") || tag,
        subtotal: total,
        taxAmount: 0,
        feesAmount: 0,
        total,
        channelProvider: "GOOGLE_FORMS",
        externalOrderId: String(row.rowNumber),
        sourceMetadataJson: {
          provider: "google-forms",
          rowNumber: row.rowNumber,
          submittedAt: row.submittedAt,
          itemSummary: row.itemSummary,
        },
        lines: [
          {
            productId: null,
            title: row.itemSummary,
            quantity: 1,
            unitPrice: total,
            lineTotal: total,
            notes: row.notes ?? undefined,
            preparedDate: null,
            modifiersJson: null,
            sourceMappingId: null,
          },
        ],
      },
    );
    imported++;
  }

  return {
    ok: true,
    fetched: fetched.rows.length,
    imported,
    skippedExisting,
    message: `Imported ${imported} Google Forms rows (${skippedExisting} already synced, ${fetched.rows.length} fetched).`,
  };
}
