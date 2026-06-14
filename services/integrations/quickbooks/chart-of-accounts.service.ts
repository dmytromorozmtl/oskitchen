import type { QuickBooksAccountRow } from "@/lib/integrations/quickbooks-live-types";
import { prisma } from "@/lib/prisma";
import { queryQuickBooksAccounts } from "@/services/integrations/quickbooks/quickbooks-api";
import { getQuickBooksCredentialsForUser } from "@/services/integrations/quickbooks/quickbooks-credentials";
import { IntegrationProvider } from "@prisma/client";

export type QuickBooksChartOfAccountsResult = {
  accounts: QuickBooksAccountRow[];
  salesAccounts: QuickBooksAccountRow[];
  depositAccounts: QuickBooksAccountRow[];
};

export async function fetchQuickBooksChartOfAccounts(
  userId: string,
): Promise<QuickBooksChartOfAccountsResult> {
  const creds = await getQuickBooksCredentialsForUser(userId);
  if (!creds) {
    throw new Error("QuickBooks is not connected. Complete OAuth first.");
  }

  const accounts = await queryQuickBooksAccounts({
    accessToken: creds.accessToken,
    realmId: creds.realmId,
  });

  const active = accounts.filter((a) => a.active);
  const salesAccounts = active.filter(
    (a) => a.accountType === "Income" || a.accountSubType === "SalesOfProductIncome",
  );
  const depositAccounts = active.filter(
    (a) =>
      a.accountType === "Bank" ||
      a.accountType === "Other Current Asset" ||
      a.name.toLowerCase().includes("undeposited"),
  );

  return { accounts: active, salesAccounts, depositAccounts };
}

export async function saveQuickBooksAccountMapping(input: {
  userId: string;
  salesAccountId: string;
  salesAccountName: string;
  depositAccountId: string;
  depositAccountName: string;
}): Promise<void> {
  const creds = await getQuickBooksCredentialsForUser(input.userId);
  if (!creds) throw new Error("QuickBooks is not connected.");

  const conn = await prisma.integrationConnection.findFirst({
    where: { userId: input.userId, provider: IntegrationProvider.QUICKBOOKS },
  });
  if (!conn) throw new Error("QuickBooks connection not found.");

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      settingsJson: {
        ...creds.settings,
        salesAccountId: input.salesAccountId,
        salesAccountName: input.salesAccountName,
        depositAccountId: input.depositAccountId,
        depositAccountName: input.depositAccountName,
      },
    },
  });
}
