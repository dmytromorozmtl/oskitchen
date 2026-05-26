import { prisma } from "@/lib/prisma";
import { getResendDiagnostics } from "@/lib/notifications/provider-resend";
import {
  computeSettingsHealth,
  type ExternalHealthContext,
  type SectionHealth,
} from "@/lib/settings/health-score";
import { getStripeDiagnostics } from "@/lib/billing/stripe-config";

import {
  integrationConnectionListWhereForOwner,
  notificationRuleListWhereForOwner,
  storefrontDomainListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

import { loadSettingsCenter } from "./settings-center-service";

export type SettingsHealthSnapshot = {
  sections: SectionHealth[];
  external: ExternalHealthContext;
};

export async function loadSettingsHealth(userId: string): Promise<SettingsHealthSnapshot> {
  const [integrationWhere, ruleScope, domainScope] = await Promise.all([
    integrationConnectionListWhereForOwner(userId),
    notificationRuleListWhereForOwner(userId),
    storefrontDomainListWhereForOwner(userId),
  ]);
  const [{ kitchenSettings, payload }, subscription, notificationRules, customDomain, integrationConnections] =
    await Promise.all([
      loadSettingsCenter(userId),
      prisma.subscription.findUnique({
        where: { userId },
        select: { plan: true, status: true },
      }),
      prisma.notificationRule.count({ where: ruleScope }),
      prisma.storefrontDomain.count({ where: domainScope }),
      prisma.integrationConnection.count({ where: integrationWhere }),
    ]);

  let resendOk = false;
  try {
    const diag = getResendDiagnostics();
    resendOk = diag.sendingEnabled;
  } catch {
    resendOk = false;
  }
  let stripeOk = false;
  try {
    stripeOk = getStripeDiagnostics().configured;
  } catch {
    stripeOk = false;
  }

  const external: ExternalHealthContext = {
    notificationProviderConfigured: resendOk,
    stripeConfigured: stripeOk,
    hasActiveStorefrontTheme: Boolean(kitchenSettings?.storefrontThemeKey),
    hasNotificationRules: notificationRules > 0,
    hasCustomDomain: customDomain > 0,
    hasIntegrationConnections: integrationConnections > 0,
    has2FA: false,
  };

  const sections = computeSettingsHealth(kitchenSettings, payload, subscription, external);
  return { sections, external };
}
