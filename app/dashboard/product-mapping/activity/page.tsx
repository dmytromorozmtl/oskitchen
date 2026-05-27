import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireProductMappingPageAccess } from "@/lib/product-mapping/mapping-page-access";
import { listEvents } from "@/services/product-mapping/product-mapping-service";

const EVENT_LABEL: Record<string, string> = {
  CREATED: "Created",
  SUGGESTED: "Suggested",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CHANGED: "Changed",
  ARCHIVED: "Archived",
  ALIAS_CREATED: "Alias created",
  CONFLICT_OPENED: "Conflict opened",
  CONFLICT_RESOLVED: "Conflict resolved",
  BULK_APPLIED: "Bulk action",
  MODIFIER_MAPPED: "Modifier mapped",
  RESYNCED: "Resynced",
};

export default async function ActivityPage() {
  const access = await requireProductMappingPageAccess("mapping.audit");
  if (!access.ok) return access.deny;
  const dataUserId = access.userId;
  const events = await listEvents(dataUserId, 200);

  function metadataLine(meta: unknown): string | null {
    if (!meta || typeof meta !== "object") return null;
    const o = meta as Record<string, unknown>;
    const parts: string[] = [];
    if (typeof o.confidenceLabel === "string") parts.push(`confidence ${o.confidenceLabel}`);
    else if (typeof o.confidence === "string") parts.push(`confidence ${o.confidence}`);
    if (typeof o.internalProductId === "string") {
      const id = o.internalProductId;
      parts.push(`target ${id.length > 8 ? `${id.slice(0, 8)}…` : id}`);
    }
    if (typeof o.reason === "string") parts.push(`reason ${o.reason.slice(0, 120)}${o.reason.length > 120 ? "…" : ""}`);
    return parts.length ? parts.join(" · ") : null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Audit trail of every mapping action — approvals, rejects, manual edits, aliases, bulk operations,
          and modifier changes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent events</CardTitle>
          <CardDescription>{events.length} event{events.length === 1 ? "" : "s"} (latest 200).</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {events.map((e) => {
                const metaLine = metadataLine(e.metadataJson);
                return (
                <li key={e.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{EVENT_LABEL[e.eventType] ?? e.eventType}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.mapping?.externalTitle ?? "Workspace-level"} ·
                        {" "}{e.performedBy?.fullName ?? e.performedBy?.email ?? "system"}
                      </p>
                      {metaLine ? (
                        <p className="mt-1 text-xs text-muted-foreground">{metaLine}</p>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {e.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                    </p>
                  </div>
                </li>
              );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
