/**
 * UK DSIT algorithmic transparency API client (AE2 production path).
 */

export type UkDsitStreamPayload = {
  eventId: string;
  transparencyRecordId: string;
  algorithmicSystemId: string;
  disclosureLevel: "standard" | "enhanced" | "frontier";
};

export function ukDsitApiBaseUrl(): string | null {
  return process.env.UK_DSIT_API_URL?.trim() || null;
}

export function isUkDsitLiveApiEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_UK_DSIT_LIVE_API === "1";
}

export async function pollUkDsitStreamEvent(): Promise<{
  ok: boolean;
  event: UkDsitStreamPayload | null;
}> {
  const base = ukDsitApiBaseUrl();
  if (!isUkDsitLiveApiEnabled() || !base) {
    return {
      ok: true,
      event: {
        eventId: `uk-dsit-sim-${Date.now()}`,
        transparencyRecordId: `uk-tr-${Date.now() % 10000}`,
        algorithmicSystemId: process.env.UK_DSIT_ALGORITHMIC_SYSTEM_ID ?? "kos-experiment-assign",
        disclosureLevel: "enhanced",
      },
    };
  }

  const secret = process.env.UK_DSIT_API_KEY?.trim();
  const url = `${base.replace(/\/$/, "")}/v1/transparency/stream/poll`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: secret ? { authorization: `Bearer ${secret}` } : {},
    });
    if (!res.ok) return { ok: false, event: null };
    const body = (await res.json()) as UkDsitStreamPayload;
    return { ok: true, event: body };
  } catch {
    return { ok: false, event: null };
  }
}
