/**
 * EU AI Office notified body API client (production, 4.1).
 */

export type EuConformityApiPayload = {
  assessmentId: string;
  notifiedBodyId: string;
  conformityStatus: string;
  highRiskAiSystem: boolean;
  certBodyCrossRef: string | null;
  validUntil: string;
  deltaHash?: string;
};

export type EuConformityApiResult = {
  ok: boolean;
  euDatabaseUrl: string | null;
  syncedAt: string;
  httpStatus?: number;
};

export type EuRegistryStreamPayload = {
  eventId: string;
  assessmentId: string;
  conformityStatus: string;
  registrySequence: number;
  certBodyCrossRef: string | null;
};

export function euAiOfficeApiBaseUrl(): string | null {
  return (
    process.env.EU_AI_OFFICE_API_URL?.trim() ||
    process.env.EU_AI_OFFICE_DATABASE_URL?.trim() ||
    null
  );
}

export function isEuAiOfficeLiveApiEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_EU_AI_OFFICE_LIVE_API === "1";
}

/** POST Article 43 conformity to EU AI Office registry (or sim when URL unset). */
export async function syncConformityToEuOffice(
  payload: EuConformityApiPayload,
): Promise<EuConformityApiResult> {
  const base = euAiOfficeApiBaseUrl();
  const syncedAt = new Date().toISOString();

  if (!isEuAiOfficeLiveApiEnabled() || !base) {
    return {
      ok: true,
      euDatabaseUrl: process.env.EU_AI_OFFICE_DATABASE_URL ?? null,
      syncedAt,
    };
  }

  const secret = process.env.EU_AI_OFFICE_API_KEY?.trim();
  const url = `${base.replace(/\/$/, "")}/v1/conformity-assessments`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(secret ? { authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify({
        article: "Article-43",
        ...payload,
      }),
    });
    const body = res.ok ? ((await res.json().catch(() => ({}))) as { registryUrl?: string }) : {};
    return {
      ok: res.ok,
      euDatabaseUrl: body.registryUrl ?? base,
      syncedAt,
      httpStatus: res.status,
    };
  } catch {
    return { ok: false, euDatabaseUrl: null, syncedAt, httpStatus: 0 };
  }
}

/** Poll EU registry stream endpoint (SSE fallback: single-event poll). */
export async function pollEuRegistryStreamEvent(): Promise<{
  ok: boolean;
  event: EuRegistryStreamPayload | null;
}> {
  const base = euAiOfficeApiBaseUrl();
  if (!isEuAiOfficeLiveApiEnabled() || !base) {
    return {
      ok: true,
      event: {
        eventId: `eu-sim-${Date.now()}`,
        assessmentId: process.env.EU_AI_OFFICE_ASSESSMENT_ID ?? "eu-assess-sim",
        conformityStatus: "conformity",
        registrySequence: Date.now() % 100000,
        certBodyCrossRef: process.env.EU_AI_OFFICE_NOTIFIED_BODY_ID ?? "nb-eu",
      },
    };
  }

  const secret = process.env.EU_AI_OFFICE_API_KEY?.trim();
  const url = `${base.replace(/\/$/, "")}/v1/registry/stream/poll`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: secret ? { authorization: `Bearer ${secret}` } : {},
    });
    if (!res.ok) return { ok: false, event: null };
    const body = (await res.json()) as EuRegistryStreamPayload;
    return { ok: true, event: body };
  } catch {
    return { ok: false, event: null };
  }
}
