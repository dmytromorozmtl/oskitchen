import type { B2bArCompanyRollup } from "@/lib/integrations/shopify-b2b-ar-dashboard-metadata";

export type B2bCreditLimitConfig = {
  limitCents: number;
  notes?: string;
  updatedAt?: string;
};

export type B2bArCreditLimitRow = {
  companyKey: string;
  companyName: string;
  companyAccountId: string | null;
  limitCents: number | null;
  openAmountCents: number;
  utilizationPct: number | null;
  headroomCents: number | null;
  status: "ok" | "warning" | "blocked" | "unset";
};

export type B2bArAutoReminderSummary = {
  enabled: boolean;
  autoDunningEnabled: boolean;
  operatorDigestEnabled: boolean;
  cadenceDays: number[];
  lastRunAt: string | null;
  lastReminderAt: string | null;
  autoRemindersSent: number;
  digestsSent: number;
  nextEligibleAt: string | null;
};

export function buildB2bArCreditLimitRows(
  companies: B2bArCompanyRollup[],
  limitsByCompanyId: Record<string, B2bCreditLimitConfig>,
): B2bArCreditLimitRow[] {
  return companies
    .map((company) => {
      const limitKey = company.companyAccountId ?? company.companyKey;
      const config = company.companyAccountId
        ? limitsByCompanyId[company.companyAccountId]
        : limitsByCompanyId[company.companyKey];
      const limitCents = config?.limitCents ?? null;

      if (limitCents == null || limitCents <= 0) {
        return {
          companyKey: company.companyKey,
          companyName: company.companyName,
          companyAccountId: company.companyAccountId,
          limitCents: null,
          openAmountCents: company.openAmountCents,
          utilizationPct: null,
          headroomCents: null,
          status: "unset" as const,
        };
      }

      const utilizationPct = Math.round((company.openAmountCents / limitCents) * 100);
      const headroomCents = Math.max(0, limitCents - company.openAmountCents);
      const status: B2bArCreditLimitRow["status"] =
        utilizationPct >= 100 ? "blocked" : utilizationPct >= 85 ? "warning" : "ok";

      return {
        companyKey: company.companyKey,
        companyName: company.companyName,
        companyAccountId: company.companyAccountId,
        limitCents,
        openAmountCents: company.openAmountCents,
        utilizationPct,
        headroomCents,
        status,
      };
    })
    .sort((a, b) => (b.utilizationPct ?? -1) - (a.utilizationPct ?? -1));
}

export function buildB2bArAutoReminderSummary(input: {
  reminderEnabled: boolean;
  autoDunningEnabled: boolean;
  operatorDigestEnabled: boolean;
  cadenceDays: number[] | null;
  lastRunAt: string | null;
  lastReminderAt: string | null;
  dunningStats: {
    autoRemindersSent: number;
    digestsSent: number;
  } | null;
}): B2bArAutoReminderSummary {
  const cadence = input.cadenceDays?.length ? input.cadenceDays : [7, 14, 21];
  const minCadence = Math.min(...cadence);
  let nextEligibleAt: string | null = null;
  if (input.lastRunAt) {
    const next = new Date(input.lastRunAt);
    next.setDate(next.getDate() + minCadence);
    nextEligibleAt = next.toISOString();
  }

  return {
    enabled: input.reminderEnabled,
    autoDunningEnabled: input.autoDunningEnabled,
    operatorDigestEnabled: input.operatorDigestEnabled,
    cadenceDays: cadence,
    lastRunAt: input.lastRunAt,
    lastReminderAt: input.lastReminderAt,
    autoRemindersSent: input.dunningStats?.autoRemindersSent ?? 0,
    digestsSent: input.dunningStats?.digestsSent ?? 0,
    nextEligibleAt,
  };
}
