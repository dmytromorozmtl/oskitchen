export type RouteStopInput = {
  orderId: string;
  address: string;
  lat?: number;
  lng?: number;
};

export type OptimizedRoute = {
  stops: RouteStopInput[];
  totalDistanceMeters?: number;
  totalDurationSeconds?: number;
};

export function isGoogleRoutesConfigured(): boolean {
  return Boolean(process.env.GOOGLE_ROUTES_API_KEY?.trim());
}

/**
 * Optimize delivery stop order via Google Routes API (ComputeRoutes with optimizeWaypointOrder).
 */
export async function optimizeDeliveryRoute(
  stops: RouteStopInput[],
  origin?: { lat: number; lng: number },
): Promise<OptimizedRoute | { error: string }> {
  const key = process.env.GOOGLE_ROUTES_API_KEY?.trim();
  if (!key) return { error: "GOOGLE_ROUTES_API_KEY not configured" };
  if (stops.length < 2) return { stops };

  const intermediates = stops.map((s) => ({
    address: s.address,
    ...(s.lat != null && s.lng != null
      ? { location: { latLng: { latitude: s.lat, longitude: s.lng } } }
      : {}),
  }));

  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.optimizedIntermediateWaypointIndex",
    },
    body: JSON.stringify({
      origin: origin
        ? { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } }
        : { address: stops[0]!.address },
      destination: { address: stops[stops.length - 1]!.address },
      intermediates,
      travelMode: "DRIVE",
      optimizeWaypointOrder: true,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  const json = (await res.json().catch(() => ({}))) as {
    routes?: {
      distanceMeters?: number;
      duration?: string;
      optimizedIntermediateWaypointIndex?: number[];
    }[];
    error?: { message: string };
  };

  if (!res.ok) {
    return { error: json.error?.message ?? `Routes API ${res.status}` };
  }

  const route = json.routes?.[0];
  const order = route?.optimizedIntermediateWaypointIndex;
  const ordered =
    order && order.length === stops.length
      ? order.map((i) => stops[i]!).filter(Boolean)
      : stops;

  return {
    stops: ordered,
    totalDistanceMeters: route?.distanceMeters,
    totalDurationSeconds: route?.duration ? parseInt(route.duration.replace(/\D/g, ""), 10) : undefined,
  };
}
