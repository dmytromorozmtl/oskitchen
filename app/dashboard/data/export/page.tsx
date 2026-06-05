import Link from "next/link";

import { DataExportPanel } from "@/components/data/data-export-panel";
import { rolePageActionClass } from "@/lib/design/dark-mode-everywhere-patterns";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requireImportExportPageAccess } from "@/lib/import-export/import-export-page-access";
import { loadDataPortabilitySnapshot } from "@/services/data/export-service";

export const metadata = {
  title: "Data Export & Portability",
  description: "Full workspace data portability — CSV domains and JSON manifest for GDPR-ready exports.",
};

export default async function DataExportPage() {
  const access = await requireImportExportPageAccess();
  if (!access.ok) return access.deny;

  const snapshot = await loadDataPortabilitySnapshot({
    userId: access.actor.dataUserId,
    sessionUserId: access.actor.sessionUserId,
    granted: access.actor.granted,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <PageHeader
        title="Data Export & Portability"
        description="Export every workspace domain — operations, catalog, purchasing, integrations, and compliance — with a portable JSON manifest."
        actions={
          <Button asChild variant="outline" size="sm" className={rolePageActionClass}>
            <Link href="/dashboard/import-export">Import / Export hub</Link>
          </Button>
        }
      />
      <p className="text-xs text-muted-foreground">
        <span className="font-medium">Portability index.</span> Download individual CSVs or the JSON manifest
        listing every accessible export domain with row counts and download URLs.
      </p>
      <DataExportPanel snapshot={snapshot} />
    </div>
  );
}
