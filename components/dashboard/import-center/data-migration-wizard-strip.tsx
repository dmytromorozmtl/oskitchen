import Link from "next/link";
import { ArrowRightLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DATA_MIGRATION_WIZARD_ROUTE } from "@/lib/import/data-migration-wizard-absolute-final-policy";

export function DataMigrationWizardStrip() {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid="data-migration-wizard-strip"
    >
      <div className="flex items-start gap-3">
        <ArrowRightLeft className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold">Migrate from Toast, Square, or Lightspeed</p>
          <p className="text-sm text-muted-foreground">
            CSV export path — not live API. Preview field mapping for menu, customers, and orders,
            then upload through Import Center for manual review.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
        <Link href="/dashboard/import-center/migrate">Open migration wizard</Link>
      </Button>
    </div>
  );
}
