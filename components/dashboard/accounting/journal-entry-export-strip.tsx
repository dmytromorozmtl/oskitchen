import Link from "next/link";
import { FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JOURNAL_ENTRY_EXPORT_ROUTE } from "@/lib/accounting/journal-entry-export-absolute-final-policy";

export function JournalEntryExportStrip() {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid="journal-entry-export-strip"
    >
      <div className="flex items-start gap-3">
        <FileSpreadsheet className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold">Journal entry export</p>
          <p className="text-sm text-muted-foreground">
            CSV, JSON, and QuickBooks-mapped exports from operational P&L — BETA layer for
            accountant review, not a certified GL.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
        <Link href={JOURNAL_ENTRY_EXPORT_ROUTE}>Open export center</Link>
      </Button>
    </div>
  );
}
