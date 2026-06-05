import {
  getSquarePaymentsApiBase,
  squarePaymentsHeaders,
} from "@/services/integrations/square-payments/square-payments-credentials";

export async function exchangeSquareOAuthToken(input: {
  code: string;
}): Promise<
  | { ok: true; accessToken: string; refreshToken: string | null; merchantId: string | null }
  | { ok: false; error: string }
> {
  const clientId = process.env.SQUARE_PAYMENTS_CLIENT_ID?.trim();
  const clientSecret = process.env.SQUARE_PAYMENTS_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return { ok: false, error: "SQUARE_PAYMENTS_CLIENT_ID and SQUARE_PAYMENTS_CLIENT_SECRET required." };
  }

  const redirectUri =
    process.env.SQUARE_PAYMENTS_OAUTH_REDIRECT_URI?.trim() ??
    `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/integrations/square-payments/oauth/callback`;

  const res = await fetch(`${getSquarePaymentsApiBase()}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code: input.code,
      redirect_uri: redirectUri,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text || `Square OAuth ${res.status}` };
  }

  const json = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    merchant_id?: string;
  };

  if (!json.access_token?.trim()) {
    return { ok: false, error: "Square token response missing access_token." };
  }

  return {
    ok: true,
    accessToken: json.access_token.trim(),
    refreshToken: json.refresh_token?.trim() ?? null,
    merchantId: json.merchant_id?.trim() ?? null,
  };
}

export async function createSquarePaymentApi(input: {
  accessToken: string;
  locationId: string;
  amountCents: number;
  currency?: string;
  sourceId: string;
  idempotencyKey: string;
  orderId?: string;
}): Promise<
  | { ok: true; paymentId: string; status: string }
  | { ok: false; error: string }
> {
  const res = await fetch(`${getSquarePaymentsApiBase()}/v2/payments`, {
    method: "POST",
    headers: squarePaymentsHeaders(input.accessToken),
    body: JSON.stringify({
      idempotency_key: input.idempotencyKey,
      source_id: input.sourceId,
      amount_money: {
        amount: input.amountCents,
        currency: (input.currency ?? "USD").toUpperCase(),
      },
      location_id: input.locationId,
      reference_id: input.orderId,
      note: "OS Kitchen Square Payments LIVE",
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text || `Square payment ${res.status}` };
  }

  const json = (await res.json()) as {
    payment?: { id?: string; status?: string };
  };

  if (!json.payment?.id) {
    return { ok: false, error: "Square payment response missing id." };
  }

  return {
    ok: true,
    paymentId: json.payment.id,
    status: json.payment.status ?? "UNKNOWN",
  };
}

export async function listSquareRefundsApi(input: {
  accessToken: string;
  locationId: string;
  limit?: number;
}): Promise<{ id: string; paymentId: string; amountCents: number; status: string }[]> {
  const params = new URLSearchParams({
    location_id: input.locationId,
    limit: String(input.limit ?? 25),
  });

  const res = await fetch(`${getSquarePaymentsApiBase()}/v2/refunds?${params}`, {
    headers: squarePaymentsHeaders(input.accessToken),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) return [];

  const json = (await res.json()) as {
    refunds?: {
      id?: string;
      payment_id?: string;
      status?: string;
      amount_money?: { amount?: number };
    }[];
  };

  return (json.refunds ?? [])
    .filter((row) => row.id && row.payment_id)
    .map((row) => ({
      id: row.id!,
      paymentId: row.payment_id!,
      amountCents: row.amount_money?.amount ?? 0,
      status: row.status ?? "UNKNOWN",
    }));
}

export async function createSquareRefundApi(input: {
  accessToken: string;
  paymentId: string;
  amountCents?: number;
  idempotencyKey: string;
}): Promise<{ ok: true; refundId: string } | { ok: false; error: string }> {
  const body: Record<string, unknown> = {
    idempotency_key: input.idempotencyKey,
    payment_id: input.paymentId,
  };
  if (input.amountCents != null) {
    body.amount_money = { amount: input.amountCents, currency: "USD" };
  }

  const res = await fetch(`${getSquarePaymentsApiBase()}/v2/refunds`, {
    method: "POST",
    headers: squarePaymentsHeaders(input.accessToken),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text || `Square refund ${res.status}` };
  }

  const json = (await res.json()) as { refund?: { id?: string } };
  if (!json.refund?.id) return { ok: false, error: "Square refund response missing id." };
  return { ok: true, refundId: json.refund.id };
}
