import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { IMPORT_TEMPLATES } from "@/lib/import-center/import-templates";
import { IMPORT_TYPES } from "@/lib/import-center/import-types";

export default async function ImportCenterTemplatesPage() {
  await getTenantActor();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">CSV import templates</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Each template lists the required and optional columns, a sample row, and validation
          notes. Download the CSV, fill it in, and upload it from the Import tab.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {IMPORT_TYPES.map((type) => {
          const spec = IMPORT_TEMPLATES[type];
          const required = spec.fields.filter((f) => f.required);
          const optional = spec.fields.filter((f) => !f.required);
          return (
            <Card key={type} className="border-border/80">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{spec.label}</CardTitle>
                  {spec.committable ? (
                    <Badge className="bg-emerald-100 text-emerald-700">Commit supported</Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700">Preview-only</Badge>
                  )}
                </div>
                <CardDescription>{spec.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Required columns
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {required.length === 0
                      ? <span className="text-xs text-muted-foreground">—</span>
                      : required.map((f) => (
                          <Badge key={f.key} variant="outline">{f.key}</Badge>
                        ))}
                  </div>
                </div>
                {optional.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Optional columns
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {optional.map((f) => (
                        <Badge key={f.key} className="bg-muted text-muted-foreground">{f.key}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sample row</p>
                  <pre className="mt-1 overflow-x-auto rounded-md bg-muted/40 px-3 py-2 text-[11px]">
                    {Object.entries(spec.sampleRow).map(([k, v]) => `${k}: ${v}`).join("\n")}
                  </pre>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Validation notes</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                    {spec.validationNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button asChild size="sm" variant="outline">
                    <a href={`/api/import-center/templates/${type}`}>Download CSV template</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
