/**
 * NIST AI RMF live control feed API client (AF2).
 */

export type NistRmfControlStreamPayload = {
  eventId: string;
  controlId: string;
  rmfFunction: "govern" | "map" | "measure" | "manage";
  newStatus: "complete" | "partial" | "pending";
};

export function nistRmfApiBaseUrl(): string | null {
  return process.env.NIST_AI_RMF_API_URL?.trim() || null;
}

export function isNistRmfLiveApiEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_NIST_AI_RMF_LIVE_API === "1";
}

export async function pollNistRmfControlStreamEvent(): Promise<{
  ok: boolean;
  event: NistRmfControlStreamPayload | null;
}> {
  const base = nistRmfApiBaseUrl();
  if (!isNistRmfLiveApiEnabled() || !base) {
    return {
      ok: true,
      event: {
        eventId: `nist-sim-${Date.now()}`,
        controlId: `nist-ctrl-${Date.now() % 10000}`,
        rmfFunction: "measure",
        newStatus: "complete",
      },
    };
  }

  const secret = process.env.NIST_AI_RMF_API_KEY?.trim();
  const url = `${base.replace(/\/$/, "")}/v1/controls/stream/poll`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: secret ? { authorization: `Bearer ${secret}` } : {},
    });
    if (!res.ok) return { ok: false, event: null };
    return { ok: true, event: (await res.json()) as NistRmfControlStreamPayload };
  } catch {
    return { ok: false, event: null };
  }
}
