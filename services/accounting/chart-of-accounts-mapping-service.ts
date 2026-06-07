import {
  CHART_OF_ACCOUNTS_MAPPING_ABSOLUTE_FINAL_POLICY_ID,
  summarizeCoaMappingCoverage,
  type CoaMappingModel,
} from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";
import { loadCoaMappingRows } from "@/lib/accounting/chart-of-accounts-mapping-storage";
import { fetchQuickBooksChartOfAccounts } from "@/services/integrations/quickbooks/chart-of-accounts.service";
import { getQuickBooksCredentialsForUser } from "@/services/integrations/quickbooks/quickbooks-credentials";

export async function loadChartOfAccountsMappingModel(userId: string): Promise<CoaMappingModel> {
  const mappings = await loadCoaMappingRows(userId);
  const creds = await getQuickBooksCredentialsForUser(userId);

  let quickBooksAccounts: CoaMappingModel["quickBooksAccounts"] = [];

  if (creds) {
    try {
      const chart = await fetchQuickBooksChartOfAccounts(userId);
      quickBooksAccounts = chart.accounts.map((a) => ({
        id: a.id,
        name: a.name,
        accountType: a.accountType,
      }));
    } catch {
      quickBooksAccounts = [];
    }
  }

  return {
    policyId: CHART_OF_ACCOUNTS_MAPPING_ABSOLUTE_FINAL_POLICY_ID,
    mappings,
    summary: summarizeCoaMappingCoverage(mappings),
    quickBooksConnected: Boolean(creds),
    quickBooksAccounts,
    refreshedAt: new Date().toISOString(),
  };
}
