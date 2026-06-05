import OpenAI from "openai";

import { prisma } from "@/lib/prisma";
import { assertAiAllowed } from "@/lib/ai/assert-ai-allowed";
import { recordAIUsage, estimateTokens } from "@/lib/ai/budget-guard";
import {
  bankTransactionListWhereForOwner,
  supplierInvoiceListWhereForOwner,
} from "@/lib/scope/workspace-accounting-scope";
import { orderListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export type BankTransactionType = "DEPOSIT" | "WITHDRAWAL";

export type ParsedBankLine = {
  date: string;
  description: string;
  amount: number;
  type: BankTransactionType;
  category: string;
  rawLine?: string;
};

export type OrderMatchSuggestion = {
  kind: "order" | "invoice";
  entityId: string;
  label: string;
  amount: number;
  date: string;
  confidence: number;
  reason: string;
};

export type EnrichedBankLine = ParsedBankLine & {
  matchSuggestion: OrderMatchSuggestion | null;
  matchConfidence: number;
};

export type BankStatementImportPreview = {
  source: "csv" | "pdf" | "photo";
  lines: EnrichedBankLine[];
  parseWarnings: string[];
  summary: {
    lineCount: number;
    depositTotal: number;
    withdrawalTotal: number;
    autoMatchedCount: number;
    categorizedCount: number;
  };
};

export type BankStatementImportResult = {
  imported: number;
  autoReconciled: number;
  skipped: number;
};

const CATEGORY_RULES: Array<{ category: string; patterns: RegExp[] }> = [
  { category: "POS deposit", patterns: [/stripe/i, /square/i, /clover/i, /toast/i, /card settlement/i, /pos deposit/i, /merchant deposit/i] },
  { category: "Supplier payment", patterns: [/sysco/i, /us foods/i, /supplier/i, /vendor pay/i, /invoice pay/i, /food service/i] },
  { category: "Payroll", patterns: [/payroll/i, /\badp\b/i, /gusto/i, /wages/i, /salary/i] },
  { category: "Rent", patterns: [/rent/i, /lease/i, /landlord/i] },
  { category: "Utilities", patterns: [/electric/i, /gas co/i, /water/i, /utility/i, /internet/i] },
  { category: "Bank fees", patterns: [/service fee/i, /bank fee/i, /overdraft/i, /monthly fee/i, /wire fee/i] },
  { category: "Transfer", patterns: [/transfer/i, /\bach\b/i, /wire/i, /zelle/i, /venmo/i] },
  { category: "Food & beverage", patterns: [/restaurant/i, /grocery/i, /market/i, /beverage/i] },
];

function normalizeDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const year = slash[3].length === 2 ? `20${slash[3]}` : slash[3];
    return `${year}-${slash[1].padStart(2, "0")}-${slash[2].padStart(2, "0")}`;
  }
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return null;
}

function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s"]/g, "").replace(/\(([^)]+)\)/, "-$1");
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return Math.abs(value);
}

function inferType(amountRaw: string, explicit?: string, debit?: string, credit?: string): BankTransactionType {
  if (explicit) {
    const upper = explicit.toUpperCase();
    if (upper.includes("WITHDRAW") || upper.includes("DEBIT") || upper === "OUT") return "WITHDRAWAL";
    if (upper.includes("DEPOSIT") || upper.includes("CREDIT") || upper === "IN") return "DEPOSIT";
  }
  if (debit && parseAmount(debit)) return "WITHDRAWAL";
  if (credit && parseAmount(credit)) return "DEPOSIT";
  if (amountRaw.includes("-") || amountRaw.includes("(")) return "WITHDRAWAL";
  return "DEPOSIT";
}

export function categorizeBankTransaction(description: string, type: BankTransactionType): string {
  if (type === "DEPOSIT" && /deposit|settlement|payout/i.test(description)) {
    return "POS deposit";
  }
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(description))) {
      return rule.category;
    }
  }
  return type === "DEPOSIT" ? "Other income" : "Uncategorized expense";
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function headerIndex(headers: string[], candidates: string[]): number {
  const normalized = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  for (const candidate of candidates) {
    const idx = normalized.findIndex((h) => h.includes(candidate));
    if (idx >= 0) return idx;
  }
  return -1;
}

