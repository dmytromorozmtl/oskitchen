import { createHash } from "crypto";

import type {
  EmailOrderIntakeResult,
  EmailOrderParsedIntake,
  EmailOrderParsedLine,
} from "@/lib/integrations/email-orders-types";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { persistResolvedOrder } from "@/services/orders/order-creation-service";

const EMAIL_RE = /[\w.+-]+@[\w.-]+\.\w+/;
const PHONE_RE = /(?:\+?\d[\d\s().-]{7,}\d)/;
const MONEY_RE = /\$?\s*(\d+(?:\.\d{1,2})?)/;
const LINE_ITEM_RE = /^(\d+)\s*[x×]\s*(.+)$/i;

export function hashEmailOrderContent(text: string): string {
  return createHash("sha256").update(text.trim()).digest("hex").slice(0, 16);
}

export function externalEmailOrderNote(contentHash: string): string {
  return `email-orders:hash:${contentHash}`;
}

export function isEmailOrdersAssistConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function extractField(text: string, label: string): string | null {
  const re = new RegExp(`^${label}:\\s*(.+)$`, "im");
  const match = text.match(re);
  return match?.[1]?.trim() ?? null;
}

function parseFromHeader(from: string | null): { name: string | null; email: string | null } {
  if (!from) return { name: null, email: null };
  const emailMatch = from.match(EMAIL_RE);
  const email = emailMatch?.[0] ?? null;
  const name = from.replace(EMAIL_RE, "").replace(/[<>"]/g, "").trim() || null;
  return { name, email };
}

function parseLineItems(body: string): EmailOrderParsedLine[] {
  const lines = body.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const items: EmailOrderParsedLine[] = [];

  for (const line of lines) {
    const bullet = line.replace(/^[-*•]\s*/, "");
    const match = bullet.match(LINE_ITEM_RE);
    if (match) {
      items.push({
        quantity: Number(match[1]) || 1,
        title: match[2]?.trim() ?? "Email order item",
        unitPrice: null,
      });
      continue;
    }
    if (/^total\b/i.test(bullet) || /^subtotal\b/i.test(bullet)) continue;
    if (bullet.length > 2 && !/^(from|to|subject|date|sent):/i.test(bullet)) {
      items.push({ quantity: 1, title: bullet, unitPrice: null });
    }
  }

  return items.slice(0, 20);
}

function parseTotal(text: string): number {
  const totalLine = text.match(/(?:^|\n)\s*total\s*[:=]?\s*\$?\s*(\d+(?:\.\d{1,2})?)/i);
  if (totalLine) return Number(totalLine[1]) || 0;

  const amounts = [...text.matchAll(MONEY_RE)].map((m) => Number(m[1])).filter((n) => Number.isFinite(n));
  return amounts.length ? Math.max(...amounts) : 0;
}

export function parseEmailOrderText(emailText: string): EmailOrderParsedIntake | null {
  const trimmed = emailText.trim();
  if (trimmed.length < 10) return null;

  const contentHash = hashEmailOrderContent(trimmed);
  const fromRaw = extractField(trimmed, "From");
  const { name, email } = parseFromHeader(fromRaw);
  const subject = extractField(trimmed, "Subject");
  const phoneMatch = trimmed.match(PHONE_RE);
  const bodyStart = trimmed.search(/\n\s*\n/);
  const body = bodyStart >= 0 ? trimmed.slice(bodyStart).trim() : trimmed;
  const lineItems = parseLineItems(body);
  const total = parseTotal(trimmed);

  return {
    contentHash,
    customerName: name,
    customerEmail: email,
    customerPhone: phoneMatch?.[0]?.trim() ?? null,
    subject,
    lineItems: lineItems.length
      ? lineItems
      : [{ title: subject ?? "Email order", quantity: 1, unitPrice: total || null }],
    total,
    bodyExcerpt: body.slice(0, 500),
  };
}

export async function importEmailOrderFromText(
  userId: string,
  emailText: string,
): Promise<EmailOrderIntakeResult> {
  const parsed = parseEmailOrderText(emailText);
  if (!parsed) {
    return { ok: false, message: "Email text too short or unparseable." };
  }

  const tag = externalEmailOrderNote(parsed.contentHash);
  const existing = await prisma.order.findFirst({
    where: { userId, notes: { contains: tag } },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: true,
      imported: false,
      skippedExisting: true,
      message: "This email was already imported (duplicate hash).",
      parsed,
    };
  }

  const workspaceId = await resolveOwnerWorkspaceId(userId);
  const total =
    parsed.total > 0
      ? parsed.total
      : parsed.lineItems.reduce((sum, li) => sum + (li.unitPrice ?? 0) * li.quantity, 0);

  const order = await persistResolvedOrder(
    { userId, workspaceId },
    {
      orderType: "SALES_CHANNEL_ORDER",
      creationSource: "CHANNEL_IMPORT",
      statusKey: "CONFIRMED",
      paymentMode: "PAY_LATER",
      customerName: parsed.customerName ?? "Email guest",
      customerEmail: parsed.customerEmail ?? `email-import@${userId.slice(0, 8)}.local`,
      customerPhone: parsed.customerPhone,
      fulfillmentDetail: "PICKUP",
      notes: [parsed.subject ? `Subject: ${parsed.subject}` : null, tag].filter(Boolean).join(" · ") || tag,
      subtotal: total,
      taxAmount: 0,
      feesAmount: 0,
      total,
      channelProvider: "EMAIL_ORDERS",
      externalOrderId: parsed.contentHash,
      sourceMetadataJson: {
        provider: "email-orders",
        contentHash: parsed.contentHash,
        subject: parsed.subject,
        bodyExcerpt: parsed.bodyExcerpt,
        aiAssistAvailable: isEmailOrdersAssistConfigured(),
      },
      lines: parsed.lineItems.map((li) => {
        const unitPrice =
          li.unitPrice != null ? li.unitPrice : total / Math.max(parsed.lineItems.length, 1);
        return {
          productId: null,
          title: li.title,
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

  return {
    ok: true,
    imported: true,
    skippedExisting: false,
    orderId: order.orderId,
    message: `Imported email order (${parsed.lineItems.length} line(s)).`,
    parsed,
  };
}
