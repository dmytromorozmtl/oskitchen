import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { listIotDevices } from "@/services/food-safety/iot-temperature-service";

export default async function IotDevicesPage() {
  const { dataUserId } = await requireTenantActor();
  const devices = await listIotDevices(dataUserId);

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">IoT temperature devices</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sensors post to <code className="text-xs">POST /api/iot/temperature</code> with deviceId, temperature, and timestamp.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="p-3">Device</th>
              <th className="p-3">Location</th>
              <th className="p-3">Range °F</th>
              <th className="p-3">Last seen</th>
              <th className="p-3">Battery</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id} className="border-b">
                <td className="p-3 font-medium">{d.label ?? d.deviceId}</td>
                <td className="p-3">{d.location?.name ?? "—"}</td>
                <td className="p-3">
                  {d.targetMinF != null || d.targetMaxF != null
                    ? `${d.targetMinF ?? "?"} – ${d.targetMaxF ?? "?"}`
                    : "—"}
                </td>
                <td className="p-3">{d.lastSeenAt?.toISOString().slice(0, 16) ?? "—"}</td>
                <td className="p-3">{d.lastBattery != null ? `${d.lastBattery}%` : "—"}</td>
              </tr>
            ))}
            {!devices.length ? (
              <tr>
                <td colSpan={5} className="p-6 text-muted-foreground">
                  No devices yet. Register via Prisma or seed <code className="text-xs">iot_sensor_devices</code>.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm">
        <Link href="/dashboard/food-safety" className="text-primary underline-offset-4 hover:underline">
          ← Food safety
        </Link>
      </p>
    </PageShell>
  );
}
