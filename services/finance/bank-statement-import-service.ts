import OpenAI from "openai";

import { assertAiAllowed } from "@/lib/ai/assert-ai-allowed";
import { estimateTokens, recordAIUsage } from "@/lib/ai/budget-guard";
import { prisma } from "@/lib/prisma";
import {
  bankTransactionListWhereForOwner,
  supplierInvoiceListWhereForOwner,
} from "@/lib/scope/workspace-accounting-scope";
import { orderListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export type BankLineType = "DEPOSIT" | "WITHDRAWAL";

export type ParsedBankLine = {
  date: string;
  description: string;
  amount: number;
  type: BankLineType;
  category?: string;
};

export type BankMatchSuggestion = {
  kind: "order" | "invoice";
  entityId: string;
  label: string;
  amount: number;
  date: string;
  confidence: number;
  reason: string;
};

export type EnrichedBankLine = ParsedBankLine & {
  category: string;
  matchConfidence: number;
  matchSuggestion: BankMatchSuggestion | null;
};

export type BankStatementImportPreview = {
  lines: EnrichedBankLine[];
  parseWarnings: string[];
  summary: {
    lineCount: number;
    depositTotal: number;
    withdrawalTotal: number;
    autoMatchedCount: number;
  };
};

const AUTO_RECONCILE_CONFIDENCE = 0.85;
const AMOUNT_TOLERANCE = 0.02;

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function inferTypeFromAmount(amount: number, explicit?: string): BankLineType {
  const normalized = explicit?.trim().toUpperCase();
  if (normalized === "DEPOSIT" || normalized === "CREDIT") return "DEPOSIT";
  if (normalized === "WITHDRAWAL" || normalized === "DEBIT") return "WITHDRAWAL";
  return amount < 0 ? "WITHDRAWAL" : "DEPOSIT";
}

function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[$,]/g, "").trim();
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? Math.abs(value) : null;
}

function normalizeDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const year = slash[3].length === 2 ? `20${slash[3]}` : slash[3];
    const month = slash[1].padStart(2, "0");
    const day = slash[2].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return null;
}

export function categorizeBankTransaction(
  description: string,
  type: BankLineType,
): string {
  const text = description.toLowerCase();

  if (type === "DEPOSIT") {
    if (
      /stripe|square|settlement|payout|deposit|pos|toast|clover|shopify/.test(text)
    ) {
      return "POS deposit";
    }
    return "Other deposit";
  }

  if (/sysco|supplier|vendor|foods|us foods|gordon|produce|wholesale/.test(text)) {
    return "Supplier payment";
  }
  if (/adp|payroll|gusto|wages|salary/.test(text)) {
    return "Payroll";
  }
  if (/rent|lease|landlord/.test(text)) {
    return "Rent";
  }
  if (/utility|electric|gas|water|internet/.test(text)) {
    return "Utilities";
  }

  return "Uncategorized expense";
}

export function parseBankStatementCsv(csv: string): {
  lines: ParsedBankLine[];
  warnings: string[];
} {
  const warnings: string[] = [];
  const rows = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length === 0) {
    return { lines: [], warnings: ["CSV is empty."] };
  }

  const headerCells = rows[0].split(",").map((cell) => normalizeHeader(cell));
  const dateIdx = headerCells.findIndex((h) => h === "date" || h === "transactiondate");
  const descIdx = headerCells.findIndex((h) =>
    ["description", "memo", "details", "narrative"].includes(h),
  );
  const amountIdx = headerCells.findIndex((h) =>
    ["amount", "value", "transactionamount"].includes(h),
  );
  const typeIdx = headerCells.findIndex((h) => h === "type" || h === "transactiontype");

  if (dateIdx < 0 || descIdx < 0 || amountIdx < 0) {
    warnings.push("Missing required CSV columns (date, description, amount).");
    return { lines: [], warnings };
  }

  const lines: ParsedBankLine[] = [];
  for (const row of rows.slice(1)) {
    const cells = row.split(",").map((cell) => cell.trim());
    const date = normalizeDate(cells[dateIdx] ?? "");
    const description = cells[descIdx] ?? "";
    const rawAmount = cells[amountIdx] ?? "";
    const amount = parseAmount(rawAmount);
    if (!date || !description || amount == null) {
      warnings.push(`Skipped row: ${row}`);
      continue;
    }
    const signed = Number(rawAmount.replace(/[$,]/g, ""));
    const type = inferTypeFromAmount(signed, typeIdx >= 0 ? cells[typeIdx] : undefined);
    lines.push({
      date,
      description,
      amount,
      type,
      category: categorizeBankTransaction(description, type),
    });
  }

  return { lines, warnings };
}

