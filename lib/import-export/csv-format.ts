/**
 * CSV serialization with basic formula-injection mitigation for spreadsheet consumers.
 * @see docs/IMPORT_EXPORT_SECURITY.md
 */
export function sanitizeSpreadsheetScalar(value: string | number | null | undefined): string | number {
  if (value == null) return "";
  if (typeof value === "number") return value;
  const s = String(value);
  const t = s.trimStart();
  if (t.startsWith("=") || t.startsWith("+") || t.startsWith("-") || t.startsWith("@")) {
    return `'${s.replace(/'/g, "''")}`;
  }
  return s;
}

export function csvEscapeCell(cell: string | number | null | undefined): string {
  const s = cell == null ? "" : String(typeof cell === "string" ? sanitizeSpreadsheetScalar(cell) : cell);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsvRow(cells: (string | number | null | undefined)[]): string {
  return `${cells.map(csvEscapeCell).join(",")}\n`;
}

export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const lines = [headers.map(csvEscapeCell).join(","), ...rows.map((r) => r.map(csvEscapeCell).join(","))];
  return lines.join("\n");
}
