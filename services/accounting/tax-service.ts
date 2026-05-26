export function isTaxJarConfigured(): boolean {
  return Boolean(process.env.TAXJAR_API_KEY?.trim());
}

export async function calculateOrderTax(input: {
  fromCountry: string;
  fromZip: string;
  toCountry: string;
  toZip: string;
  amount: number;
}): Promise<{ tax: number; rate: number } | { error: string }> {
  const key = process.env.TAXJAR_API_KEY?.trim();
  if (!key) return { error: "TAXJAR_API_KEY not configured" };

  const res = await fetch("https://api.taxjar.com/v2/taxes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from_country: input.fromCountry,
      from_zip: input.fromZip,
      to_country: input.toCountry,
      to_zip: input.toZip,
      amount: input.amount,
      shipping: 0,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  const json = (await res.json().catch(() => ({}))) as {
    tax?: { amount_to_collect?: number; rate?: number };
    error?: string;
  };
  if (!res.ok) return { error: json.error ?? `TaxJar ${res.status}` };
  return {
    tax: json.tax?.amount_to_collect ?? 0,
    rate: json.tax?.rate ?? 0,
  };
}

export async function generateTaxReport(input: {
  startDate: string;
  endDate: string;
}): Promise<{ rows: unknown[] } | { error: string }> {
  const key = process.env.TAXJAR_API_KEY?.trim();
  if (!key) return { error: "TAXJAR_API_KEY not configured" };

  const res = await fetch(
    `https://api.taxjar.com/v2/reports/sales?start_date=${input.startDate}&end_date=${input.endDate}`,
    {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15_000),
    },
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { error: `TaxJar report ${res.status}` };
  return { rows: Array.isArray(json) ? json : [json] };
}