export function parseBankStatementText(text: string): {
  lines: ParsedBankLine[];
  warnings: string[];
} {
  const warnings: string[] = [];
  const lines: ParsedBankLine[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(
      /^(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})\s+(.+?)\s+(-?\$?\d[\d,]*(?:\.\d{2})?)\s*$/,
    );
    if (!match) {
      warnings.push(`Could not parse line: ${line}`);
      continue;
    }

    const date = normalizeDate(match[1]);
    const description = match[2].trim();
    const signed = Number(match[3].replace(/[$,]/g, ""));
    const amount = Math.abs(signed);
    if (!date || !Number.isFinite(amount)) {
      warnings.push(`Could not parse line: ${line}`);
      continue;
    }

    const type = inferTypeFromAmount(signed);
    lines.push({
      date,
      description,
      amount,
      type,
      category: categorizeBankTransaction(description, type),
    });
  }

  return { lines, warnings };
}

function parseOcrJson(content: string): Record<string, unknown> {
  const cleaned = content.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned) as Record<string, unknown>;
}

async function extractBankLinesFromPhoto(
  imageBase64: string,
  userId: string,
  workspaceId?: string | null,
): Promise<{ lines: ParsedBankLine[]; warnings: string[] }> {
  if (!openai) {
    return {
      lines: [],
      warnings: ["Photo parsing requires OPENAI_API_KEY."],
    };
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
  "lines": [
    { "date": "YYYY-MM-DD", "description": "string", "amount": number, "type": "DEPOSIT" | "WITHDRAWAL" }
  ]
}
Use positive amount values; type indicates deposit vs withdrawal.`;

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
      max_tokens: 1500,
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const parsed = parseOcrJson(content);
    const rawLines = (parsed.lines as Array<Record<string, unknown>>) ?? [];
    const lines: ParsedBankLine[] = [];

    for (const row of rawLines) {
      const date = normalizeDate(String(row.date ?? ""));
      const description = String(row.description ?? "").trim();
      const amount = parseAmount(String(row.amount ?? ""));
      const type = inferTypeFromAmount(amount ?? 0, String(row.type ?? ""));
      if (!date || !description || amount == null) continue;
      lines.push({
        date,
        description,
        amount,
        type,
        category: categorizeBankTransaction(description, type),
      });
    }

    if (workspaceId?.trim()) {
      void recordAIUsage(workspaceId, estimateTokens(content), "ai_ocr");
    }

    return {
      lines,
      warnings: lines.length ? [] : ["No transactions detected in photo."],
    };
  } catch {
    return { lines: [], warnings: ["Photo parsing failed. Try CSV or paste text instead."] };
  }
}

function daysBetween(a: string, b: Date): number {
  const left = new Date(`${a}T12:00:00.000Z`).getTime();
  const right = new Date(b).setHours(12, 0, 0, 0);
  return Math.abs(left - right) / (1000 * 60 * 60 * 24);
}

function amountsClose(a: number, b: number): boolean {
  return Math.abs(a - b) <= AMOUNT_TOLERANCE || Math.abs(a - b) / Math.max(a, b, 1) <= 0.01;
}

async function enrichLinesWithMatches(
  userId: string,
  lines: ParsedBankLine[],
): Promise<EnrichedBankLine[]> {
  const [orderWhere, invoiceWhere] = await Promise.all([
    orderListWhereForOwner(userId),
    supplierInvoiceListWhereForOwner(userId),
  ]);

  const [orders, invoices] = await Promise.all([
    prisma.order.findMany({
      where: orderWhere,
      select: { id: true, customerName: true, total: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.supplierInvoice.findMany({
      where: invoiceWhere,
      select: {
        id: true,
        invoiceNumber: true,
        totalAmount: true,
        invoiceDate: true,
        supplier: { select: { name: true } },
      },
      orderBy: { invoiceDate: "desc" },
      take: 200,
    }),
  ]);

  return lines.map((line) => {
    const category = line.category ?? categorizeBankTransaction(line.description, line.type);
    let best: BankMatchSuggestion | null = null;

    if (line.type === "DEPOSIT") {
      for (const order of orders) {
        const amount = Number(order.total);
        if (!amountsClose(line.amount, amount)) continue;
        const dayGap = daysBetween(line.date, order.createdAt);
        if (dayGap > 7) continue;
        const confidence = Math.max(0.5, 0.95 - dayGap * 0.05);
        if (!best || confidence > best.confidence) {
          best = {
            kind: "order",
            entityId: order.id,
            label: `${order.customerName} · $${amount.toFixed(2)}`,
            amount,
            date: order.createdAt.toISOString().slice(0, 10),
            confidence,
            reason: `Amount match within ${dayGap.toFixed(0)} day(s)`,
          };
        }
      }
    } else {
      for (const invoice of invoices) {
        const amount = Number(invoice.totalAmount);
        if (!amountsClose(line.amount, amount)) continue;
        const dayGap = daysBetween(line.date, invoice.invoiceDate);
        if (dayGap > 14) continue;
        const confidence = Math.max(0.5, 0.92 - dayGap * 0.03);
        const supplierName = invoice.supplier?.name ?? "Supplier";
        if (!best || confidence > best.confidence) {
          best = {
            kind: "invoice",
            entityId: invoice.id,
            label: `${supplierName} #${invoice.invoiceNumber} · $${amount.toFixed(2)}`,
            amount,
            date: invoice.invoiceDate.toISOString().slice(0, 10),
            confidence,
            reason: `Invoice amount match within ${dayGap.toFixed(0)} day(s)`,
          };
        }
      }
    }

    return {
      ...line,
      category,
      matchConfidence: best?.confidence ?? 0,
      matchSuggestion: best,
    };
  });
}

