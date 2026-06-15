import { createSign } from "node:crypto";

import { isGa4ApiCircuitOpen, recordGa4ApiFailure, recordGa4ApiSuccess } from "@/lib/storefront/ga4-api-guard";
import { logger } from "@/lib/logger";

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

export type Ga4ArmCheckoutRates = {
  publishedCheckoutEvents: number;
  draftCheckoutEvents: number;
  publishedCheckoutRatePercent: number;
  draftCheckoutRatePercent: number;
};

function parseServiceAccount(): ServiceAccount | null {
  const raw = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  try {
    const j = JSON.parse(raw) as ServiceAccount;
    if (!j.client_email || !j.private_key) return null;
    return j;
  } catch {
    return null;
  }
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function getAccessToken(sa: ServiceAccount): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: sa.token_uri ?? "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  sign.end();
  const signature = base64url(sign.sign(sa.private_key));
  const assertion = `${unsigned}.${signature}`;

  const res = await fetch(sa.token_uri ?? "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { access_token?: string };
  return j.access_token ?? null;
}

/**
 * GA4 Data API — checkout_submit (or purchase) counts by `experimentArm` custom dimension.
 * Requires Admin → Custom definitions → event-scoped dimension `experimentArm`.
 */
export async function fetchGa4ArmCheckoutRates(input: {
  propertyId: string;
  days: number;
  eventName?: string;
}): Promise<Ga4ArmCheckoutRates | null> {
  if (isGa4ApiCircuitOpen()) {
    logger.warn("ga4_data_api_circuit_open");
    return null;
  }

  const sa = parseServiceAccount();
  if (!sa) return null;

  const propertyId = input.propertyId.replace(/\D/g, "");
  if (!propertyId) return null;

  const token = await getAccessToken(sa);
  if (!token) return null;

  const eventName = input.eventName ?? "checkout_submit";
  const startDate = `${Math.max(1, Math.min(90, input.days))}daysAgo`;

  const body = {
    dateRanges: [{ startDate, endDate: "today" }],
    dimensions: [{ name: "customEvent:experimentArm" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        stringFilter: { matchType: "EXACT", value: eventName },
      },
    },
  };

  try {
    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      recordGa4ApiFailure();
      logger.warn("ga4_data_api_failed", { status: res.status, text: text.slice(0, 200) });
      return null;
    }

    const j = (await res.json()) as {
      rows?: { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] }[];
    };

    let published = 0;
    let draft = 0;
    for (const row of j.rows ?? []) {
      const arm = row.dimensionValues?.[0]?.value;
      const count = Number(row.metricValues?.[0]?.value ?? 0);
      if (arm === "published") published += count;
      if (arm === "draft") draft += count;
    }

    const total = published + draft;
    const publishedCheckoutRatePercent = total > 0 ? Math.round((published / total) * 1000) / 10 : 0;
    const draftCheckoutRatePercent = total > 0 ? Math.round((draft / total) * 1000) / 10 : 0;

    recordGa4ApiSuccess();
    return {
      publishedCheckoutEvents: published,
      draftCheckoutEvents: draft,
      publishedCheckoutRatePercent,
      draftCheckoutRatePercent,
    };
  } catch (e) {
    recordGa4ApiFailure();
    logger.warn("ga4_data_api_error", { error: String(e) });
    return null;
  }
}

export function isGa4DataApiConfigured(): boolean {
  return Boolean(parseServiceAccount());
}
