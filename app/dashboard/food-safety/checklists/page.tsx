import Link from "next/link";

import { createChecklistAction } from "@/actions/food-safety";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listChecklists } from "@/services/food-safety/checklist-service";

export default async function FoodSafetyChecklistsPage() {
  const { dataUserId } = await getTenantActor();
  const checklists = await listChecklists(dataUserId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Food safety checklists</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createChecklistAction} className="grid gap-3">
            <input name="name" required placeholder="Checklist name" className="rounded-md border px-2 py-1.5 text-sm" />
            <select name="frequency" className="rounded-md border px-2 py-1.5 text-sm">
              <option value="DAILY">Daily</option>
              <option value="SHIFT">Per shift</option>
              <option value="WEEKLY">Weekly</option>
            </select>
            <textarea
              name="questions"
              required
              rows={5}
              placeholder="One question per line"
              className="rounded-md border px-2 py-1.5 text-sm"
            />
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
              Create checklist
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Checklists</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {checklists.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.frequency} · {c._count.items} items · {c._count.audits} audits
                </p>
              </div>
              <Link href="/dashboard/food-safety/audits" className="text-sm text-primary hover:underline">
                Run audit →
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
