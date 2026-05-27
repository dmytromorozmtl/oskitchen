import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireImportCenterSettingsPageAccess } from "@/lib/import-center/import-center-page-access";
import { COMMITTABLE_TYPES, IMPORT_TYPES, IMPORT_TYPE_LABEL, PREVIEW_ONLY_TYPES } from "@/lib/import-center/import-types";
import { MAX_IMPORT_BYTES, MAX_IMPORT_ROWS, MAX_PREVIEW_ROWS_PERSISTED } from "@/lib/import-export/limits";

export default async function ImportCenterSettingsPage() {
  const access = await requireImportCenterSettingsPageAccess();
  if (!access.ok) return access.deny;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import Center settings</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          System-level limits and policy for the safe import workflow.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Limits</CardTitle>
          <CardDescription>Enforced on every upload before anything is parsed.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <ul className="space-y-1">
            <li>Max upload size: <strong>{(MAX_IMPORT_BYTES / 1024 / 1024).toFixed(1)} MB</strong></li>
            <li>Max rows parsed per file: <strong>{MAX_IMPORT_ROWS.toLocaleString()}</strong></li>
            <li>Preview rows persisted per job: <strong>{MAX_PREVIEW_ROWS_PERSISTED.toLocaleString()}</strong></li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Security policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• File parsing is in-memory; CSV contents are not stored on disk.</p>
          <p>• Workspace scoping is enforced server-side on every read and write.</p>
          <p>• Error and template CSV downloads pass every cell through formula-injection sanitisation.</p>
          <p>• Commit and rollback both require explicit user confirmation; no silent overwrites.</p>
          <p>• Rollback plans are recorded at commit time; reasons are required when rollback is run.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Commit support per type</CardTitle>
          <CardDescription>
            Types not listed under &quot;commit supported&quot; are preview-only inside the Import Center.
            Commit those data sets from their dedicated module.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Commit supported</p>
            <ul className="mt-1 list-disc pl-5">
              {COMMITTABLE_TYPES.map((t) => (
                <li key={t}>{IMPORT_TYPE_LABEL[t]}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Preview-only</p>
            <ul className="mt-1 list-disc pl-5">
              {PREVIEW_ONLY_TYPES.map((t) => (
                <li key={t}>{IMPORT_TYPE_LABEL[t]}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All supported types</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 gap-1 text-sm">
            {IMPORT_TYPES.map((t) => (
              <li key={t} className="text-muted-foreground">{IMPORT_TYPE_LABEL[t]}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
