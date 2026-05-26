import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listExportJobsForUser } from "@/services/import-export/import-job-queries";

export default async function ExportHistoryPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const jobs = await listExportJobsForUser(dataUserId, 50);

  if (jobs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Export history</h1>
        </div>
        <Card className="border-dashed border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">No export history yet</CardTitle>
            <CardDescription>Export operational data for reporting, analysis, backups, or migration.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/import-export/export">Export data</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Export history</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Recorded downloads (including legacy `/api/export` links).</p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 font-medium">Rows</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{j.type}</td>
                  <td className="px-4 py-3">{j.fileName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{j.rowCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{j.status}</td>
                  <td className="px-4 py-3 text-muted-foreground">{j.createdAt.toISOString().slice(0, 16)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
