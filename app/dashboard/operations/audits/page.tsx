import Link from "next/link";

import { startOperationsAuditAction } from "@/actions/operations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listOperationsAudits } from "@/services/operations/operations-service";
import { listOperationsChecklists } from "@/services/operations/operations-service";

export default async function OperationsAuditsPage() {
  const { dataUserId } = await getTenantActor();
  const [audits, checklists] = await Promise.all([
    listOperationsAudits(dataUserId),
    listOperationsChecklists(dataUserId),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Operations audits</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Start audit</CardTitle></CardHeader>
        <CardContent>
          <form action={startOperationsAuditAction} className="flex gap-2">
            <select name="checklistId" required className="rounded-md border px-2 py-1.5 text-sm">
              <option value="">Checklist…</option>
              {checklists.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">Start</button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {audits.map((a) => (
            <div key={a.id} className="flex justify-between rounded-lg border p-3 text-sm">
              <span>{a.checklist.name} · {a.createdAt.toLocaleString()}</span>
              <Link href={`/dashboard/operations/audits/${a.id}`} className="text-primary">Open</Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
