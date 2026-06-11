import Link from "next/link";

import { startAuditAction } from "@/actions/food-safety";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listAudits } from "@/services/food-safety/audit-service";
import { listChecklists } from "@/services/food-safety/checklist-service";

export default async function FoodSafetyAuditsPage() {
  const { dataUserId } = await getTenantActor();
  const [audits, checklists] = await Promise.all([
    listAudits(dataUserId),
    listChecklists(dataUserId),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Food safety audits</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Start audit</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={startAuditAction} className="flex flex-wrap gap-2">
            <select name="checklistId" required className="rounded-md border px-2 py-1.5 text-sm">
              <option value="">Select checklist…</option>
              {checklists.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
              Start
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {audits.map((a) => (
            <div key={a.id} className="flex justify-between rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{a.checklist.name}</p>
                <p className="text-xs text-muted-foreground">{a.createdAt.toLocaleString()}</p>
              </div>
              <Link href={`/dashboard/food-safety/audits/${a.id}`} className="text-primary hover:underline">
                Open
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
