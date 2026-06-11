import Link from "next/link";

import { createOperationsChecklistAction } from "@/actions/operations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listOperationsChecklists } from "@/services/operations/operations-service";

export default async function OperationsChecklistsPage() {
  const { dataUserId } = await getTenantActor();
  const checklists = await listOperationsChecklists(dataUserId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex gap-3 text-sm">
        <Link href="/dashboard/operations/audits" className="text-primary hover:underline">Audits</Link>
        <Link href="/dashboard/operations/compliance" className="text-primary hover:underline">Compliance</Link>
      </div>
      <h1 className="text-2xl font-semibold">Operations checklists</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">New checklist</CardTitle></CardHeader>
        <CardContent>
          <form action={createOperationsChecklistAction} className="grid gap-2">
            <input name="name" required placeholder="Opening procedure" className="rounded-md border px-2 py-1.5 text-sm" />
            <select name="frequency" className="rounded-md border px-2 py-1.5 text-sm">
              <option value="DAILY">Daily</option>
              <option value="SHIFT">Per shift</option>
              <option value="WEEKLY">Weekly</option>
            </select>
            <textarea name="questions" required rows={4} placeholder="One question per line" className="rounded-md border px-2 py-1.5 text-sm" />
            <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">Create</button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Templates</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {checklists.map((c) => (
            <div key={c.id} className="flex justify-between rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-muted-foreground">{c.frequency} · {c._count.items} items</p>
              </div>
              <Link href="/dashboard/operations/audits" className="text-primary">Run audit →</Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
