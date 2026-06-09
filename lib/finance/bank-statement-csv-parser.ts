import type { BankLineType } from "@/lib/finance/bank-statement-types";

export type ParsedBankLine = {
  date: string;
  description: string;
  amount: number;
  type: BankLineType;
  category?: string;
};

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

/** Pure CSV parser for bank statements — no server-only deps (P0-19 benchmark). */
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
    lines.push({ date, description, amount, type });
  }

  return { lines, warnings };
}
