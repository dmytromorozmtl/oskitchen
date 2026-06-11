import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteSavedReportAction,
  duplicateSavedReportAction,
  toggleSavedReportPinAction,
} from "@/actions/reports";
import { requireReportsPageAccess } from "@/lib/reports/reports-page-access";
import { getReportDefinition, isReportKey } from "@/lib/reports/report-registry";
import { listSavedReports } from "@/services/reports/report-service";

export default async function SavedReportsPage() {
  const access = await requireReportsPageAccess("reports.saved.manage");
  if (!access.ok) {
    return access.deny;
  }
  const { actor } = access;
  const { userId } = actor;
  const saved = await listSavedReports(userId);

  if (saved.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Saved reports</h1>
        <Card className="border-border/80 shadow-sm">
          <CardContent className="space-y-2 py-8 text-center text-sm text-muted-foreground">
            <p className="text-base font-medium text-foreground">No saved reports yet</p>
            <p>Save frequently used filters for weekly or monthly reporting.</p>
            <Link
              href="/dashboard/reports/library"
              className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Open report library
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function pinAction(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    if (id) await toggleSavedReportPinAction(id);
  }
  async function dupAction(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    if (id) await duplicateSavedReportAction(id);
  }
  async function delAction(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    if (id) await deleteSavedReportAction(id);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Saved reports</h1>
        <Link
          href="/dashboard/reports/library"
          className="rounded-md border border-border px-3 py-1.5 text-sm"
        >
          Open library
        </Link>
      </header>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {saved.map((s) => {
          const def = isReportKey(s.reportKey) ? getReportDefinition(s.reportKey) : null;
          const filterQs = new URLSearchParams(
            (s.filtersJson as Record<string, string> | null) ?? {},
          ).toString();
          return (
            <Card key={s.id} className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  {s.pinned && <span className="mr-1">★</span>}
                  {s.name}
                </CardTitle>
                <CardDescription>{def?.title ?? s.reportKey}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {s.description && <p className="text-muted-foreground">{s.description}</p>}
                <div className="text-xs text-muted-foreground">
                  Updated {s.updatedAt.toISOString().slice(0, 10)}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    href={`/dashboard/reports/${s.reportKey}${filterQs ? `?${filterQs}` : ""}`}
                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  >
                    Open
                  </Link>
                  <form action={pinAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="rounded-md border border-border px-3 py-1.5 text-xs">
                      {s.pinned ? "Unpin" : "Pin to dashboard"}
                    </button>
                  </form>
                  <form action={dupAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="rounded-md border border-border px-3 py-1.5 text-xs">
                      Duplicate
                    </button>
                  </form>
                  <form action={delAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="rounded-md border border-destructive/40 px-3 py-1.5 text-xs text-destructive">
                      Delete
                    </button>
                  </form>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
