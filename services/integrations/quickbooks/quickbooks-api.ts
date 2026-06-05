import type { QuickBooksAccountRow } from "@/lib/integrations/quickbooks-live-types";

const PRODUCTION_API = "https://quickbooks.api.intuit.com";
const SANDBOX_API = "https://sandbox-quickbooks.api.intuit.com";
const CONNECTIONS_URL = "https://appcenter.intuit.com/api/v1/connection/oauth2";

function apiBase(): string {
  return process.env.QUICKBOOKS_ENVIRONMENT === "production" ? PRODUCTION_API : SANDBOX_API;
}

export async function fetchQuickBooksRealmId(accessToken: string): Promise<string | null> {
  const res = await fetch(CONNECTIONS_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as Array<{ realmId?: string }>;
  const realmId = json[0]?.realmId?.trim();
  return realmId || null;
}

export async function queryQuickBooksAccounts(input: {
  accessToken: string;
  realmId: string;
}): Promise<QuickBooksAccountRow[]> {
  const query = encodeURIComponent("select Id, Name, AccountType, AccountSubType, Active from Account maxresults 200");
  const url = `${apiBase()}/v3/company/${encodeURIComponent(input.realmId)}/query?query=${query}&minorversion=65`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`QuickBooks accounts query failed (${res.status})`);
  }
  const json = (await res.json()) as {
    QueryResponse?: {
      Account?: Array<{
        Id?: string;
        Name?: string;
        AccountType?: string;
        AccountSubType?: string;
        Active?: boolean;
      }>;
    };
  };
  return (json.QueryResponse?.Account ?? []).map((row) => ({
    id: String(row.Id ?? ""),
    name: String(row.Name ?? "Account"),
    accountType: String(row.AccountType ?? "Other"),
    accountSubType: row.AccountSubType != null ? String(row.AccountSubType) : null,
    active: row.Active !== false,
  }));
}

export async function createQuickBooksJournalEntry(input: {
  accessToken: string;
  realmId: string;
  txnDate: string;
  memo: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
}): Promise<{ ok: boolean; message: string; journalId?: string }> {
  const amount = Math.round(Math.abs(input.amount) * 100) / 100;
  if (amount <= 0) {
    return { ok: false, message: "Journal amount must be greater than zero." };
  }

  const body = {
    Line: [
      {
        DetailType: "JournalEntryLineDetail",
        Amount: amount,
        JournalEntryLineDetail: {
          PostingType: "Debit",
          AccountRef: { value: input.debitAccountId },
        },
      },
      {
        DetailType: "JournalEntryLineDetail",
        Amount: amount,
        JournalEntryLineDetail: {
          PostingType: "Credit",
          AccountRef: { value: input.creditAccountId },
        },
      },
    ],
    TxnDate: input.txnDate,
    PrivateNote: input.memo,
  };

  const url = `${apiBase()}/v3/company/${encodeURIComponent(input.realmId)}/journalentry?minorversion=65`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, message: text.slice(0, 300) || `QuickBooks journal failed (${res.status})` };
  }

  const json = (await res.json()) as { JournalEntry?: { Id?: string } };
  return {
    ok: true,
    message: "Daily sales journal posted to QuickBooks.",
    journalId: json.JournalEntry?.Id != null ? String(json.JournalEntry.Id) : undefined,
  };
}