/** Parse standard bank CSV exports (date, description, amount or debit/credit columns). */
export function parseBankStatementCsv(csvText: string): { lines: ParsedBankLine[]; warnings: string[] } {
  const warnings: string[] = [];
  const rows = csvText.trim().split(/\r?\n/).filter(Boolean);
  if (rows.length < 2) {
    return { lines: [], warnings: ["CSV must include a header row and at least one transaction."] };
  }

  const headers = splitCsvLine(rows[0]);
  const dateIdx = headerIndex(headers, ["date", "transactiondate", "posteddate"]);
  const descIdx = headerIndex(headers, ["description", "memo", "name", "payee", "details"]);
  const amountIdx = headerIndex(headers, ["amount", "value"]);
  const debitIdx = headerIndex(headers, ["debit", "withdrawal"]);
  const creditIdx = headerIndex(headers, ["credit", "deposit"]);
  const typeIdx = headerIndex(headers, ["type", "transactiontype"]);
  const categoryIdx = headerIndex(headers, ["category"]);

  if (dateIdx < 0 || descIdx < 0 || (amountIdx < 0 && debitIdx < 0 && creditIdx < 0)) {
    return {
      lines: [],
      warnings: ["Could not detect date, description, and amount columns. Expected headers like date,description,amount."],
    };
  }

  const lines: ParsedBankLine[] = [];
  for (let i = 1; i < rows.length; i += 1) {
    const cells = splitCsvLine(rows[i]);
    const date = normalizeDate(cells[dateIdx] ?? "");
    const description = (cells[descIdx] ?? "").trim();
    const amountRaw = amountIdx >= 0 ? cells[amountIdx] ?? "" : cells[debitIdx] ?? cells[creditIdx] ?? "";
    const amount = parseAmount(amountRaw);
    if (!date || !description || amount == null) {
      warnings.push(`Skipped row ${i + 1}: missing date, description, or amount.`);
      continue;
    }
    const type = inferType(amountRaw, typeIdx >= 0 ? cells[typeIdx] : undefined, cells[debitIdx], cells[creditIdx]);
    const category =
      categoryIdx >= 0 && cells[categoryIdx]
        ? cells[categoryIdx]
        : categorizeBankTransaction(description, type);
    lines.push({ date, description, amount, type, category, rawLine: rows[i] });
  }

  return { lines, warnings };
}

/** Extract printable text from a text-based PDF export. */
export function extractTextFromPdfBytes(bytes: Uint8Array): string {
  const raw = new TextDecoder("latin1").decode(bytes);
  const chunks: string[] = [];
  const literalPattern = /\(([^()\\]*(?:\\.[^()\\]*)*)\)/g;
  let match: RegExpExecArray | null;
  while ((match = literalPattern.exec(raw)) !== null) {
    const text = match[1].replace(/\\([nrtbf()\\])/g, (_, ch) => {
      if (ch === "n") return "\n";
      if (ch === "r") return "\r";
      if (ch === "t") return "\t";
      return ch;
    });
    if (text.trim().length > 2) chunks.push(text.trim());
  }
  return chunks.join("\n");
}

/** Parse pasted or extracted PDF/plain-text bank statements. */
export function parseBankStatementText(text: string): { lines: ParsedBankLine[]; warnings: string[] } {
  const warnings: string[] = [];
  const lines: ParsedBankLine[] = [];
  const rowPattern =
    /(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})\s+(.+?)\s+(-?\$?\d[\d,]*\.\d{2}|\(\$?\d[\d,]*\.\d{2}\))/;

  for (const rawLine of text.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (!trimmed || /^date/i.test(trimmed)) continue;

    const matched = trimmed.match(rowPattern);
    if (matched) {
      const date = normalizeDate(matched[1]);
      const description = matched[2].trim();
      const amount = parseAmount(matched[3]);
      if (!date || !description || amount == null) continue;
      const type = inferType(matched[3]);
      lines.push({
        date,
        description,
        amount,
        type,
        category: categorizeBankTransaction(description, type),
        rawLine: trimmed,
      });
      continue;
    }

    const csvLike = splitCsvLine(trimmed);
    if (csvLike.length >= 3) {
      const date = normalizeDate(csvLike[0]);
      const description = csvLike[1]?.trim();
      const amount = parseAmount(csvLike[2] ?? "");
      if (date && description && amount != null) {
        const type = inferType(csvLike[2] ?? "", csvLike[3]);
        lines.push({
          date,
          description,
          amount,
          type,
          category: categorizeBankTransaction(description, type),
          rawLine: trimmed,
        });
      }
    }
  }

  if (lines.length === 0) {
    warnings.push("No transactions detected in PDF/text content. Try CSV export or a clearer photo.");
  }

  return { lines, warnings };
}

function parseOcrJson(content: string): Record<string, unknown> {
  const cleaned = content.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned) as Record<string, unknown>;
}

