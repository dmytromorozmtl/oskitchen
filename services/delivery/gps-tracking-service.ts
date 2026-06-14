import { prisma } from "@/lib/prisma";
import { deliveryDispatchListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type GpsCoordinate = {
  lat: number;
  lng: number;
  recordedAt: string;
  driverLabel?: string | null;
};

type DispatchGpsPayload = {
  pings?: GpsCoordinate[];
  last?: GpsCoordinate | null;
};

function parsePayload(raw: unknown): DispatchGpsPayload {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as DispatchGpsPayload;
  return {
    pings: Array.isArray(o.pings) ? o.pings : [],
    last: o.last ?? null,
  };
}

/** Record a driver GPS ping on the active delivery dispatch for an order. */
export async function recordDeliveryGpsPing(params: {
  userId: string;
  orderId: string;
  lat: number;
  lng: number;
  driverLabel?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!Number.isFinite(params.lat) || !Number.isFinite(params.lng)) {
    return { ok: false, error: "Invalid coordinates." };
  }
  if (params.lat < -90 || params.lat > 90 || params.lng < -180 || params.lng > 180) {
    return { ok: false, error: "Coordinates out of range." };
  }

  const dispatchScope = await deliveryDispatchListWhereForOwner(params.userId);
  const dispatch = await prisma.deliveryDispatch.findFirst({
    where: { AND: [dispatchScope, { orderId: params.orderId }] },
    orderBy: { updatedAt: "desc" },
    select: { id: true, rawPayloadJson: true },
  });
  if (!dispatch) {
    return { ok: false, error: "No delivery dispatch for this order." };
  }

  const prev = parsePayload(dispatch.rawPayloadJson);
  const ping: GpsCoordinate = {
    lat: params.lat,
    lng: params.lng,
    recordedAt: new Date().toISOString(),
    driverLabel: params.driverLabel ?? null,
  };
  const pings = [...(prev.pings ?? []), ping].slice(-120);

  await prisma.deliveryDispatch.update({
    where: { id: dispatch.id },
    data: {
      rawPayloadJson: { ...prev, pings, last: ping },
    },
  });

  return { ok: true };
}

/** Public-safe tracking snapshot for customer order lookup token. */
export async function getPublicDeliveryTracking(params: {
  storeSlug: string;
  orderPublicToken: string;
}): Promise<
  | {
      ok: true;
      orderNumber: string | null;
      status: string;
      trackingUrl: string | null;
      last: GpsCoordinate | null;
    }
  | { ok: false; error: string }
> {
  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug: params.storeSlug, enabled: true },
    select: { userId: true, id: true },
  });
  if (!sf) return { ok: false, error: "Store not found." };

  const order = await prisma.order.findFirst({
    where: {
      userId: sf.userId,
      publicLookupToken: params.orderPublicToken,
    },
    select: {
      id: true,
      status: true,
      deliveryDispatches: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { status: true, trackingUrl: true, rawPayloadJson: true },
      },
    },
  });
  if (!order) return { ok: false, error: "Order not found." };

  const dispatch = order.deliveryDispatches[0];
  const gps = parsePayload(dispatch?.rawPayloadJson);

  return {
    ok: true,
    orderNumber: null,
    status: order.status,
    trackingUrl: dispatch?.trackingUrl ?? null,
    last: gps.last ?? gps.pings?.[gps.pings.length - 1] ?? null,
  };
}
