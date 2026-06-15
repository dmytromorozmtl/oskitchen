/**
 * Minimal RFC-style CSV parser (comma-separated, quoted fields). For large files, stream in a future iteration.
 */
export type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

function parseRow(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export function parseCsv(text: string, maxRows = 50_000): ParsedCsv {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((l) => l.length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseRow(lines[0]!).map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  const cap = Math.min(lines.length - 1, maxRows);
  for (let i = 1; i <= cap; i++) {
    const cells = parseRow(lines[i]!);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j] ?? `col_${j}`] = cells[j] ?? "";
    }
    rows.push(row);
  }
  return { headers, rows };
}
