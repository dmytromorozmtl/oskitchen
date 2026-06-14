import type { ResyWaitlistRow } from "@/lib/integrations/resy-live-types";

const API_BASE = process.env.RESY_API_BASE ?? "https://api.resy.com";

function resyHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export async function fetchResyWaitlist(input: {
  accessToken: string;
  venueId: string;
}): Promise<ResyWaitlistRow[]> {
  const params = new URLSearchParams({ venue_id: input.venueId });
  const res = await fetch(`${API_BASE}/4/venue/waitlist?${params}`, {
    headers: resyHeaders(input.accessToken),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Resy waitlist fetch failed (${res.status})`);
  }

  const json = (await res.json()) as {
    waitlist?: Array<Record<string, unknown>>;
    data?: Array<Record<string, unknown>>;
  };
  const rows = json.waitlist ?? json.data ?? [];
  return rows
    .map((row) => {
      const id = String(row.id ?? row.waitlist_id ?? "");
      if (!id) return null;
      return {
        id,
        customerName: String(row.name ?? row.customer_name ?? row.guest_name ?? "Resy guest"),
        customerPhone: String(row.phone ?? row.customer_phone ?? row.mobile ?? ""),
        partySize: Number(row.party_size ?? row.num_seats ?? 2),
        quotedMinutes: Number(row.quoted_minutes ?? row.estimated_wait ?? 20),
        status: String(row.status ?? "WAITING"),
      };
    })
    .filter((row): row is ResyWaitlistRow => row !== null);
}

export async function createResyWaitlistEntry(input: {
  accessToken: string;
  venueId: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
}): Promise<{ ok: boolean; message: string; waitlistId?: string }> {
  const res = await fetch(`${API_BASE}/4/waitlist/join`, {
    method: "POST",
    headers: resyHeaders(input.accessToken),
    body: JSON.stringify({
      venue_id: input.venueId,
      name: input.customerName,
      phone: input.customerPhone,
      party_size: input.partySize,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, message: text.slice(0, 300) || `Resy waitlist join failed (${res.status})` };
  }

  const json = (await res.json()) as { id?: string; waitlist_id?: string };
  return {
    ok: true,
    message: "Waitlist entry synced to Resy.",
    waitlistId: json.waitlist_id != null ? String(json.waitlist_id) : json.id != null ? String(json.id) : undefined,
  };
}
