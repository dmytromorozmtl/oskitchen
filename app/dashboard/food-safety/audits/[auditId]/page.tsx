import { notFound } from "next/navigation";

import {
  addCorrectiveActionAction,
  submitAuditResponseAction,
  verifyFoodSafetyAuditAction,
} from "@/actions/food-safety";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getAuditDetail } from "@/services/food-safety/audit-service";

export default async function FoodSafetyAuditDetailPage({
  params,
}: {
  params: Promise<{ auditId: string }>;
}) {
  const { auditId } = await params;
  const { dataUserId } = await getTenantActor();
  const audit = await getAuditDetail(auditId, dataUserId);
  if (!audit) notFound();

  const itemById = new Map(audit.checklist.items.map((i) => [i.id, i]));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{audit.checklist.name}</h1>
      <p className="text-sm text-muted-foreground">
        Status: {audit.status} · Complete each checklist item. Failed items require corrective action before verification.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Responses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {audit.responses.map((r) => {
            const item = itemById.get(r.itemId);
            return (
              <form
                key={r.id}
                action={submitAuditResponseAction}
                className="rounded-lg border p-3 space-y-2"
              >
                <input type="hidden" name="auditId" value={audit.id} />
                <input type="hidden" name="responseId" value={r.id} />
                <p className="font-medium text-sm">{item?.question ?? r.itemId}</p>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="pass" defaultChecked={r.pass} />
                  Pass
                </label>
                <input name="notes" defaultValue={r.notes ?? ""} placeholder="Notes" className="w-full rounded-md border px-2 py-1.5 text-sm" />
                <button type="submit" className="rounded-md border px-3 py-1 text-sm">
                  Save
                </button>
              </form>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Corrective actions (HACCP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={addCorrectiveActionAction} className="space-y-2">
            <input type="hidden" name="auditId" value={audit.id} />
            <textarea
              name="description"
              required
              placeholder="Describe corrective action for failed checks"
              className="w-full min-h-[80px] rounded-md border px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-md border px-3 py-1.5 text-sm">
              Log corrective action
            </button>
          </form>
          {audit.correctiveActionNotes ? (
            <p className="text-sm text-muted-foreground">{audit.correctiveActionNotes}</p>
          ) : null}
          <form action={verifyFoodSafetyAuditAction}>
            <input type="hidden" name="auditId" value={audit.id} />
            <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
              Verify audit complete
            </button>
          </form>
          {audit.verifiedAt ? (
            <p className="text-xs text-muted-foreground">
              Verified {audit.verifiedAt.toISOString().slice(0, 16)}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
