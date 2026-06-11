import { redirect } from "next/navigation";

import { loadAuditCenterPageData } from "@/actions/audit-center";
import { parseAuditListFilters } from "@/lib/audit/audit-search-params";
import { AuditLogsView, type SerializedAuditRow } from "./audit-logs-view";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseAuditListFilters(sp);
  const cursor = typeof sp.cursor === "string" ? sp.cursor : null;
  const data = await loadAuditCenterPageData(filters, cursor);
  if (!data.ok) {
    if (data.error === "forbidden") redirect("/dashboard");
    redirect("/dashboard/settings/workspace");
  }

  const rows: SerializedAuditRow[] = data.rows.map((r) => ({
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    action: r.action,
    category: r.category,
    severity: r.severity,
    source: r.source,
    entityType: r.entityType,
    entityId: r.entityId,
    entityLabel: r.entityLabel,
    userId: r.userId,
    actorEmail: r.actorEmail,
    actorRole: r.actorRole,
    route: r.route,
    method: r.method,
    requestId: r.requestId,
    redactionApplied: r.redactionApplied,
    workspaceId: r.workspaceId,
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <AuditLogsView
        initialFilters={filters}
        initialRows={rows}
        nextCursor={data.nextCursor}
        kpis={data.kpis}
        flags={data.flags}
        exportHistory={data.exportHistory}
        primaryWorkspaceId={data.primaryWorkspaceId}
      />
    </div>
  );
}
