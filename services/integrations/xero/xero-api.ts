import type { XeroBankTransactionRow } from "@/lib/integrations/xero-live-types";

const XERO_API = "https://api.xero.com/api.xro/2.0";
const CONNECTIONS_URL = "https://api.xero.com/connections";

function xeroHeaders(accessToken: string, tenantId: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "xero-tenant-id": tenantId,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export async function fetchXeroTenants(
  accessToken: string,
): Promise<Array<{ tenantId: string; tenantName: string }>> {
  const res = await fetch(CONNECTIONS_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = (await res.json()) as Array<{ tenantId?: string; tenantName?: string }>;
  return json
    .filter((row) => row.tenantId?.trim())
    .map((row) => ({
      tenantId: String(row.tenantId),
      tenantName: String(row.tenantName ?? "Xero organisation"),
    }));
}

export async function createXeroBill(input: {
  accessToken: string;
  tenantId: string;
  contactName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  accountCode?: string;
  description?: string;
}): Promise<{ ok: boolean; message: string; invoiceId?: string }> {
  const amount = Math.round(Math.abs(input.totalAmount) * 100) / 100;
  if (amount <= 0) {
    return { ok: false, message: "Invoice amount must be greater than zero." };
  }

  const body = {
    Invoices: [
      {
        Type: "ACCPAY",
        Contact: { Name: input.contactName },
        Date: input.invoiceDate,
        DueDate: input.dueDate ?? input.invoiceDate,
        InvoiceNumber: input.invoiceNumber,
        LineItems: [
          {
            Description: input.description ?? `OS Kitchen invoice ${input.invoiceNumber}`,
            Quantity: 1,
            UnitAmount: amount,
            AccountCode: input.accountCode ?? "300",
          },
        ],
      },
    ],
  };

  const res = await fetch(`${XERO_API}/Invoices`, {
    method: "POST",
    headers: xeroHeaders(input.accessToken, input.tenantId),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, message: text.slice(0, 300) || `Xero invoice failed (${res.status})` };
  }

  const json = (await res.json()) as { Invoices?: Array<{ InvoiceID?: string }> };
  return {
    ok: true,
    message: "Supplier invoice synced to Xero.",
    invoiceId: json.Invoices?.[0]?.InvoiceID != null ? String(json.Invoices[0].InvoiceID) : undefined,
  };
}

export async function fetchXeroBankTransactions(input: {
  accessToken: string;
  tenantId: string;
}): Promise<XeroBankTransactionRow[]> {
  const where = encodeURIComponent('Type=="RECEIVE"');
  const url = `${XERO_API}/BankTransactions?where=${where}&order=Date DESC`;
  const res = await fetch(url, {
    headers: xeroHeaders(input.accessToken, input.tenantId),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Xero bank transactions failed (${res.status})`);
  }

  const json = (await res.json()) as {
    BankTransactions?: Array<{
      BankTransactionID?: string;
      Date?: string;
      Total?: number;
      Reference?: string;
      Status?: string;
    }>;
  };

  return (json.BankTransactions ?? []).map((row) => ({
    id: String(row.BankTransactionID ?? ""),
    date: String(row.Date ?? "").slice(0, 10),
    amount: Math.round(Math.abs(Number(row.Total ?? 0)) * 100) / 100,
    reference: String(row.Reference ?? ""),
    status: String(row.Status ?? "AUTHORISED"),
  }));
}
