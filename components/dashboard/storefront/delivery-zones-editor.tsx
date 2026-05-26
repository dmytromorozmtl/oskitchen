"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StorefrontDeliveryZone } from "@/lib/storefront/delivery-zones";

type ZoneRow = StorefrontDeliveryZone & { _key: string };

type Props = {
  name: string;
  defaultValue: string;
};

function parseZones(raw: string): ZoneRow[] {
  try {
    const j = JSON.parse(raw || "[]");
    if (!Array.isArray(j)) return [];
    return j.map((z, i) => {
      const o = z && typeof z === "object" ? (z as Record<string, unknown>) : {};
      return {
        _key: `z-${i}-${String(o.name ?? "zone")}`,
        name: String(o.name ?? `Zone ${i + 1}`),
        enabled: o.enabled !== false,
        fee: o.fee != null ? Number(o.fee) : undefined,
        minimumOrder: o.minimumOrder != null ? Number(o.minimumOrder) : undefined,
        freeDeliveryThreshold:
          o.freeDeliveryThreshold != null ? Number(o.freeDeliveryThreshold) : undefined,
        postalCodes: Array.isArray(o.postalCodes) ? o.postalCodes.map(String) : [],
        regions: Array.isArray(o.regions) ? o.regions.map(String) : [],
      };
    });
  } catch {
    return [];
  }
}

function toJson(zones: ZoneRow[]): string {
  const out = zones.map(({ _key: _, ...z }) => ({
    name: z.name,
    enabled: z.enabled !== false,
    fee: z.fee,
    minimumOrder: z.minimumOrder,
    freeDeliveryThreshold: z.freeDeliveryThreshold,
    postalCodes: z.postalCodes?.length ? z.postalCodes : undefined,
    regions: z.regions?.length ? z.regions : undefined,
  }));
  return JSON.stringify(out, null, 2);
}

export function DeliveryZonesEditor({ name, defaultValue }: Props) {
  const [zones, setZones] = useState<ZoneRow[]>(() => parseZones(defaultValue));
  const [json, setJson] = useState(defaultValue || "[]");

  useEffect(() => {
    setJson(toJson(zones));
  }, [zones]);

  function addZone() {
    setZones((z) => [
      ...z,
      {
        _key: `z-${Date.now()}`,
        name: "New zone",
        enabled: true,
        fee: 0,
        postalCodes: [],
        regions: [],
      },
    ]);
  }

  function update(key: string, patch: Partial<ZoneRow>) {
    setZones((list) => list.map((z) => (z._key === key ? { ...z, ...patch } : z)));
  }

  function remove(key: string) {
    setZones((list) => list.filter((z) => z._key !== key));
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={json} readOnly />
      {zones.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No delivery zones — add one below or rely on the flat delivery fee above.
        </p>
      ) : (
        zones.map((z) => (
          <div key={z._key} className="grid gap-3 rounded-lg border border-border/60 p-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Zone name</Label>
              <Input value={z.name ?? ""} onChange={(e) => update(z._key, { name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Delivery fee</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={z.fee ?? ""}
                onChange={(e) => update(z._key, { fee: e.target.value === "" ? undefined : Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label>Minimum order</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={z.minimumOrder ?? ""}
                onChange={(e) =>
                  update(z._key, {
                    minimumOrder: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Free delivery from subtotal</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={z.freeDeliveryThreshold ?? ""}
                onChange={(e) =>
                  update(z._key, {
                    freeDeliveryThreshold: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Postal codes (comma-separated)</Label>
              <Input
                value={(z.postalCodes ?? []).join(", ")}
                onChange={(e) =>
                  update(z._key, {
                    postalCodes: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="90210, 10001"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Regions (comma-separated, e.g. CA, NY)</Label>
              <Input
                value={(z.regions ?? []).join(", ")}
                onChange={(e) =>
                  update(z._key, {
                    regions: e.target.value
                      .split(",")
                      .map((s) => s.trim().toUpperCase())
                      .filter(Boolean),
                  })
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={z.enabled !== false}
                onChange={(e) => update(z._key, { enabled: e.target.checked })}
                className="rounded"
              />
              Zone enabled
            </label>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(z._key)}>
              Remove zone
            </Button>
          </div>
        ))
      )}
      <Button type="button" variant="secondary" size="sm" className="rounded-full" onClick={addZone}>
        Add delivery zone
      </Button>
    </div>
  );
}
