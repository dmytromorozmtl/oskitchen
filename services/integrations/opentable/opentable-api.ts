import type { OpenTableAvailabilitySlot } from "@/lib/integrations/opentable-live-types";

const API_BASE = process.env.OPENTABLE_API_BASE ?? "https://platform.opentable.com/api";

export async function fetchOpenTableAvailability(input: {
  accessToken: string;
  restaurantId: string;
  date: string;
  partySize: number;
}): Promise<OpenTableAvailabilitySlot[]> {
  const params = new URLSearchParams({
    rid: input.restaurantId,
    date: input.date,
    party_size: String(input.partySize),
  });
  const res = await fetch(`${API_BASE}/v2/availability?${params}`, {
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`OpenTable availability failed (${res.status})`);
  }

  type RawSlot = {
    time?: string;
    scheduled_time?: string;
    open?: boolean;
    available?: boolean;
    tables_available?: number;
    tables?: number;
  };

  const json = (await res.json()) as {
    slots?: RawSlot[];
    availability?: RawSlot[];
  };

  const raw = json.slots ?? json.availability ?? [];
  return raw.map((slot) => {
    const time = String(slot.time ?? slot.scheduled_time ?? "").slice(11, 16) || "18:00";
    return {
      date: input.date,
      time,
      partySize: input.partySize,
      tablesAvailable: Number(slot.tables_available ?? slot.tables ?? 0),
      open: slot.open ?? slot.available ?? true,
    };
  });
}

export async function pushOpenTableAvailability(input: {
  accessToken: string;
  restaurantId: string;
  date: string;
  slots: OpenTableAvailabilitySlot[];
}): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/v2/availability`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rid: input.restaurantId,
      date: input.date,
      slots: input.slots.map((s) => ({
        time: `${s.date}T${s.time}:00Z`,
        open: s.open,
        party_size: s.partySize,
        tables_available: s.tablesAvailable,
      })),
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, message: text.slice(0, 300) || `OpenTable availability push failed (${res.status})` };
  }

  return { ok: true, message: "Table availability synced to OpenTable." };
}
