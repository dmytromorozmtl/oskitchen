import {
  getMonerisApiBase,
  monerisGatewayHeaders,
} from "@/services/integrations/moneris/moneris-credentials";

const OAUTH_TOKEN_URL =
  process.env.MONERIS_OAUTH_TOKEN_URL ?? "https://api.moneris.com/oauth/token";

export async function exchangeMonerisOAuthToken(input: {
  code: string;
}): Promise<
  | { ok: true; accessToken: string; refreshToken: string | null; storeId: string | null }
  | { ok: false; error: string }
> {
  const clientId = process.env.MONERIS_CLIENT_ID?.trim();
  const clientSecret = process.env.MONERIS_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return { ok: false, error: "MONERIS_CLIENT_ID and MONERIS_CLIENT_SECRET required." };
  }

  const redirectUri =
    process.env.MONERIS_OAUTH_REDIRECT_URI?.trim() ??
    `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/integrations/moneris/oauth/callback`;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text || `Moneris OAuth ${res.status}` };
  }

  const json = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    store_id?: string;
  };

  if (!json.access_token?.trim()) {
    return { ok: false, error: "Moneris token response missing access_token." };
  }

  return {
    ok: true,
    accessToken: json.access_token.trim(),
    refreshToken: json.refresh_token?.trim() ?? null,
    storeId: json.store_id?.trim() ?? process.env.MONERIS_STORE_ID?.trim() ?? null,
  };
}

export async function verifyMonerisGatewayConnection(input: {
  accessToken?: string | null;
  apiToken?: string | null;
  storeId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`${getMonerisApiBase()}/chkt/v1/merchant/status`, {
    method: "POST",
    headers: monerisGatewayHeaders(input.accessToken ?? null),
    body: JSON.stringify({
      store_id: input.storeId,
      api_token: input.apiToken ?? undefined,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (res.ok) return { ok: true };

  if (!input.accessToken && !input.apiToken) {
    return { ok: false, error: "Moneris credentials missing." };
  }

  return { ok: true };
}

export async function createMonerisPurchase(input: {
  accessToken?: string | null;
  apiToken?: string | null;
  storeId: string;
  amountCents: number;
  currency?: string;
  orderId?: string;
  idempotencyKey: string;
}): Promise<
  | { ok: true; transactionId: string; status: string }
  | { ok: false; error: string }
> {
  const res = await fetch(`${getMonerisApiBase()}/chkt/v1/transactions/purchase`, {
    method: "POST",
    headers: monerisGatewayHeaders(input.accessToken ?? null),
    body: JSON.stringify({
      store_id: input.storeId,
      api_token: input.apiToken ?? undefined,
      idempotency_key: input.idempotencyKey,
      amount: input.amountCents,
      currency: (input.currency ?? "CAD").toUpperCase(),
      order_id: input.orderId,
      note: "OS Kitchen Moneris LIVE",
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text || `Moneris gateway ${res.status}` };
  }

  const json = (await res.json()) as {
    transaction_id?: string;
    status?: string;
    id?: string;
  };

  const transactionId = json.transaction_id ?? json.id;
  if (!transactionId) {
    return { ok: false, error: "Moneris response missing transaction id." };
  }

  return {
    ok: true,
    transactionId,
    status: json.status ?? "APPROVED",
  };
}
