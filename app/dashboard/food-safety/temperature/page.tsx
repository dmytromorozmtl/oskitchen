import Link from "next/link";

import { logTemperatureAction } from "@/actions/food-safety";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listTemperatureLogs } from "@/services/food-safety/temperature-service";

const CHECK_TYPES = [
  "REFRIGERATOR",
  "FREEZER",
  "HOT_HOLDING",
  "COLD_HOLDING",
  "COOKING",
  "COOLING",
  "REHEATING",
  "RECEIVING",
] as const;

export default async function TemperatureLogPage() {
  const { dataUserId } = await getTenantActor();
  const logs = await listTemperatureLogs(dataUserId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/dashboard/food-safety" className="text-primary hover:underline">
          Overview
        </Link>
        <Link href="/dashboard/food-safety/checklists" className="text-primary hover:underline">
          Checklists
        </Link>
        <Link href="/dashboard/food-safety/audits" className="text-primary hover:underline">
          Audits
        </Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Temperature logs</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Record check</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={logTemperatureAction} className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Type
              <select name="checkType" required className="rounded-md border px-2 py-1.5">
                {CHECK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Temperature (°F)
              <input name="temperature" type="number" step="0.1" required className="rounded-md border px-2 py-1.5" />
            </label>
            <label className="grid gap-1 text-sm">
              Target min
              <input name="targetMin" type="number" step="0.1" className="rounded-md border px-2 py-1.5" />
            </label>
            <label className="grid gap-1 text-sm">
              Target max
              <input name="targetMax" type="number" step="0.1" className="rounded-md border px-2 py-1.5" />
            </label>
            <label className="grid gap-1 text-sm sm:col-span-2">
              Corrective action
              <input name="correctiveAction" className="rounded-md border px-2 py-1.5" />
            </label>
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground sm:col-span-2">
              Save log
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent logs</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4">When</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Temp</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-border/60">
                  <td className="py-2 pr-4">{l.createdAt.toLocaleString()}</td>
                  <td className="py-2 pr-4">{l.checkType}</td>
                  <td className="py-2 pr-4">
                    {Number(l.temperature)}°{l.unit}
                  </td>
                  <td className="py-2">{l.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
