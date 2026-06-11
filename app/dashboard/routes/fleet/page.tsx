import Link from "next/link";

import { FleetMap } from "@/components/delivery/fleet-map";
import { PageShell } from "@/components/layout/page-shell";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import type { GpsCoordinate } from "@/services/delivery/gps-tracking-service";

function parseLast(raw: unknown): GpsCoordinate | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as { last?: GpsCoordinate; pings?: GpsCoordinate[] };
  return o.last ?? o.pings?.[o.pings.length - 1] ?? null;
}

export default async function FleetTrackingPage() {
  const { userId } = await getTenantActor();
  const dispatches = await prisma.deliveryDispatch.findMany({
    where: {
      userId,
      status: { in: ["QUOTE", "PICKUP", "DROPOFF", "SCHEDULED", "COMPLETED"] },
    },
    orderBy: { updatedAt: "desc" },
    take: 40,
    include: {
      order: { select: { id: true, customerName: true, status: true } },
    },
  });

  const markers = dispatches
    .map((d) => {
      const last = parseLast(d.rawPayloadJson);
      if (!last) return null;
      return {
        id: d.id,
        label: d.order.customerName,
        lat: last.lat,
        lng: last.lng,
        status: d.status,
      };
    })
    .filter(Boolean) as {
    id: string;
    label: string;
    lat: number;
    lng: number;
    status: string;
  }[];

  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fleet tracking</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Live driver pings from delivery dispatches (GPS recorded on driver app / webhook).
          </p>
        </div>
        <Link href="/dashboard/routes" className="text-sm text-primary hover:underline">
          ← Routes
        </Link>
      </div>
      <FleetMap markers={markers} />
    </PageShell>
  );
}