/** Photograph a bank statement page via OpenAI Vision. */
export async function parseBankStatementPhoto(
  imageBase64: string,
  userId: string,
  workspaceId?: string | null,
): Promise<{ lines: ParsedBankLine[]; warnings: string[] }> {
  if (!openai) {
    return { lines: [], warnings: ["AI vision is not configured (OPENAI_API_KEY missing)."] };
  }

  const limit = await assertAiAllowed({
    userId,
    workspaceId,
    kind: "ai_ocr",
    estimatedText: imageBase64.slice(0, 4000),
  });
  if (!limit.ok) {
    return { lines: [], warnings: [limit.error] };
  }

  const prompt = `Extract bank statement transactions from this image.
Return ONLY JSON:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "amount": number,
      "type": "DEPOSIT" or "WITHDRAWAL"
    }
  ]
}
Use positive amounts. Include every visible transaction row.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: "high" },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    void recordAIUsage(workspaceId ?? userId, estimateTokens(content), "ai_ocr");

    const parsed = parseOcrJson(content);
    const rows = (parsed.transactions as Array<Record<string, unknown>>) ?? [];
    const lines: ParsedBankLine[] = [];
    const warnings: string[] = [];

    for (const row of rows) {
      const date = normalizeDate(String(row.date ?? ""));
      const description = String(row.description ?? "").trim();
      const amount = parseAmount(String(row.amount ?? ""));
      const typeRaw = String(row.type ?? "DEPOSIT").toUpperCase();
      const type: BankTransactionType = typeRaw.includes("WITH") ? "WITHDRAWAL" : "DEPOSIT";
      if (!date || !description || amount == null) continue;
      lines.push({
        date,
        description,
        amount,
        type,
        category: categorizeBankTransaction(description, type),
      });
    }

    if (lines.length === 0) {
      warnings.push("Vision could not extract transactions from this image.");
    }

    return { lines, warnings };
  } catch (error) {
    return {
      lines: [],
      warnings: [error instanceof Error ? error.message : "Vision parsing failed."],
    };
  }
}

function daysBetween(a: string, b: string): number {
  const ms = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function amountClose(a: number, b: number, tolerance = 0.02): boolean {
  return Math.abs(a - b) <= tolerance;
}

export async function matchTransactionsToOrders(
  userId: string,
  lines: ParsedBankLine[],
): Promise<EnrichedBankLine[]> {
  const orderWhere = await orderListWhereForOwner(userId);
  const invoiceWhere = await supplierInvoiceListWhereForOwner(userId);

  const since = new Date();
  since.setDate(since.getDate() - 90);

  const [orders, invoices] = await Promise.all([
    prisma.order.findMany({
      where: { AND: [orderWhere, { createdAt: { gte: since } }] },
      select: { id: true, customerName: true, total: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.supplierInvoice.findMany({
      where: { AND: [invoiceWhere, { createdAt: { gte: since } }] },
      select: {
        id: true,
        invoiceNumber: true,
        totalAmount: true,
        createdAt: true,
        supplier: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  return lines.map((line) => {
    if (line.type === "DEPOSIT") {
      let best: OrderMatchSuggestion | null = null;
      for (const order of orders) {
        const orderTotal = Number(order.total);
        if (!amountClose(line.amount, orderTotal)) continue;
        const orderDate = order.createdAt.toISOString().slice(0, 10);
        const dayDiff = daysBetween(line.date, orderDate);
        let confidence = 0.55;
        let reason = "Amount matches order total";
        if (dayDiff === 0) {
          confidence = 0.95;
          reason = "Exact amount on same day";
        } else if (dayDiff <= 3) {
          confidence = 0.78;
          reason = `Amount matches within ${dayDiff} day(s)`;
        }
        if (line.description.toLowerCase().includes(order.customerName.toLowerCase().slice(0, 6))) {
          confidence = Math.min(0.98, confidence + 0.08);
          reason += " · customer name in description";
        }
        if (!best || confidence > best.confidence) {
          best = {
            kind: "order",
            entityId: order.id,
            label: `${order.customerName} · $${orderTotal.toFixed(2)}`,
            amount: orderTotal,
            date: orderDate,
            confidence,
            reason,
          };
        }
      }
      return { ...line, matchSuggestion: best, matchConfidence: best?.confidence ?? 0 };
    }

    let bestInvoice: OrderMatchSuggestion | null = null;
    for (const invoice of invoices) {
      const invoiceTotal = Number(invoice.totalAmount);
      if (!amountClose(line.amount, invoiceTotal)) continue;
      const invoiceDate = invoice.createdAt.toISOString().slice(0, 10);
      const dayDiff = daysBetween(line.date, invoiceDate);
      let confidence = 0.52;
      let reason = "Amount matches supplier invoice";
      if (dayDiff <= 7) {
        confidence = 0.82;
        reason = `Invoice amount within ${dayDiff} day(s)`;
      }
      if (invoice.supplier?.name && line.description.toLowerCase().includes(invoice.supplier.name.toLowerCase().slice(0, 5))) {
        confidence = Math.min(0.96, confidence + 0.1);
        reason += " · supplier in description";
      }
      if (!bestInvoice || confidence > bestInvoice.confidence) {
        bestInvoice = {
          kind: "invoice",
          entityId: invoice.id,
          label: `${invoice.invoiceNumber ?? "Invoice"} · $${invoiceTotal.toFixed(2)}`,
          amount: invoiceTotal,
          date: invoiceDate,
          confidence,
          reason,
        };
      }
    }

    return { ...line, matchSuggestion: bestInvoice, matchConfidence: bestInvoice?.confidence ?? 0 };
  });
}

export async function previewBankStatementImport(
  userId: string,
  source: "csv" | "pdf" | "photo",
  payload: { csvText?: string; pdfBytes?: Uint8Array; text?: string; imageBase64?: string },
  workspaceId?: string | null,
): Promise<BankStatementImportPreview> {
  let parsed: { lines: ParsedBankLine[]; warnings: string[] };

  if (source === "csv" && payload.csvText) {
    parsed = parseBankStatementCsv(payload.csvText);
  } else if (source === "pdf") {
    const text =
      payload.text ??
      (payload.pdfBytes ? extractTextFromPdfBytes(payload.pdfBytes) : "");
    parsed = parseBankStatementText(text);
  } else if (source === "photo" && payload.imageBase64) {
    parsed = await parseBankStatementPhoto(payload.imageBase64, userId, workspaceId);
  } else {
    parsed = { lines: [], warnings: ["Missing import payload for selected source."] };
  }

  const enriched = await matchTransactionsToOrders(userId, parsed.lines);
  const depositTotal = enriched
    .filter((line) => line.type === "DEPOSIT")
    .reduce((sum, line) => sum + line.amount, 0);
  const withdrawalTotal = enriched
    .filter((line) => line.type === "WITHDRAWAL")
    .reduce((sum, line) => sum + line.amount, 0);

  return {
    source,
    lines: enriched,
    parseWarnings: parsed.warnings,
    summary: {
      lineCount: enriched.length,
      depositTotal,
      withdrawalTotal,
      autoMatchedCount: enriched.filter((line) => line.matchConfidence >= 0.85).length,
      categorizedCount: enriched.filter((line) => line.category !== "Uncategorized expense").length,
    },
  };
}

export async function commitBankStatementImport(
  userId: string,
  workspaceId: string | null | undefined,
  lines: EnrichedBankLine[],
  options?: { autoReconcileThreshold?: number },
): Promise<BankStatementImportResult> {
  const threshold = options?.autoReconcileThreshold ?? 0.85;
  if (lines.length === 0) {
    return { imported: 0, autoReconciled: 0, skipped: 0 };
  }

  let autoReconciled = 0;
  const data = lines.map((line) => {
    const shouldReconcile = line.matchConfidence >= threshold && line.matchSuggestion;
    if (shouldReconcile) autoReconciled += 1;
    return {
      userId,
      workspaceId: workspaceId ?? null,
      date: new Date(line.date),
      description: line.description.slice(0, 512),
      amount: line.amount,
      type: line.type,
      category: line.category,
      reconciled: Boolean(shouldReconcile),
      matchedOrderId:
        shouldReconcile && line.matchSuggestion?.kind === "order"
          ? line.matchSuggestion.entityId
          : null,
      matchedInvoiceId:
        shouldReconcile && line.matchSuggestion?.kind === "invoice"
          ? line.matchSuggestion.entityId
          : null,
      notes: line.matchSuggestion
        ? `Auto-matched (${Math.round(line.matchConfidence * 100)}%): ${line.matchSuggestion.reason}`
        : null,
    };
  });

  const result = await prisma.bankTransaction.createMany({ data });
  return { imported: result.count, autoReconciled, skipped: 0 };
}

export async function listRecentBankImports(userId: string, take = 20) {
  const scope = await bankTransactionListWhereForOwner(userId);
  return prisma.bankTransaction.findMany({
    where: scope,
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      date: true,
      description: true,
      amount: true,
      type: true,
      category: true,
      reconciled: true,
      matchedOrderId: true,
      matchedInvoiceId: true,
      createdAt: true,
    },
  });
}
