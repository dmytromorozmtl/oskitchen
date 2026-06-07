"use server";

import { revalidatePath } from "next/cache";

import { CHART_OF_ACCOUNTS_MAPPING_ROUTE } from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";
import { updateCoaMappingRow } from "@/lib/accounting/chart-of-accounts-mapping-storage";
import { requireReportsPageAccess } from "@/lib/reports/reports-page-access";

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function updateCoaMappingRowAction(formData: FormData) {
  const access = await requireReportsPageAccess("reports.read.financial");
  if (!access.ok) return { error: access.error };

  const pnlLineKey = str(formData, "pnlLineKey");
  const glAccountCode = str(formData, "glAccountCode");
  if (!pnlLineKey || !glAccountCode) {
    return { error: "P&L line and GL account code are required." };
  }

  const externalAccountId = str(formData, "externalAccountId") || null;
  const externalAccountName = str(formData, "externalAccountName") || null;
  const externalProviderRaw = str(formData, "externalProvider");
  const externalProvider =
    externalProviderRaw === "quickbooks" || externalProviderRaw === "xero"
      ? externalProviderRaw
      : null;

  await updateCoaMappingRow(access.actor.dataUserId, {
    pnlLineKey,
    glAccountCode,
    externalAccountId,
    externalAccountName,
    externalProvider: externalAccountId ? externalProvider ?? "quickbooks" : null,
  });

  revalidatePath(CHART_OF_ACCOUNTS_MAPPING_ROUTE);
  revalidatePath("/dashboard/accounting/gl-sync");

  return { ok: true as const };
}
