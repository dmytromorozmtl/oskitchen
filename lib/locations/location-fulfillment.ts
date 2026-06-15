/**
 * Fulfillment settings live as JSON on Location so the schema can evolve
 * without churning the migration table. We only validate at the edges.
 */

export type FulfillmentSettings = {
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  pickupInstructions?: string | null;
  deliveryInstructions?: string | null;
  pickupLeadMinutes?: number | null;
  deliveryLeadMinutes?: number | null;
  pickupCutoffMinutes?: number | null;
  deliveryCutoffMinutes?: number | null;
  minOrderAmountCents?: number | null;
  deliveryFeeCents?: number | null;
  maxOrdersPerWindow?: number | null;
};

export function parseFulfillmentSettings(value: unknown): FulfillmentSettings {
  const r = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
  const str = (v: unknown): string | null => (typeof v === "string" ? v : null);
  return {
    pickupEnabled: Boolean(r.pickupEnabled),
    deliveryEnabled: Boolean(r.deliveryEnabled),
    pickupInstructions: str(r.pickupInstructions),
    deliveryInstructions: str(r.deliveryInstructions),
    pickupLeadMinutes: num(r.pickupLeadMinutes),
    deliveryLeadMinutes: num(r.deliveryLeadMinutes),
    pickupCutoffMinutes: num(r.pickupCutoffMinutes),
    deliveryCutoffMinutes: num(r.deliveryCutoffMinutes),
    minOrderAmountCents: num(r.minOrderAmountCents),
    deliveryFeeCents: num(r.deliveryFeeCents),
    maxOrdersPerWindow: num(r.maxOrdersPerWindow),
  };
}

export type KitchenStation = {
  id: string;
  name: string;
  capacityPerHour?: number | null;
};

export function parseKitchenStations(value: unknown): KitchenStation[] {
  if (!Array.isArray(value)) return [];
  const out: KitchenStation[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.id !== "string" || typeof r.name !== "string") continue;
    out.push({
      id: r.id,
      name: r.name,
      capacityPerHour: typeof r.capacityPerHour === "number" ? r.capacityPerHour : null,
    });
  }
  return out;
}

export type CapacitySettings = {
  ordersPerHour?: number | null;
  ordersPerDay?: number | null;
  seats?: number | null;
};

export function parseCapacitySettings(value: unknown): CapacitySettings {
  const r = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
  return {
    ordersPerHour: num(r.ordersPerHour),
    ordersPerDay: num(r.ordersPerDay),
    seats: num(r.seats),
  };
}

export type LocationDeliveryZone = {
  id: string;
  label: string;
  radiusKm?: number | null;
  feeCents?: number | null;
  minOrderCents?: number | null;
  postalCodes?: string[];
};

export function parseLocationDeliveryZones(value: unknown): LocationDeliveryZone[] {
  if (!Array.isArray(value)) return [];
  const out: LocationDeliveryZone[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.id !== "string" || typeof r.label !== "string") continue;
    out.push({
      id: r.id,
      label: r.label,
      radiusKm: typeof r.radiusKm === "number" ? r.radiusKm : null,
      feeCents: typeof r.feeCents === "number" ? r.feeCents : null,
      minOrderCents: typeof r.minOrderCents === "number" ? r.minOrderCents : null,
      postalCodes: Array.isArray(r.postalCodes) ? r.postalCodes.filter((p): p is string => typeof p === "string") : [],
    });
  }
  return out;
}
