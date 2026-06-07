import { MigrationWizardClient } from "@/components/import/migration-wizard-client";

export const dynamic = "force-dynamic";

export default function MigrationWizardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Data migration wizard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Migrate from Toast, Square, or Lightspeed via CSV export — preview field mapping for menu,
          customers, and order history, then upload through Import Center for manual review.
        </p>
      </div>
      <MigrationWizardClient />
    </div>
  );
}
