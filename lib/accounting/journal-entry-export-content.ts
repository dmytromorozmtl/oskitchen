import type { JournalEntryExportFormat } from "@/lib/accounting/journal-entry-export-absolute-final-policy";

export const JOURNAL_ENTRY_EXPORT_FORMAT_META: Record<
  JournalEntryExportFormat,
  { label: string; description: string; mimeType: string; extension: string }
> = {
  csv: {
    label: "Standard CSV",
    description: "Accountant-friendly flat file with GL codes and optional QuickBooks account IDs.",
    mimeType: "text/csv",
    extension: "csv",
  },
  json: {
    label: "JSON bundle",
    description: "Structured export with summary metadata for API integrations and audit archives.",
    mimeType: "application/json",
    extension: "json",
  },
  quickbooks_csv: {
    label: "QuickBooks CSV",
    description: "Import hints CSV with external QuickBooks account IDs when COA mapping is linked.",
    mimeType: "text/csv",
    extension: "csv",
  },
};
