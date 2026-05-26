import { notFound } from "next/navigation";

import { submitOperationsResponseAction } from "@/actions/operations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getOperationsAudit } from "@/services/operations/operations-service";

export default async function OperationsAuditDetailPage({
  params,
}: {
  params: Promise<{ auditId: string }>;
}) {
  const { auditId } = await params;
  const { userId } = await getTenantActor();
  const audit = await getOperationsAudit(auditId, userId);
  if (!audit) notFound();

  const items = new Map(audit.checklist.items.map((i) => [i.id, i]));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">{audit.checklist.name}</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Checklist items</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {audit.responses.map((r) => (
            <form key={r.id} action={submitOperationsResponseAction} className="space-y-2 rounded-lg border p-3">
              <input type="hidden" name="auditId" value={audit.id} />
              <input type="hidden" name="responseId" value={r.id} />
              <p className="text-sm font-medium">{items.get(r.itemId)?.question ?? r.itemId}</p>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="pass" defaultChecked={r.pass} /> Pass
              </label>
              <input name="notes" defaultValue={r.notes ?? ""} placeholder="Notes" className="w-full rounded-md border px-2 py-1.5 text-sm" />
              <input name="photoUrl" defaultValue={r.photoUrl ?? ""} placeholder="Photo URL" className="w-full rounded-md border px-2 py-1.5 text-sm" />
              <button type="submit" className="rounded-md border px-3 py-1 text-sm">Save</button>
            </form>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
