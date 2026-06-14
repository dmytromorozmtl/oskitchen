const KLAVIYO_BASE = "https://a.klaviyo.com/api";
const API_REVISION = "2024-10-15";

export function klaviyoHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Klaviyo-API-Key ${apiKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    revision: API_REVISION,
  };
}

type KlaviyoListResponse<T> = {
  data?: T[];
  links?: { next?: string | null };
};

export async function verifyKlaviyoApiKey(
  apiKey: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`${KLAVIYO_BASE}/accounts/`, {
    headers: klaviyoHeaders(apiKey),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text || `Klaviyo ${res.status}` };
  }
  return { ok: true };
}

export async function fetchKlaviyoSegments(apiKey: string): Promise<
  { id: string; name: string; profileCount: number | null }[]
> {
  const rows: { id: string; name: string; profileCount: number | null }[] = [];
  let nextUrl: string | null = `${KLAVIYO_BASE}/segments/?page[size]=50`;

  while (nextUrl) {
    const res = await fetch(nextUrl, {
      headers: klaviyoHeaders(apiKey),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) break;

    const json = (await res.json()) as KlaviyoListResponse<{
      id: string;
      attributes?: { name?: string; profile_count?: number };
    }>;

    for (const row of json.data ?? []) {
      rows.push({
        id: row.id,
        name: row.attributes?.name?.trim() || row.id,
        profileCount:
          typeof row.attributes?.profile_count === "number"
            ? row.attributes.profile_count
            : null,
      });
    }

    nextUrl = json.links?.next ?? null;
  }

  return rows;
}

export async function fetchKlaviyoSegmentProfileEmails(
  apiKey: string,
  segmentId: string,
  limit = 500,
): Promise<string[]> {
  const emails: string[] = [];
  let nextUrl: string | null =
    `${KLAVIYO_BASE}/segments/${encodeURIComponent(segmentId)}/profiles/?page[size]=100`;

  while (nextUrl && emails.length < limit) {
    const res = await fetch(nextUrl, {
      headers: klaviyoHeaders(apiKey),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) break;

    const json = (await res.json()) as KlaviyoListResponse<{
      attributes?: { email?: string };
    }>;

    for (const row of json.data ?? []) {
      const email = row.attributes?.email?.trim().toLowerCase();
      if (email && email.includes("@")) emails.push(email);
      if (emails.length >= limit) break;
    }

    nextUrl = emails.length < limit ? (json.links?.next ?? null) : null;
  }

  return emails;
}
