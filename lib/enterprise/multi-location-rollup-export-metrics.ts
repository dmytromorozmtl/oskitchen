/**
 * Multi-location rollup CSV export metrics for QA-33 E2E contract proof.
 */

import {
  MULTI_LOCATION_ROLLUP_CSV_HEADERS,
  MULTI_LOCATION_ROLLUP_REQUIRED_ROW_KINDS,
  type MultiLocationRollupExportContract,
  rollupExportWithinContract,
} from "@/lib/enterprise/multi-location-rollup-export-e2e-policy";

export type MultiLocationRollupExportSummary = MultiLocationRollupExportContract & {
  withinContract: boolean;
  kinds: string[];
};

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += char;
  }

  cells.push(current);
  return cells;
}

export function parseMultiLocationRollupCsv(csv: string): string[][] {
  return csv
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map(parseCsvLine);
}

export function summarizeMultiLocationRollupExport(csv: string): MultiLocationRollupExportSummary {
  const rows = parseMultiLocationRollupCsv(csv);
  const headers = rows[0] ?? [];
  const dataRows = rows.slice(1);
  const kinds = dataRows.map((row) => row[0] ?? "");

  const contract: MultiLocationRollupExportContract = {
    headerMatches: MULTI_LOCATION_ROLLUP_CSV_HEADERS.every(
      (header, index) => headers[index] === header,
    ),
    rowCount: dataRows.length,
    hasNetworkRow: kinds.includes("network"),
    hasLocationRow: kinds.includes("location"),
  };

  return {
    ...contract,
    kinds,
    withinContract: rollupExportWithinContract(contract),
  };
}

export function rollupCsvExportWithinContract(csv: string): boolean {
  return summarizeMultiLocationRollupExport(csv).withinContract;
}

export function allRequiredRollupKindsPresent(kinds: readonly string[]): boolean {
  return MULTI_LOCATION_ROLLUP_REQUIRED_ROW_KINDS.every((kind) => kinds.includes(kind));
}
