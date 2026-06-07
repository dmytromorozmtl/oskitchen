import {
  assessMultiCurrencyNetwork,
  MULTI_CURRENCY_POLICY_ID,
  type MultiCurrencyNetworkAssessment,
} from "@/lib/finance/multi-currency-policy";
import { locationListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export type MultiCurrencySettingsModel = {
  policyId: typeof MULTI_CURRENCY_POLICY_ID;
  assessment: MultiCurrencyNetworkAssessment;
};

export async function loadMultiCurrencySettingsModel(
  userId: string,
): Promise<MultiCurrencySettingsModel> {
  const [kitchen, locations, storefronts] = await Promise.all([
    prisma.kitchenSettings.findUnique({
      where: { userId },
      select: { currency: true },
    }),
    prisma.location.findMany({
      where: await locationListWhereForOwner(userId),
      select: { id: true, name: true, taxSettingsJson: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.storefrontSettings.findMany({
      where: { userId },
      select: { id: true, storeSlug: true, currency: true },
      orderBy: { storeSlug: "asc" },
    }),
  ]);

  const workspaceCurrency = kitchen?.currency?.trim() || "USD";

  return {
    policyId: MULTI_CURRENCY_POLICY_ID,
    assessment: assessMultiCurrencyNetwork({
      workspaceCurrency,
      locations,
      storefronts,
    }),
  };
}
