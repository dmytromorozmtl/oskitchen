import { MigrationWizardClient } from "@/components/import/migration-wizard-client";

export const dynamic = "force-dynamic";

export default function MigrationWizardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Data migration wizard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a source system, preview field mapping, then upload via Import Center.
        </p>
      </div>
      <MigrationWizardClient />
    </div>
  );
}
