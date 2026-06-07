import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  JOURNAL_ENTRY_EXPORT_COMPONENT_PATH,
  JOURNAL_ENTRY_EXPORT_FORMATS,
  JOURNAL_ENTRY_EXPORT_GL_SYNC_PAGE,
  JOURNAL_ENTRY_EXPORT_HONESTY_MARKERS,
  JOURNAL_ENTRY_EXPORT_JSON_ROUTE,
  JOURNAL_ENTRY_EXPORT_PAGE_PATH,
  JOURNAL_ENTRY_EXPORT_REQUIRED_MARKERS,
  JOURNAL_ENTRY_EXPORT_ROUTE,
  JOURNAL_ENTRY_EXPORT_SERVICE_PATH,
  JOURNAL_ENTRY_EXPORT_STRIP_PATH,
  JOURNAL_ENTRY_EXPORT_WIRING_PATHS,
} from "@/lib/accounting/journal-entry-export-absolute-final-policy";

export type JournalEntryExportAudit = {
  ok: boolean;
  failures: string[];
};

export function auditJournalEntryExportWiring(root = process.cwd()): JournalEntryExportAudit {
  const failures: string[] = [];

  for (const rel of JOURNAL_ENTRY_EXPORT_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(join(root, JOURNAL_ENTRY_EXPORT_COMPONENT_PATH), "utf8");
  const pageSource = readFileSync(join(root, JOURNAL_ENTRY_EXPORT_PAGE_PATH), "utf8");
  const serviceSource = readFileSync(join(root, JOURNAL_ENTRY_EXPORT_SERVICE_PATH), "utf8");
  const stripSource = readFileSync(join(root, JOURNAL_ENTRY_EXPORT_STRIP_PATH), "utf8");
  const glSyncPage = readFileSync(join(root, JOURNAL_ENTRY_EXPORT_GL_SYNC_PAGE), "utf8");
  const jsonRoute = readFileSync(join(root, "app/api/export/gl-journal/json/route.ts"), "utf8");

  for (const marker of JOURNAL_ENTRY_EXPORT_REQUIRED_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`component missing marker: ${marker}`);
    }
  }

  for (const marker of JOURNAL_ENTRY_EXPORT_HONESTY_MARKERS) {
    if (!componentSource.includes(marker) && !pageSource.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!pageSource.includes("JournalEntryExportPanel")) {
    failures.push("page missing JournalEntryExportPanel");
  }

  if (!pageSource.includes("loadJournalEntryExportModel")) {
    failures.push("page missing loadJournalEntryExportModel");
  }

  if (!serviceSource.includes("applyCoaMappingsToJournalEntries")) {
    failures.push("service missing COA mapping overlay");
  }

  if (
    !stripSource.includes(JOURNAL_ENTRY_EXPORT_ROUTE) &&
    !stripSource.includes("JOURNAL_ENTRY_EXPORT_ROUTE")
  ) {
    failures.push("strip missing export route");
  }

  if (!glSyncPage.includes("JournalEntryExportStrip")) {
    failures.push("gl-sync page missing journal export strip");
  }

  if (
    !jsonRoute.includes(JOURNAL_ENTRY_EXPORT_JSON_ROUTE) &&
    !jsonRoute.includes("JOURNAL_ENTRY_EXPORT_JSON_ROUTE")
  ) {
    failures.push("json route missing export path reference");
  }

  for (const format of JOURNAL_ENTRY_EXPORT_FORMATS) {
    if (!componentSource.includes(format)) {
      failures.push(`component missing format: ${format}`);
    }
  }

  if (!componentSource.includes("journal-entry-export-absolute-final-v1")) {
    failures.push("component missing policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
