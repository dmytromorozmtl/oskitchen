import { subDays } from "date-fns";

import { prisma } from "@/lib/prisma";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { createQuickBooksJournalEntry } from "@/services/integrations/quickbooks/quickbooks-api";
import { getQuickBooksCredentialsForUser } from "@/services/integrations/quickbooks/quickbooks-credentials";
import { exportQuickBooksData } from "@/services/integrations/quickbooks-service";
import { IntegrationProvider } from "@prisma/client";

export type DailySalesJournalResult = {
  ok: boolean;
  message: string;
  amount?: number;
  journalId?: string;
};

/** Post yesterday's gross sales as a balanced QuickBooks journal entry. */
export async function postQuickBooksDailySalesJournal(
  userId: string,
): Promise<DailySalesJournalResult> {
  const creds = await getQuickBooksCredentialsForUser(userId);
  if (!creds) {
    return { ok: false, message: "QuickBooks is not connected. Complete OAuth first." };
  }

  const salesAccountId = creds.settings.salesAccountId?.trim();
  const depositAccountId = creds.settings.depositAccountId?.trim();
  if (!salesAccountId || !depositAccountId) {
    return {
      ok: false,
      message: "Map sales and deposit accounts on the QuickBooks LIVE dashboard first.",
    };
  }

  const payload = await exportQuickBooksData(userId, "month");
  const amount = payload.sales.grossSales;
  if (amount <= 0) {
    return { ok: false, message: "No sales revenue to post for the current period." };
  }

  const txnDate = subDays(new Date(), 1).toISOString().slice(0, 10);
  const memo = `OS Kitchen daily sales ${payload.sales.periodStart} — ${payload.sales.periodEnd} (${payload.sales.orderCount} orders)`;

  const result = await createQuickBooksJournalEntry({
    accessToken: creds.accessToken,
    realmId: creds.realmId,
    txnDate,
    memo,
    debitAccountId: depositAccountId,
    creditAccountId: salesAccountId,
    amount,
  });

  if (!result.ok) return { ok: false, message: result.message };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByProviderWhereForOwner(userId, IntegrationProvider.QUICKBOOKS),
  });
  if (conn) {
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: {
        settingsJson: {
          ...creds.settings,
          lastJournalPostedAt: new Date().toISOString(),
          lastJournalAmount: amount,
        },
        lastSyncAt: new Date(),
        lastError: null,
      },
    });
  }

  return {
    ok: true,
    message: result.message,
    amount,
    journalId: result.journalId,
  };
}
