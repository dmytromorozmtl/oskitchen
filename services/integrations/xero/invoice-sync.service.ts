import { formatXeroDate } from "@/lib/accounting/xero-export-format";
import { prisma } from "@/lib/prisma";
import { createXeroBill } from "@/services/integrations/xero/xero-api";
import { getXeroCredentialsForUser } from "@/services/integrations/xero/xero-credentials";
import { exportXeroData } from "@/services/integrations/xero-service";
import { IntegrationProvider } from "@prisma/client";

export type XeroInvoiceSyncResult = {
  ok: boolean;
  message: string;
  synced?: number;
  skipped?: number;
};

/** Push unsynced supplier invoices from OS Kitchen to Xero as ACCPAY bills. */
export async function syncXeroSupplierInvoices(userId: string): Promise<XeroInvoiceSyncResult> {
  const creds = await getXeroCredentialsForUser(userId);
  if (!creds) {
    return { ok: false, message: "Xero is not connected. Complete OAuth first." };
  }

  const payload = await exportXeroData(userId, "month");
  const alreadySynced = new Set(creds.settings.syncedInvoiceIds ?? []);
  let synced = 0;
  let skipped = 0;

  for (const invoice of payload.invoices) {
    const invoiceId = String(invoice.id);
    if (alreadySynced.has(invoiceId)) {
      skipped += 1;
      continue;
    }

    const total = Number(invoice.totalAmount ?? 0);
    const result = await createXeroBill({
      accessToken: creds.accessToken,
      tenantId: creds.tenantId,
      contactName: invoice.supplier?.name ?? "Supplier",
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: formatXeroDate(invoice.invoiceDate),
      dueDate: invoice.dueDate ? formatXeroDate(invoice.dueDate) : undefined,
      totalAmount: total,
      accountCode: creds.settings.expenseAccountCode ?? undefined,
      description: `OS Kitchen supplier invoice ${invoice.invoiceNumber}`,
    });

    if (!result.ok) {
      return {
        ok: false,
        message: result.message,
        synced,
        skipped,
      };
    }

    alreadySynced.add(invoiceId);
    synced += 1;
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
          syncedInvoiceIds: [...alreadySynced],
          lastInvoiceSyncAt: new Date().toISOString(),
          lastInvoicesSynced: synced,
        },
        lastSyncAt: new Date(),
        lastError: null,
      },
    });
  }

  return {
    ok: true,
    message:
      synced > 0
        ? `Synced ${synced} supplier invoice(s) to Xero.`
        : "No new supplier invoices to sync.",
    synced,
    skipped,
  };
}
