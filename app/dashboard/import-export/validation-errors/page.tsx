import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listValidationErrorPreviewRows } from "@/services/import-export/import-job-queries";

function jsonCell(value: unknown) {
  if (value == null) return "—";
  return JSON.stringify(value);
}

export default async function ValidationErrorsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const rows = await listValidationErrorPreviewRows(dataUserId, 150);

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Validation errors</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Row-level issues from recent import previews.</p>
        </div>
        <Card className="border-dashed border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">No validation rows yet</CardTitle>
            <CardDescription>
              Fix required fields, invalid values, or duplicates before importing. Run a preview from the import wizard to
              populate this list.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/import-export/import">Start import</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Validation errors</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Rows need attention — fix issues before confirming an import.</p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 font-medium">Job</th>
                <th className="px-4 py-3 font-medium">Row</th>
                <th className="px-4 py-3 font-medium">Errors</th>
                <th className="px-4 py-3 font-medium">Raw</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 align-top last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/import-export/imports/${r.importJob.id}`}
                      className="font-medium text-primary underline underline-offset-4"
                    >
                      {r.importJob.filename}
                    </Link>
                    <div className="text-xs text-muted-foreground">{r.importJob.type}</div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.rowNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{jsonCell(r.errorsJson)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{jsonCell(r.rawJson)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
