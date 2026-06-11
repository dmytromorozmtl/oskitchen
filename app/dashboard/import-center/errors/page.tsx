import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listValidationErrorPreviewRows } from "@/services/import-export/import-job-queries";

export default async function ImportCenterErrorsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const rows = await listValidationErrorPreviewRows(dataUserId, 200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Error reports</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Validation errors are listed in row order, newest jobs first. Download per-job error
          CSVs from the job page to fix data outside OS Kitchen.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No import errors</CardTitle>
            <CardDescription>
              Error reports appear when uploaded CSV rows need corrections.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[840px] text-left text-xs">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Job</th>
                  <th className="px-3 py-2 font-medium">Row</th>
                  <th className="px-3 py-2 font-medium">Errors</th>
                  <th className="px-3 py-2 font-medium">Raw</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const errors = (row.errorsJson as { message: string }[] | null) ?? [];
                  return (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <Link
                          href={`/dashboard/import-center/jobs/${row.importJob.id}`}
                          className="font-medium text-primary underline underline-offset-4"
                        >
                          {row.importJob.filename}
                        </Link>
                        <p className="text-[11px] text-muted-foreground">
                          {row.importJob.type} · {row.importJob.createdAt.toISOString().slice(0, 10)}
                        </p>
                      </td>
                      <td className="px-3 py-2 tabular-nums">{row.rowNumber}</td>
                      <td className="px-3 py-2 text-rose-700">
                        {errors.length === 0 ? "—" : (
                          <ul className="space-y-0.5">
                            {errors.map((e, idx) => (
                              <li key={idx}>{e.message}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        <code className="text-[11px]">{JSON.stringify(row.rawJson)}</code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