function buildPreviewSummary(lines: EnrichedBankLine[]): BankStatementImportPreview["summary"] {
  let depositTotal = 0;
  let withdrawalTotal = 0;
  let autoMatchedCount = 0;

  for (const line of lines) {
    if (line.type === "DEPOSIT") depositTotal += line.amount;
    else withdrawalTotal += line.amount;
    if (line.matchSuggestion && line.matchConfidence >= AUTO_RECONCILE_CONFIDENCE) {
      autoMatchedCount += 1;
    }
  }

  return {
    lineCount: lines.length,
    depositTotal,
    withdrawalTotal,
    autoMatchedCount,
  };
}

export async function listRecentBankImports(userId: string) {
  const scope = await bankTransactionListWhereForOwner(userId);
  return prisma.bankTransaction.findMany({
    where: scope,
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function previewBankStatementImport(
  userId: string,
  source: "csv" | "pdf" | "photo",
  payload: {
    csvText?: string;
    text?: string;
    pdfBytes?: Uint8Array;
    imageBase64?: string;
  },
  workspaceId?: string | null,
): Promise<BankStatementImportPreview> {
  let parsed: { lines: ParsedBankLine[]; warnings: string[] };

  if (source === "csv") {
    parsed = parseBankStatementCsv(payload.csvText ?? "");
  } else if (source === "pdf") {
    if (payload.text?.trim()) {
      parsed = parseBankStatementText(payload.text);
    } else if (payload.pdfBytes?.length) {
      parsed = {
        lines: [],
        warnings: [
          "Could not extract text from PDF automatically. Paste extracted statement text and preview again.",
        ],
      };
    } else {
      parsed = { lines: [], warnings: ["Upload a PDF or paste extracted statement text."] };
    }
  } else {
    parsed = await extractBankLinesFromPhoto(payload.imageBase64 ?? "", userId, workspaceId);
  }

  const lines = await enrichLinesWithMatches(userId, parsed.lines);
  return {
    lines,
    parseWarnings: parsed.warnings,
    summary: buildPreviewSummary(lines),
  };
}

export async function commitBankStatementImport(
  userId: string,
  workspaceId: string | null | undefined,
  lines: EnrichedBankLine[],
): Promise<{ imported: number; autoReconciled: number }> {
  let autoReconciled = 0;

  for (const line of lines) {
    const autoMatch =
      line.matchSuggestion && line.matchConfidence >= AUTO_RECONCILE_CONFIDENCE
        ? line.matchSuggestion
        : null;

    if (autoMatch) autoReconciled += 1;

    await prisma.bankTransaction.create({
      data: {
        userId,
        workspaceId: workspaceId ?? null,
        date: new Date(`${line.date}T12:00:00.000Z`),
        description: line.description.slice(0, 512),
        amount: line.amount,
        type: line.type,
        category: line.category,
        reconciled: Boolean(autoMatch),
        matchedOrderId: autoMatch?.kind === "order" ? autoMatch.entityId : null,
        matchedInvoiceId: autoMatch?.kind === "invoice" ? autoMatch.entityId : null,
        notes: autoMatch ? autoMatch.reason : null,
      },
    });
  }

  return { imported: lines.length, autoReconciled };
}
