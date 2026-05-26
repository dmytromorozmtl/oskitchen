import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listImportJobsForUser } from "@/services/import-export/import-job-queries";

export default async function ImportHistoryPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const jobs = await listImportJobsForUser(dataUserId, 50);

  if (jobs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Import history</h1>
        </div>
        <Card className="border-dashed border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">No imports yet</CardTitle>
            <CardDescription>
              Upload CSV files safely with column mapping, validation previews, and rollback.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard/import-export/import">Start import</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/dashboard/import-export/templates">Download templates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import history</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Jobs, counts, and rollback status for your workspace.</p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Rows</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Rollback</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => {
                const rollback = j.rollbacks[0];
                return (
                  <tr key={j.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/import-export/imports/${j.id}`} className="font-medium text-primary underline underline-offset-4">
                        {j.filename}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{j.type}</td>
                    <td className="px-4 py-3">{j.status}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      total {j.totalRows} · ok {j.validRows} · err {j.errorRows}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{j.createdAt.toISOString().slice(0, 16)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{rollback ? rollback.status : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
