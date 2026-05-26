import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { MAX_IMPORT_BYTES, MAX_IMPORT_ROWS, MAX_PREVIEW_ROWS_PERSISTED } from "@/lib/import-export/limits";

export default async function ImportExportSettingsPage() {
  await getTenantActor();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import / export settings</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Current safety caps for CSV ingestion and preview persistence. Plan-tier limits and background workers will extend
          this panel without weakening defaults.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Limits</CardTitle>
          <CardDescription>Hard stops to protect the database and request threads.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium text-foreground">Max import file size:</span>{" "}
            {(MAX_IMPORT_BYTES / (1024 * 1024)).toFixed(0)} MB ({MAX_IMPORT_BYTES.toLocaleString()} bytes)
          </p>
          <p>
            <span className="font-medium text-foreground">Max parsed rows per upload:</span>{" "}
            {MAX_IMPORT_ROWS.toLocaleString()}
          </p>
          <p>
            <span className="font-medium text-foreground">Max preview rows stored per job:</span>{" "}
            {MAX_PREVIEW_ROWS_PERSISTED.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Security defaults</CardTitle>
          <CardDescription>Always on for this module.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Session cookie auth for `/api/export` and template downloads — no signed public URLs with secrets.</p>
          <p>CSV formula injection mitigation on export serialization (leading =, +, -, @).</p>
          <p>Imports never write production entities before validation preview and explicit confirmation.</p>
          <p>Platform superadmin retains full audit export access (see `lib/platform-owner.ts`).</p>
        </CardContent>
      </Card>
    </div>
  );
}
