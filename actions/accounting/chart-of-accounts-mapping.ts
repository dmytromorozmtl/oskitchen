"use server";

import { revalidatePath } from "next/cache";

import { CHART_OF_ACCOUNTS_MAPPING_ROUTE } from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";
import { updateCoaMappingRow } from "@/lib/accounting/chart-of-accounts-mapping-storage";
import { requireReportsPageAccess } from "@/lib/reports/reports-page-access";

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/** Native `<form action>` handler — returns void for React 19 form action typing. */
export async function updateCoaMappingRowAction(formData: FormData): Promise<void> {
  const access = await requireReportsPageAccess("reports.read.financial");
  if (!access.ok) return;

  const pnlLineKey = str(formData, "pnlLineKey");
  const glAccountCode = str(formData, "glAccountCode");
  if (!pnlLineKey || !glAccountCode) return;

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
}
