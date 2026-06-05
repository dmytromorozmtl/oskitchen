import { prisma } from "@/lib/prisma";
import { fetchXeroBankTransactions } from "@/services/integrations/xero/xero-api";
import { getXeroCredentialsForUser } from "@/services/integrations/xero/xero-credentials";
import { exportXeroData } from "@/services/integrations/xero-service";
import { IntegrationProvider } from "@prisma/client";

export type XeroBankReconcileResult = {
  ok: boolean;
  message: string;
  matched?: number;
  unmatched?: number;
  bankTransactions?: number;
  expectedDeposits?: number;
};

/** Match Xero bank RECEIVE transactions against OS Kitchen gross sales deposits. */
export async function reconcileXeroBankTransactions(
  userId: string,
): Promise<XeroBankReconcileResult> {
  const creds = await getXeroCredentialsForUser(userId);
  if (!creds) {
    return { ok: false, message: "Xero is not connected. Complete OAuth first." };
  }

  const [bankRows, payload] = await Promise.all([
    fetchXeroBankTransactions({
      accessToken: creds.accessToken,
      tenantId: creds.tenantId,
    }),
    exportXeroData(userId, "month"),
  ]);

  const expectedDeposit = Math.round(payload.sales.grossSales * 100) / 100;
  let matched = 0;
  let unmatched = 0;

  for (const row of bankRows) {
    const delta = Math.abs(row.amount - expectedDeposit);
    if (expectedDeposit > 0 && delta <= Math.max(1, expectedDeposit * 0.02)) {
      matched += 1;
    } else {
      unmatched += 1;
    }
  }

  const conn = await prisma.integrationConnection.findFirst({
    where: { userId, provider: IntegrationProvider.XERO },
  });
  if (conn) {
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: {
        settingsJson: {
          ...creds.settings,
          lastBankReconcileAt: new Date().toISOString(),
          lastBankMatched: matched,
          lastBankUnmatched: unmatched,
        },
        lastSyncAt: new Date(),
        lastError: null,
      },
    });
  }

  return {
    ok: true,
    message: `Bank reconciliation complete — ${matched} matched, ${unmatched} unmatched of ${bankRows.length} Xero RECEIVE transactions.`,
    matched,
    unmatched,
    bankTransactions: bankRows.length,
    expectedDeposits: expectedDeposit,
  };
}
